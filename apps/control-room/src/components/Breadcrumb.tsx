'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const PAGE_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Home', href: '/' }],
  '/landing': [{ label: 'Home', href: '/' }, { label: 'Landing', href: '/landing' }],
  '/dashboard': [{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }],
  '/spheres': [{ label: 'Home', href: '/' }, { label: 'Spheres', href: '/spheres' }],
  '/skills': [{ label: 'Home', href: '/' }, { label: 'Skills', href: '/skills' }],
  '/blog': [{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }],
  '/newspaper': [{ label: 'Home', href: '/' }, { label: 'El Panorama', href: '/newspaper' }],
  '/onboarding': [{ label: 'Home', href: '/' }, { label: 'Onboarding', href: '/onboarding' }],
  '/cockpit': [{ label: 'Cockpit', href: '/cockpit' }],
  '/cockpit/dashboard': [
    { label: 'Cockpit', href: '/cockpit' },
    { label: 'Dashboard', href: '/cockpit/dashboard' },
  ],
  '/cockpit/tasks': [
    { label: 'Cockpit', href: '/cockpit' },
    { label: 'Tasks', href: '/cockpit/tasks' },
  ],
  '/cockpit/theater': [
    { label: 'Cockpit', href: '/cockpit' },
    { label: 'Theater', href: '/cockpit/theater' },
  ],
  '/cockpit/watcher': [
    { label: 'Cockpit', href: '/cockpit' },
    { label: 'Watcher', href: '/cockpit/watcher' },
  ],
};

export function Breadcrumb() {
  const pathname = usePathname();
  
  // Find matching breadcrumb path (exact or prefix match)
  let breadcrumbs = PAGE_BREADCRUMBS[pathname];
  
  if (!breadcrumbs) {
    // Try prefix match for nested routes
    const matchingPath = Object.keys(PAGE_BREADCRUMBS).find(
      (key) => pathname.startsWith(key) && key !== '/'
    );
    breadcrumbs = matchingPath ? PAGE_BREADCRUMBS[matchingPath] : PAGE_BREADCRUMBS['/'];
  }

  if (!breadcrumbs || breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumb for home page only
  }

  return (
    <nav className="flex items-center gap-2 text-sm py-4 px-6 border-b border-slate-800">
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <span className="text-slate-600">/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-slate-400 font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="text-slate-400 hover:text-slate-300 transition">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
