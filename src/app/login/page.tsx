'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Loader2, ArrowRight } from 'lucide-react';

type AuthMode = 'credentials' | 'email-otp';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [authMode, setAuthMode] = useState<AuthMode>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const redirectPath = session.user.userType === 'partner' ? '/partner' : '/dashboard';
      router.replace(redirectPath);
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto mb-4" />
          <p className="text-[var(--color-foreground-muted)] text-[var(--text-sm)]">Redirecting...</p>
        </div>
      </div>
    );
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try user credentials first (admin/staff)
      let result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      // If user login fails, try partner credentials
      if (result?.error) {
        result = await signIn('partner-credentials', {
          email,
          password,
          redirect: false,
        });
      }

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.refresh();
        // Router will handle redirect based on userType in layout
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send code');
      }

      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('email-otp', {
        email: otpEmail,
        code: otpCode,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid or expired code');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-alt)]">
      <Header />
      <main className="pt-14 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-sm px-6">
          <div className="ef-card p-8">
            <div className="text-center mb-8">
              <div className="ef-logo-icon mx-auto mb-4 w-10 h-10">
                EF
              </div>
              <p className="ef-section-label mb-2">STAFF & PARTNER PORTAL</p>
              <h1 className="ef-section-title text-2xl">Sign in</h1>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex gap-2 mb-8">
              <button
                type="button"
                className={`flex-1 py-2 text-[var(--text-sm)] font-medium border ${
                  authMode === 'credentials' 
                    ? 'bg-brand text-white border-[var(--brand-primary)]' 
                    : 'bg-[var(--color-background)] text-[var(--color-foreground-muted)] border-[var(--color-border)] hover:bg-[var(--color-background-alt)]'
                }`}
                onClick={() => { setAuthMode('credentials'); setError(''); }}
              >
                Password
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-[var(--text-sm)] font-medium border ${
                  authMode === 'email-otp' 
                    ? 'bg-brand text-white border-[var(--brand-primary)]' 
                    : 'bg-[var(--color-background)] text-[var(--color-foreground-muted)] border-[var(--color-border)] hover:bg-[var(--color-background-alt)]'
                }`}
                onClick={() => { setAuthMode('email-otp'); setError(''); setOtpSent(false); }}
              >
                Email Code
              </button>
            </div>

            {/* Credentials Form */}
            {authMode === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="ef-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="ef-input"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="ef-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="ef-input"
                  />
                </div>

                {error && (
                  <p className="text-[var(--color-error)] text-[var(--text-xs)]">{error}</p>
                )}

                <button type="submit" className="ef-btn ef-btn-primary w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>
            )}

            {/* Email OTP Form */}
            {authMode === 'email-otp' && !otpSent && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label htmlFor="otp-email" className="ef-label">Work Email</label>
                  <input
                    id="otp-email"
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="ef-input"
                  />
                  <p className="text-[var(--text-xs)] text-[var(--color-foreground-muted)] mt-2">
                    We'll send a verification code to your email
                  </p>
                </div>

                {error && (
                  <p className="text-[var(--color-error)] text-[var(--text-xs)]">{error}</p>
                )}

                <button type="submit" className="ef-btn ef-btn-primary w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* OTP Verification Form */}
            {authMode === 'email-otp' && otpSent && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-[var(--text-sm)] text-[var(--color-foreground-muted)]">
                    Code sent to <span className="font-medium text-[var(--color-foreground)]">{otpEmail}</span>
                  </p>
                </div>

                <div>
                  <label htmlFor="otp-code" className="ef-label">Verification Code</label>
                  <input
                    id="otp-code"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    required
                    className="ef-input text-center text-xl tracking-widest"
                    maxLength={6}
                  />
                </div>

                {error && (
                  <p className="text-[var(--color-error)] text-[var(--text-xs)]">{error}</p>
                )}

                <button type="submit" className="ef-btn ef-btn-primary w-full" disabled={loading || otpCode.length !== 6}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign in'
                  )}
                </button>

                <button
                  type="button"
                  className="w-full py-2 text-[var(--text-sm)] text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
                  onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); }}
                >
                  Use different email
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-[var(--text-sm)] text-[var(--color-foreground-muted)] hover:text-brand">
              ← Return to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
