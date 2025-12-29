import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';
import { timingSafeEqual, maskEmail, hashForLogging } from '@/lib/security';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const otpLoginSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

// Constants for login security
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_SECONDS = 15 * 60; // 15 minutes
const MAX_OTP_VERIFICATION_ATTEMPTS = 3;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Standard email/password credentials
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        // Check for account lockout
        const lockoutKey = `lockout:${normalizedEmail}`;
        const isLockedOut = await cache.exists(lockoutKey);
        if (isLockedOut) {
          console.warn(`[SECURITY] Login attempt on locked account: ${maskEmail(normalizedEmail)}`);
          return null;
        }

        // Track failed attempts
        const attemptsKey = `login-attempts:${normalizedEmail}`;
        
        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.isActive) {
          // Increment failed attempts even for non-existent users (prevent enumeration)
          await incrementFailedAttempts(attemptsKey, lockoutKey, normalizedEmail);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          await incrementFailedAttempts(attemptsKey, lockoutKey, normalizedEmail);
          console.warn(`[SECURITY] Failed login attempt for: ${maskEmail(normalizedEmail)}`);
          return null;
        }

        // Clear failed attempts on successful login
        await cache.del(attemptsKey);

        // Log successful login
        await db.auditLog.create({
          data: {
            action: 'USER_LOGIN',
            entityType: 'user',
            entityId: user.id,
            userId: user.id,
            newValues: { method: 'credentials', timestamp: new Date().toISOString() },
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          userType: 'user' as const,
        };
      },
    }),
    // Email OTP authentication (for Users and Partners)
    Credentials({
      id: 'email-otp',
      name: 'email-otp',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = otpLoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, code } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        // Verify OTP from Redis with attempt tracking
        const otpKey = `otp:${normalizedEmail}`;
        const storedData = await cache.get<string>(otpKey);

        if (!storedData) {
          console.warn(`[SECURITY] OTP verification with no stored OTP: ${maskEmail(normalizedEmail)}`);
          return null;
        }

        let otpData: { code: string; attempts: number; createdAt: number };
        try {
          otpData = JSON.parse(storedData);
        } catch {
          // Legacy format - just the code string
          otpData = { code: storedData, attempts: 0, createdAt: Date.now() };
        }

        // Check attempt limit
        if (otpData.attempts >= MAX_OTP_VERIFICATION_ATTEMPTS) {
          console.warn(`[SECURITY] OTP max attempts exceeded: ${maskEmail(normalizedEmail)}`);
          await cache.del(otpKey);
          return null;
        }

        // Use timing-safe comparison to prevent timing attacks
        if (!timingSafeEqual(otpData.code, code)) {
          // Increment attempts
          otpData.attempts += 1;
          const remainingTTL = Math.max(0, 600 - Math.floor((Date.now() - otpData.createdAt) / 1000));
          await cache.set(otpKey, JSON.stringify(otpData), remainingTTL);
          console.warn(`[SECURITY] Failed OTP attempt for: ${maskEmail(normalizedEmail)} (attempt ${otpData.attempts})`);
          return null;
        }

        // Delete used OTP immediately
        await cache.del(otpKey);

        // Try to find user first
        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (user && user.isActive) {
          await db.auditLog.create({
            data: {
              action: 'USER_LOGIN',
              entityType: 'user',
              entityId: user.id,
              userId: user.id,
              newValues: { method: 'email-otp', timestamp: new Date().toISOString() },
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            userType: 'user' as const,
          };
        }

        // Try to find partner
        const partner = await db.partner.findUnique({
          where: { email: normalizedEmail },
        });

        if (partner && partner.isActive) {
          return {
            id: partner.id,
            email: partner.email,
            name: partner.name,
            role: 'PARTNER' as const,
            userType: 'partner' as const,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'STAFF' | 'PARTNER';
        session.user.userType = token.userType as 'user' | 'partner';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: true,
});

// Type augmentation for next-auth
declare module 'next-auth' {
  interface User {
    role: 'ADMIN' | 'STAFF' | 'PARTNER';
    userType: 'user' | 'partner';
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'ADMIN' | 'STAFF' | 'PARTNER';
      userType: 'user' | 'partner';
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'STAFF' | 'PARTNER';
    userType: 'user' | 'partner';
  }
}

// Helper function to track failed login attempts
async function incrementFailedAttempts(
  attemptsKey: string,
  lockoutKey: string,
  email: string
): Promise<void> {
  const attempts = await cache.incr(attemptsKey);
  
  // Set expiry on first attempt (1 hour window)
  if (attempts === 1) {
    await cache.expire(attemptsKey, 3600);
  }
  
  // Lock account after max attempts
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    await cache.set(lockoutKey, '1', LOGIN_LOCKOUT_SECONDS);
    console.warn(`[SECURITY] Account locked due to too many failed attempts: ${maskEmail(email)}`);
    
    // Clear the attempts counter
    await cache.del(attemptsKey);
  }
}
