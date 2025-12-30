import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-utils';

export default async function SettingsPage() {
  await requireAdmin();
  redirect('/dashboard/settings/site');
}
