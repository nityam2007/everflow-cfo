import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cache } from 'react';

// Cached auth check for server components
export const getSession = cache(async () => {
  return await auth();
});

// Check if user is authenticated (any role)
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

// Check if user is admin
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  return session;
}

// Check if user is staff or admin
export async function requireStaff() {
  const session = await requireAuth();
  if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
    redirect('/login');
  }
  return session;
}

// Get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

// Check role without redirect
export async function hasRole(role: 'ADMIN' | 'STAFF'): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === role;
}
