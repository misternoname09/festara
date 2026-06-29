import type { Metadata, Viewport } from 'next';
import { Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://festara-seven.vercel.app';

export const metadata: Metadata = {
  title: 'Festara — Tes invitations, à la sénégalaise',
  description:
    'Festara (Yëgël) : invitations de mariage et cérémonies en ligne. RSVP automatique, Pass d\'accès, partage WhatsApp. Pensé pour le Sénégal et la diaspora.',
  metadataBase: new URL(siteUrl),
  keywords: ['invitation', 'mariage', 'sénégal', 'diaspora', 'rsvp', 'pass vip', 'takk', 'ngente'],
  authors: [{ name: 'Festara Team' }],
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: siteUrl,
    title: 'Festara — Tes invitations, à la sénégalaise',
    description: 'La plateforme élégante pour gérer vos événements au Sénégal.',
    siteName: 'Festara',
    // fallback image you can put later
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Festara — Tes invitations, à la sénégalaise',
    description: 'La plateforme élégante pour gérer vos événements au Sénégal.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A1226',
};

// JSON-LD pour l'Organisation
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Festara",
  "url": siteUrl,
  "logo": `${siteUrl}/logo.png`, // Update this if you have a real logo path
  "description": "Plateforme de gestion d'événements et d'invitations digitales pour le Sénégal et la diaspora."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${outfit.variable} ${playfair.variable}`}>
      <body className="bg-festara-sand text-festara-ink font-sans antialiased selection:bg-festara-gold/30 selection:text-festara-navy">
        <Script id="org-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        {children}
      </body>
    </html>
  );
}
