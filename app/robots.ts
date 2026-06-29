import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://festara-seven.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/i/'], // Bloque les tableaux de bord, l'API et les invitations publiques
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
