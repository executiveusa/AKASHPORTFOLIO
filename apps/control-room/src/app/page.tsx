import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Root route — first-run gate (server component).
 * AUTH BYPASS ACTIVE FOR TESTING — session check disabled.
 * Restore: uncomment `const session = await auth()` block and re-add `import { auth } from '@/auth'`.
 *
 * No cookie `synthia_seen` → /bienvenida (first-run flow).
 * Cookie present → /dashboard.
 */
export default async function Home() {
  const store = await cookies();
  const seen = store.get('synthia_seen');
  redirect(seen?.value ? '/dashboard' : '/bienvenida');
}
