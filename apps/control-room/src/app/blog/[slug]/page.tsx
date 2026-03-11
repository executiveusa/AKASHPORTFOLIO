import { getBlogPost, getBlogPosts } from '@/lib/blog-content';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Kupuri Media™`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-20 max-w-3xl mx-auto">
      <a href="/blog" className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors mb-8 inline-block">
        ← Blog
      </a>
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">{post.date}</p>
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <p className="mt-3 text-zinc-400">{post.excerpt}</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          {post.tags?.map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <article
        className="prose prose-invert prose-zinc prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <footer className="mt-16 pt-8 border-t border-zinc-800 text-xs text-zinc-600">
        Generado con ALEX™ · Kupuri Media™
      </footer>
    </main>
  );
}
