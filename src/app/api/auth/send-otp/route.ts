import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';
import { 
  generateSecureOTP, 
  sanitizeEmail, 
  getClientIP,
  hashForLogging,
  maskEmail,
  secureErrorResponse,
  addSecurityHeaders,
  rateLimits 
} from '@/lib/security';

const sendOtpSchema = z.object({
  email: z.string().email(),
});

// Constants for OTP security
const OTP_EXPIRY_SECONDS = 600; // 10 minutes
const MAX_OTP_ATTEMPTS = 3;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return secureErrorResponse('Valid email is required', 400);
    }

    const { email } = parsed.data;
    const normalizedEmail = sanitizeEmail(email);
    const clientIP = getClientIP(request);

    // Rate limiting: max 3 OTP requests per email per hour
    const emailRateKey = `otp-rate:${normalizedEmail}`;
    const { allowed: emailAllowed } = await cache.rateLimit(emailRateKey, rateLimits.otp.maxRequests, rateLimits.otp.windowMs / 1000);

    if (!emailAllowed) {
      console.warn(`[SECURITY] OTP rate limit exceeded for email: ${maskEmail(normalizedEmail)}, IP: ${hashForLogging(clientIP)}`);
      return secureErrorResponse('Too many requests. Please try again later.', 429);
    }

    // Additional IP-based rate limiting
    const ipRateKey = `otp-rate-ip:${hashForLogging(clientIP)}`;
    const { allowed: ipAllowed } = await cache.rateLimit(ipRateKey, 10, 3600);

    if (!ipAllowed) {
      console.warn(`[SECURITY] OTP IP rate limit exceeded: ${hashForLogging(clientIP)}`);
      return secureErrorResponse('Too many requests. Please try again later.', 429);
    }

    // Check if user exists (either User or Partner)
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, isActive: true },
    });

    const partner = !user ? await db.partner.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, isActive: true },
    }) : null;

    const account = user || partner;

    // Always return success message to prevent email enumeration
    const successResponse = NextResponse.json(
      { message: 'If an account exists, a code has been sent' },
      { status: 200 }
    );
    addSecurityHeaders(successResponse);

    if (!account) {
      // Log potential enumeration attempt
      console.info(`[SECURITY] OTP request for non-existent email: ${maskEmail(normalizedEmail)}`);
      return successResponse;
    }

    if (!account.isActive) {
      console.info(`[SECURITY] OTP request for inactive account: ${maskEmail(normalizedEmail)}`);
      return successResponse;
    }

    // Generate cryptographically secure OTP
    const otp = generateSecureOTP(6);
    
    // Store OTP with attempt counter in Redis
    const otpKey = `otp:${normalizedEmail}`;
    const otpData = JSON.stringify({
      code: otp,
      attempts: 0,
      createdAt: Date.now(),
    });
    await cache.set(otpKey, otpData, OTP_EXPIRY_SECONDS);

    // In production, send email here
    // For development, log it securely
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV OTP] Code for ${maskEmail(normalizedEmail)}: ${otp}`);
    }

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // await sendEmail({
    //   to: normalizedEmail,
    //   subject: 'Your EverflowCFO Verification Code',
    //   text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    // });

    return successResponse;
  } catch (error) {
    console.error('[ERROR] Send OTP error:', error);
    return secureErrorResponse('Internal server error', 500);
  }
}
