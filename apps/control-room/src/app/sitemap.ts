import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kupuri-media-cdmx.vercel.app';

const blogSlugs = [
  'ceo-invisible-delegacion-agentes',
  'sistema-operativo-agentico-latam',
  'arbitraje-latam-forex-agentes',
  'como-crear-tu-ceo-invisible',
  'arbitraje-latam-forex',
];

const newspaperSlugs = [
  'fortaleza-peso-mexicano',
  'ia-medicos-jalisco',
  'latam-ecommerce-crecimiento',
  'arbitraje-crypto-latam',
  'migracion-talento-silicon-valley',
  'turismo-cdmx-record',
  'agenda-regulacion-ia-mexico',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/landing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/synthia`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/newspaper`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const newspaperRoutes: MetadataRoute.Sitemap = newspaperSlugs.map(slug => ({
    url: `${baseUrl}/newspaper/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...blogRoutes, ...newspaperRoutes];
}
