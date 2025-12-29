import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { signOut } from '@/lib/auth';
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

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-alt)]">
      <Sidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }}
        isAdmin={isAdmin}
        signOutAction={handleSignOut}
      />

      {/* Main content */}
      <main className="pl-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
