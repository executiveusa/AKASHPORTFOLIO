import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog-content';

export const metadata = {
  title: 'Blog | Kupuri Media™',
  description: 'IA, automatización y negocios digitales para emprendedoras LATAM.',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-20 max-w-4xl mx-auto">
      <header className="mb-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-3">Kupuri Media™ Blog</p>
        <h1 className="text-4xl font-bold tracking-tight">IA para tu negocio</h1>
        <p className="mt-4 text-zinc-400 max-w-xl">
          Automatización, arbitraje de divisas, freelance LATAM y más — en español primero.
        </p>
      </header>

      <div className="grid gap-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-zinc-800 pb-8">
            <Link href={`/blog/${post.slug}`} className="group">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">{post.date}</p>
              <h2 className="text-xl font-semibold group-hover:text-violet-400 transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-zinc-400 text-sm leading-relaxed">{post.excerpt}</p>
              <span className="inline-block mt-3 text-xs text-violet-500 group-hover:underline">
                Leer más →
              </span>
            </Link>
            <div className="flex gap-2 mt-3 flex-wrap">
              {post.tags?.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <p className="text-zinc-500 text-sm">Artículos próximamente...</p>
        )}
      </div>
    </main>
  );
}
