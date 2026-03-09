import Link from 'next/link';

export default function LandingIndexPage() {
  return (
    <div>
      <h1>Landing Pages</h1>
      <ul>
        <li>
          <Link href="/landing">
            <a>Primary Landing Page</a>
          </Link>
        </li>
        {/* Add more landing page links here as needed */}
      </ul>
    </div>
  );
}