import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';

const sendOtpSchema = z.object({
  email: z.string().email(),
});

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

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

    if (!account) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account exists, a code has been sent' },
        { status: 200 }
      );
    }

    if (!account.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Rate limiting: max 5 OTP requests per email per hour
    const rateKey = `otp-rate:${normalizedEmail}`;
    const { allowed } = await cache.rateLimit(rateKey, 5, 3600);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in Redis (expires in 10 minutes)
    const otpKey = `otp:${normalizedEmail}`;
    await cache.set(otpKey, otp, 600);

    // In production, send email here
    // For now, log it (in development)
    console.log(`[OTP] Code for ${normalizedEmail}: ${otp}`);

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // await sendEmail({
    //   to: normalizedEmail,
    //   subject: 'Your EverflowCFO Verification Code',
    //   text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
    // });

    return NextResponse.json(
      { message: 'Verification code sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
