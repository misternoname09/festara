import type { Metadata, Viewport } from 'next';
import { Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'Festara — Tes invitations, à la sénégalaise',
  description:
    'Festara (Yëgël) : invitations de mariage et cérémonies en ligne. RSVP automatique, Pass d\'accès, partage WhatsApp. Pensé pour le Sénégal et la diaspora.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A1226',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${outfit.variable} ${playfair.variable}`}>
      <body className="bg-festara-sand text-festara-ink font-sans antialiased selection:bg-festara-gold/30 selection:text-festara-navy">
        {children}
      </body>
    </html>
  );
}
