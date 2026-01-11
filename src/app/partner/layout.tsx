import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { PartnerHeader } from '@/components/partner-header';
import { PartnerSidebar } from '@/components/partner-sidebar';

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
    <div className="min-h-screen bg-[var(--color-background-alt)] flex">
      {/* Sidebar - Desktop only */}
      <PartnerSidebar userName={session.user.name} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <PartnerHeader user={{ name: session.user.name, email: session.user.email }} />

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
