import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://festara-seven.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/i/', '/admin/'], // Bloque les tableaux de bord, l'API, les invitations publiques et l'admin
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
