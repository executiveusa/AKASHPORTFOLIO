import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to landing page or dashboard based on auth
  redirect('/landing');
}
