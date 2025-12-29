import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { PartnerHeader } from '@/components/partner-header';

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Must be authenticated
  if (!session?.user) {
    redirect('/login');
  }

  // Must be a partner
  if (session.user.userType !== 'partner') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-alt)]">
      <PartnerHeader user={{ name: session.user.name }} />

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
