import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EverflowCFO | Recover the Payroll Credits You\'re Owed',
  description: 'Restaurants, hotels, and small businesses—federal programs return billions annually. Take our 2-minute quiz to find your potential refund.',
  keywords: ['payroll credits', 'ERC', 'employee retention credit', 'WOTC', 'FICA tip credit', 'tax credits', 'IRS refund'],
  authors: [{ name: 'EverflowCFO' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'EverflowCFO | Recover the Payroll Credits You\'re Owed',
    description: 'Federal programs return billions annually. Take our 2-minute quiz to find your potential refund.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="min-h-screen antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
