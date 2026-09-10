import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Root route — session + first-run gate.
 * No session → /landing (public page).
 * Session + no synthia_seen cookie → /bienvenida (first-run).
 * Session + cookie → /dashboard.
 */
export default async function Home() {
  const session = await auth();
  if (!session) redirect('/landing');
  const store = await cookies();
  const seen = store.get('synthia_seen');
  redirect(seen?.value ? '/dashboard' : '/bienvenida');
}
