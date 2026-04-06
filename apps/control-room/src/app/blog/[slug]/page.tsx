import Link from 'next/link';
import { getBlogPost, getBlogPosts } from '@/lib/blog-content';
import Footer from '@/components/Footer';

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  return {
    title: post?.title ? `${post.title} | Kupuri Media™` : 'Blog | Kupuri Media™',
    description: post?.excerpt || 'IA, automatización y negocios digitales para emprendedoras LATAM.',
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-charcoal-900)', color: 'var(--color-cream-100)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Artículo no encontrado</h1>
          <p style={{ fontSize: 16, color: 'var(--color-cream-400)', marginBottom: 32 }}>
            El artículo que buscas no existe o ha sido removido.
          </p>
          <Link href="/blog" style={{ color: 'var(--color-gold-400)', textDecoration: 'none', fontWeight: 600 }}>
            ← Volver al Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <main style={{ minHeight: '100vh', background: 'var(--color-charcoal-900)', color: 'var(--color-cream-100)', paddingTop: 60 }}>
        <article style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
          {/* Header */}
          <header style={{ marginBottom: 48 }}>
            <Link href="/blog" style={{ fontSize: 13, color: 'var(--color-cream-400)', textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>
              ← Volver al Blog
            </Link>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-cream-600)', marginBottom: 8 }}>
              {post.date}
            </p>
            <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
              {post.title}
            </h1>
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 11, padding: '4px 10px', background: 'var(--color-charcoal-800)', borderRadius: 4, color: 'var(--color-cream-400)', border: '1px solid var(--color-charcoal-600)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: 'var(--color-cream-200)',
            }}
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {/* Footer */}
          <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--color-charcoal-700)' }}>
            <p style={{ fontSize: 14, color: 'var(--color-cream-400)' }}>
              ¿Te gustó este artículo? Suscríbete a El Panorama para recibir más contenido como este directamente en tu correo.
            </p>
            <Link href="/newspaper" style={{ display: 'inline-block', marginTop: 16, padding: '8px 20px', background: 'var(--color-gold-600)', color: 'var(--color-charcoal-900)', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
              Leer más en El Panorama →
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
