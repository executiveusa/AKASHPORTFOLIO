import PublicNav from './PublicNav';
import Footer from './Footer';

/**
 * Wraps public-facing pages with shared navigation and footer.
 * Cockpit pages should NOT use this — they have their own sidebar layout.
 */
export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-charcoal-900)' }}>
      <PublicNav />
      <main style={{ flex: 1, paddingTop: 56 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
