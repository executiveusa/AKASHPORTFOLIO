import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Root route — authentication + first-run gate (async server component).
 *
 * No session → /landing (public marketing/landing page).
 * Session + no cookie `synthia_seen` → /bienvenida (60-second first-run flow).
 * Session + cookie present → /dashboard (normal operator entry).
 *
 * Requires: no `/` redirect in next.config.ts (redirects() must not include `/`).
 */
export default async function Home() {
  const session = await auth();
  if (!session) redirect('/landing');
  const store = await cookies();
  const seen = store.get('synthia_seen');
  redirect(seen?.value ? '/dashboard' : '/bienvenida');
}
