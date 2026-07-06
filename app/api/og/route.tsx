import { ImageResponse } from 'next/og';
import { getEventBySlug } from '@/lib/events';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return new Response('Slug is required', { status: 400 });
    }

    const event = await getEventBySlug(slug);
    if (!event) {
      return new Response('Not Found', { status: 404 });
    }

    // Extract photo url
    let imageUrl = "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop";
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
    const dateStr = event.ceremonies?.[0]?.date 
      ? new Date(event.ceremonies[0].date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : '';

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
          {/* Background image */}
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
                fontSize: 90,
                fontWeight: 'bold',
                fontFamily: 'Georgia, serif',
                textAlign: 'center',
                marginBottom: 30,
              }}
            >
              {title}
            </span>
            {dateStr && (
              <span
                style={{
                  fontSize: 40,
                  color: '#fff',
                  opacity: 0.9,
                  textTransform: 'capitalize',
                }}
              >
                {dateStr}
              </span>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
