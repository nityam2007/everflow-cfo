import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const otpLoginSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

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

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // Log successful login
        await db.auditLog.create({
          data: {
            action: 'USER_LOGIN',
            entityType: 'user',
            entityId: user.id,
            userId: user.id,
            newValues: { method: 'credentials' },
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
        const normalizedEmail = email.toLowerCase();

        // Verify OTP from Redis
        const otpKey = `otp:${normalizedEmail}`;
        const storedOtp = await cache.get(otpKey);

        if (!storedOtp || storedOtp !== code) {
          return null;
        }

        // Delete used OTP
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
              newValues: { method: 'email-otp' },
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
