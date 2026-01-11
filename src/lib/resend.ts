import { Resend } from 'resend';
import { OTPEmailTemplate } from '@/components/emails/otp-email';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'EverflowCFO <noreply@everflowcfo.com>';

interface SendOTPEmailParams {
  to: string;
  code: string;
  expiresInMinutes?: number;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send OTP verification email using Resend
 */
export async function sendOTPEmail({
  to,
  code,
  expiresInMinutes = 10,
}: SendOTPEmailParams): Promise<SendEmailResult> {
  try {
    // In development without API key, just log
    if (!process.env.RESEND_API_KEY) {
      console.log(`[DEV] Would send OTP email to ${to} with code: ${code}`);
      return { success: true, messageId: 'dev-mock-id' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Your EverflowCFO Verification Code',
      react: OTPEmailTemplate({ code, expiresInMinutes }),
    });

    if (error) {
      console.error('[RESEND] Failed to send OTP email:', error);
      return { success: false, error: error.message };
    }

    console.log(`[RESEND] OTP email sent successfully to ${to}, messageId: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[RESEND] Error sending OTP email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

interface SendGenericEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
  replyTo?: string;
}

/**
 * Send a generic email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  react,
  replyTo,
}: SendGenericEmailParams): Promise<SendEmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[DEV] Would send email to ${to} with subject: ${subject}`);
      return { success: true, messageId: 'dev-mock-id' };
    }

    const toAddresses = Array.isArray(to) ? to : [to];

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toAddresses,
      subject,
      html,
      text,
      react,
      replyTo,
    });

    if (error) {
      console.error('[RESEND] Failed to send email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[RESEND] Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Export the resend instance for advanced usage
export { resend };
