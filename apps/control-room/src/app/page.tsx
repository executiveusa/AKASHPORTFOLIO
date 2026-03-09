import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  // redirect('/landing');
  // Provide navigation to landing pages
  return (
    <div>
      <h1>Welcome</h1>
      <ul>
        <li><Link href="/landing-index"><a>Landing Pages Index</a></Link></li>
        <li><Link href="/landing"><a>Primary Landing Page</a></Link></li>
      </ul>
    </div>
  );
}
