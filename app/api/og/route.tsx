import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

// Utilise le Node runtime (pas Edge) pour compatibilité avec Supabase
// export const runtime = 'edge'; // REMOVED — incompatible avec cookies/Supabase SSR

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return new Response('Slug is required', { status: 400 });
    }

    // Client Supabase léger (pas besoin de cookies ici, lecture publique uniquement)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Événement de démo
    if (slug === 'demo') {
      return generateOgImage(
        'Mariage Aïda & Modou',
        'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
        'vendredi 19 décembre 2026'
      );
    }

    const { data: event, error } = await supabase
      .from('events')
      .select('title, couple_photo_url, ceremonies, is_published')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error || !event) {
      return new Response('Not Found', { status: 404 });
    }

    // Extract photo url
    let imageUrl = '';
    if (event.couple_photo_url) {
      try {
        const parsed = JSON.parse(event.couple_photo_url);
        if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
        else imageUrl = event.couple_photo_url;
      } catch {
        imageUrl = event.couple_photo_url;
      }
    }

    const title = event.title || 'Célébration';
    const ceremonies = event.ceremonies as any[];
    const dateStr = ceremonies?.[0]?.date 
      ? new Date(ceremonies[0].date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : '';

    return generateOgImage(title, imageUrl, dateStr);
  } catch (e) {
    console.error('OG image generation error:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}

function generateOgImage(title: string, imageUrl: string, dateStr: string) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A1226',
          backgroundImage: imageUrl ? 'none' : 'linear-gradient(135deg, #0A1226 0%, #0B5959 50%, #C59A45 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background image si fournie */}
        {imageUrl && (
          <img
            src={imageUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.5,
            }}
          />
        )}
        {/* Content overlay */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(10, 18, 38, 0.85)',
            padding: '60px 100px',
            borderRadius: '40px',
            border: '4px solid #C59A45',
            zIndex: 10,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <span
            style={{
              fontSize: 32,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#DFB769',
              marginBottom: 20,
              fontWeight: 'bold',
            }}
          >
            Vous êtes invité(e)
          </span>
          <span
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              fontFamily: 'Georgia, serif',
              textAlign: 'center',
              marginBottom: 30,
              lineHeight: 1.1,
            }}
          >
            {title}
          </span>
          {dateStr && (
            <span
              style={{
                fontSize: 36,
                color: '#fff',
                opacity: 0.9,
                textTransform: 'capitalize',
              }}
            >
              {dateStr}
            </span>
          )}
          <span
            style={{
              fontSize: 22,
              color: '#C59A45',
              marginTop: 25,
              letterSpacing: '0.15em',
              fontWeight: 'bold',
            }}
          >
            FESTARA
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
