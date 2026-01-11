import * as React from 'react';

interface OTPEmailTemplateProps {
  code: string;
  expiresInMinutes?: number;
}

export function OTPEmailTemplate({ 
  code, 
  expiresInMinutes = 10 
}: OTPEmailTemplateProps) {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px 20px',
      backgroundColor: '#ffffff',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center' as const,
        marginBottom: '40px',
      }}>
        <h1 style={{
          color: '#1a1a2e',
          fontSize: '28px',
          fontWeight: '700',
          margin: '0',
        }}>
          EverflowCFO
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          margin: '8px 0 0',
        }}>
          Strategic Financial Intelligence
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        padding: '40px 30px',
        textAlign: 'center' as const,
      }}>
        <h2 style={{
          color: '#1a1a2e',
          fontSize: '20px',
          fontWeight: '600',
          margin: '0 0 16px',
        }}>
          Your Verification Code
        </h2>
        
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '0 0 24px',
          lineHeight: '1.5',
        }}>
          Enter this code to sign in to your account:
        </p>

        {/* OTP Code */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '2px dashed #10b981',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <span style={{
            color: '#1a1a2e',
            fontSize: '36px',
            fontWeight: '700',
            letterSpacing: '8px',
            fontFamily: 'monospace',
          }}>
            {code}
          </span>
        </div>

        <p style={{
          color: '#9ca3af',
          fontSize: '14px',
          margin: '0',
        }}>
          This code expires in <strong>{expiresInMinutes} minutes</strong>
        </p>
      </div>

      {/* Security Notice */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        borderLeft: '4px solid #f59e0b',
      }}>
        <p style={{
          color: '#92400e',
          fontSize: '14px',
          margin: '0',
          lineHeight: '1.5',
        }}>
          <strong>Security tip:</strong> Never share this code with anyone. 
          EverflowCFO will never ask you for your code via phone or email.
        </p>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '40px',
        textAlign: 'center' as const,
        borderTop: '1px solid #e5e7eb',
        paddingTop: '24px',
      }}>
        <p style={{
          color: '#9ca3af',
          fontSize: '12px',
          margin: '0 0 8px',
        }}>
          If you didn&apos;t request this code, you can safely ignore this email.
        </p>
        <p style={{
          color: '#9ca3af',
          fontSize: '12px',
          margin: '0',
        }}>
          © {new Date().getFullYear()} EverflowCFO. All rights reserved.
        </p>
      </div>
    </div>
  );
}
