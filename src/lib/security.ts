/**
 * Security Utilities
 * Centralized security functions for input sanitization, validation, and protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/\\/g, '&#x5C;');
}

/**
 * Sanitize object recursively - sanitizes all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeHtml(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Remove null bytes and other dangerous characters from strings
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

/**
 * Sanitize phone number - keep only digits, +, and common separators
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  // Keep only digits, +, spaces, hyphens, and parentheses
  return phone
    .replace(/[^\d+\s\-()]/g, '')
    .trim();
}

// ============================================
// SECURE RANDOM GENERATION
// ============================================

/**
 * Generate cryptographically secure OTP
 */
export function generateSecureOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  
  return otp;
}

/**
 * Generate cryptographically secure token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data for logging (e.g., partial email, IP)
 */
export function hashForLogging(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 8);
}

// ============================================
// PASSWORD VALIDATION
// ============================================

export const passwordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * Enhanced password schema with strong requirements
 */
export const strongPasswordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
  .refine(
    (password) => !commonPasswords.includes(password.toLowerCase()),
    'This password is too common. Please choose a stronger password.'
  );

// Common passwords to reject (abbreviated list - should be expanded in production)
const commonPasswords = [
  'password', '123456', 'password123', 'admin123', 'letmein', 'welcome',
  'monkey', 'dragon', 'master', 'qwerty', 'login', 'abc123', 'admin',
  'password1', '12345678', 'sunshine', 'princess', 'football', 'iloveyou',
  'trustno1', 'welcome1', 'password1234', 'admin1234', 'passw0rd',
];

/**
 * Check password strength and return score
 */
export function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 12) score += 25;
  else feedback.push('Use at least 12 characters');

  if (password.length >= 16) score += 10;

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Add uppercase letters');

  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Add lowercase letters');

  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
  else feedback.push('Add special characters');

  if (commonPasswords.includes(password.toLowerCase())) {
    score = Math.max(0, score - 50);
    feedback.push('Avoid common passwords');
  }

  return { score: Math.min(100, score), feedback };
}

// ============================================
// RATE LIMITING HELPERS
// ============================================

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const rateLimits = {
  // Strict limits for auth endpoints
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 min
  otp: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 OTP requests per hour (was 3)
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 per hour
  
  // Moderate limits for API
  apiRead: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute
  apiWrite: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 per minute
  
  // Lead submission (public)
  leadSubmission: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 per hour
  
  // Checkout (payment flow)
  checkout: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 per hour
  
  // Export (heavy operation)
  export: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 per hour
};

// ============================================
// REQUEST VALIDATION
// ============================================

/**
 * Get client IP with proxy support
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    // Get first IP in chain (original client)
    return forwarded.split(',')[0].trim();
  }
  
  return realIp || 'unknown';
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate CUID format (Prisma default IDs)
 */
export function isValidCUID(id: string): boolean {
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(id);
}

/**
 * Validate ID (supports both UUID and CUID)
 */
export function isValidId(id: string): boolean {
  return isValidUUID(id) || isValidCUID(id);
}

// ============================================
// SECURE RESPONSE HELPERS
// ============================================

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
  );
  
  return response;
}

/**
 * Create secure JSON response with headers
 */
export function secureJsonResponse(
  data: unknown,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  return addSecurityHeaders(response);
}

/**
 * Create secure error response (no sensitive details)
 */
export function secureErrorResponse(
  message: string,
  status: number = 500
): NextResponse {
  // Log the actual error server-side but don't expose to client
  const response = NextResponse.json(
    { error: message },
    { status }
  );
  return addSecurityHeaders(response);
}

// ============================================
// AUDIT LOGGING HELPERS
// ============================================

export interface AuditContext {
  userId?: string;
  partnerId?: string;
  ip: string;
  userAgent?: string;
  action: string;
  entityType: string;
  entityId: string;
}

/**
 * Create audit log data with security context
 */
export function createAuditData(
  request: NextRequest,
  context: Omit<AuditContext, 'ip' | 'userAgent'>
): AuditContext {
  return {
    ...context,
    ip: hashForLogging(getClientIP(request)), // Hash IP for privacy
    userAgent: request.headers.get('user-agent')?.slice(0, 200) || undefined,
  };
}

// ============================================
// TIMING-SAFE COMPARISON
// ============================================

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  
  return crypto.timingSafeEqual(bufferA, bufferB);
}

// ============================================
// DATA MASKING FOR LOGS
// ============================================

/**
 * Mask email for logging (show first 2 chars and domain)
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

/**
 * Mask phone number for logging
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '***';
  return `***${phone.slice(-4)}`;
}

/**
 * Mask sensitive fields in object for logging
 */
export function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'otp', 'code'];
  const masked: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      masked[key] = '[REDACTED]';
    } else if (key === 'email' && typeof value === 'string') {
      masked[key] = maskEmail(value);
    } else if (key === 'phone' && typeof value === 'string') {
      masked[key] = maskPhone(value);
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}
