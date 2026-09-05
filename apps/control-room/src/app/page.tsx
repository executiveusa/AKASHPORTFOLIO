import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Root route — first-run gate (server component).
 *
 * Reads cookie `synthia_seen`; absent → /bienvenida (60-second first-run flow);
 * present → /dashboard (normal entry).
 *
 * The public Kupuri Media landing is served from public/index.html
 * via the beforeFiles rewrite in next.config.ts and runs before this component.
 * This page only executes if the rewrite is absent or the visitor has a session.
 */
export default async function Home() {
  const store = await cookies();
  const seen = store.get('synthia_seen');
  redirect(seen?.value ? '/dashboard' : '/bienvenida');
}
