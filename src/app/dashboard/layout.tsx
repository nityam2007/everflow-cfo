import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { Sidebar } from '@/components/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  // Redirect partners to partner portal
  if (session.user.userType === 'partner') {
    redirect('/partner');
  }

  const isAdmin = session.user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[var(--color-background-alt)]">
      <Sidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }}
        isAdmin={isAdmin}
      />

      {/* Main content - responsive left padding for sidebar */}
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
