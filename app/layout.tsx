import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Festara — Tes invitations, à la sénégalaise',
  description:
    'Festara (Yëgël) : invitations de mariage et cérémonies en ligne. RSVP automatique, Pass d\'accès, partage WhatsApp. Pensé pour le Sénégal et la diaspora.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A2A4A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-festara-sand text-festara-ink font-sans">{children}</body>
    </html>
  );
}
