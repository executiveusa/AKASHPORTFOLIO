import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kupuri-media-cdmx.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/landing',
          '/synthia',
          '/blog',
          '/blog/',
          '/newspaper',
          '/newspaper/',
        ],
        disallow: [
          '/api/',
          '/dashboard',
          '/cockpit',
          '/panorama',
          '/onboarding',
          '/proyecto',
          '/auth/',
          '/admin',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
