import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cache } from 'react';

// Cached auth check for server components
export const getSession = cache(async () => {
  return await auth();
});

// Alias for compatibility with API routes
export const getServerSession = getSession;

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

// Check if user is staff or admin (internal users)
export async function requireStaff() {
  const session = await requireAuth();
  if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
    redirect('/login');
  }
  return session;
}

// Check if user is partner
export async function requirePartner() {
  const session = await requireAuth();
  if (session.user.role !== 'PARTNER') {
    redirect('/login');
  }
  return session;
}

// Check if user is internal (admin or staff)
export async function requireInternal() {
  const session = await requireAuth();
  if (session.user.userType !== 'user') {
    redirect('/partner');
  }
  return session;
}

// Get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

// Check role without redirect
export async function hasRole(role: 'ADMIN' | 'STAFF' | 'PARTNER'): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === role;
}

// Check if user is internal (admin or staff)
export async function isInternalUser(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.userType === 'user';
}

// Check if user is partner
export async function isPartner(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.userType === 'partner';
}

// Check if user is admin (without redirect)
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === 'ADMIN';
}

// Check if user is staff (without redirect)
export async function isStaff(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === 'STAFF';
}
