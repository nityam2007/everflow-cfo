import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'EverflowCFO | Payroll Credit Pre-Assessment',
  description: 'Federal payroll credits can return six- and seven-figure refunds to qualifying employers. Evaluate your preliminary eligibility across ERC, TIP, and hiring credits.',
  keywords: ['payroll credits', 'ERC', 'employee retention credit', 'WOTC', 'tax credits'],
  authors: [{ name: 'EverflowCFO' }],
  openGraph: {
    title: 'EverflowCFO | Payroll Credit Pre-Assessment',
    description: 'Evaluate your preliminary eligibility for federal payroll credits.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
