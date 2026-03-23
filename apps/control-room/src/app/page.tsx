import { redirect } from 'next/navigation';

/**
 * Root route fallback — redirects to /dashboard.
 * The public Kupuri Media landing is served from public/index.html
 * via the beforeFiles rewrite in next.config.ts.
 * This page only executes if the rewrite fails.
 */
export default function Home() {
  redirect('/dashboard');
}
