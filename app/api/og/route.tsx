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
  const hasImage = imageUrl && imageUrl.length > 5;

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
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background: photo du couple OU motif décoratif mariage */}
        {hasImage ? (
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
        ) : (
          /* Fond décoratif premium quand pas de photo */
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', background: 'linear-gradient(145deg, #0A1226 0%, #121B2F 30%, #0B5959 60%, #0A1226 100%)' }}>
            {/* Cercle doré en haut à droite */}
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,154,69,0.3) 0%, transparent 70%)', display: 'flex' }}></div>
            {/* Cercle doré en bas à gauche */}
            <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,154,69,0.2) 0%, transparent 70%)', display: 'flex' }}></div>
            {/* Ligne dorée décorative en haut */}
            <div style={{ position: 'absolute', top: '30px', left: '80px', right: '80px', height: '2px', background: 'linear-gradient(90deg, transparent 0%, #C59A45 50%, transparent 100%)', display: 'flex' }}></div>
            {/* Ligne dorée décorative en bas */}
            <div style={{ position: 'absolute', bottom: '30px', left: '80px', right: '80px', height: '2px', background: 'linear-gradient(90deg, transparent 0%, #C59A45 50%, transparent 100%)', display: 'flex' }}></div>
          </div>
        )}

        {/* Contenu principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: hasImage ? 'rgba(10, 18, 38, 0.85)' : 'rgba(10, 18, 38, 0.6)',
            padding: '50px 80px',
            borderRadius: '40px',
            border: '3px solid #C59A45',
            zIndex: 10,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 80px rgba(197,154,69,0.05)',
            maxWidth: '900px',
          }}
        >
          {/* Icône anneaux de mariage */}
          {!hasImage && (
            <span style={{ fontSize: 60, marginBottom: 10 }}>💍</span>
          )}

          <span
            style={{
              fontSize: 28,
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: '#DFB769',
              marginBottom: 15,
              fontWeight: 'bold',
            }}
          >
            Vous êtes invité(e)
          </span>

          {/* Petite ligne décorative */}
          <div style={{ width: '60px', height: '2px', backgroundColor: '#C59A45', marginBottom: 20, display: 'flex' }}></div>

          <span
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              fontFamily: 'Georgia, serif',
              textAlign: 'center',
              marginBottom: 20,
              lineHeight: 1.1,
            }}
          >
            {title}
          </span>

          {/* Petite ligne décorative */}
          <div style={{ width: '60px', height: '2px', backgroundColor: '#C59A45', marginBottom: 20, display: 'flex' }}></div>

          {dateStr && (
            <span
              style={{
                fontSize: 32,
                color: '#fff',
                opacity: 0.9,
                textTransform: 'capitalize',
                marginBottom: 15,
              }}
            >
              {dateStr}
            </span>
          )}

          {/* Emojis décoratifs mariage si pas de photo */}
          {!hasImage && (
            <div style={{ display: 'flex', gap: '15px', marginBottom: 15, fontSize: 28, opacity: 0.7 }}>
              <span>✨</span>
              <span>🤍</span>
              <span>🕊️</span>
              <span>🤍</span>
              <span>✨</span>
            </div>
          )}

          <span
            style={{
              fontSize: 20,
              color: '#C59A45',
              marginTop: 5,
              letterSpacing: '0.2em',
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

