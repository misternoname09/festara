import type { EventRow } from '@/lib/types';
import { TEMPLATES } from '@/components/templates';
import { mapsEmbedUrl, formatDateFr } from '@/lib/events';
import RsvpForm from '@/components/RsvpForm';

export default function Invitation({ event }: { event: EventRow }) {
  const t = TEMPLATES[event.template] ?? TEMPLATES.modern;
  const isDark = event.template === 'arabic';

  return (
    <main className={`min-h-screen ${t.page} py-8 px-4`}>
      <div className={`max-w-md mx-auto rounded-3xl shadow-xl overflow-hidden ${t.card} ${t.font}`}>
        {/* Photo couple (optionnelle) */}
        {event.couple_photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.couple_photo_url}
            alt={event.title}
            className="w-full h-56 object-cover"
            loading="eager"
          />
        )}

        <div className="px-6 py-8 text-center">
          <p className={`uppercase tracking-[0.2em] text-xs ${t.accent}`}>
            Vous êtes convié(e)
          </p>
          <h1 className={`mt-3 text-3xl font-bold ${t.title}`}>{event.title}</h1>
          <p className={`mt-4 text-sm ${t.accent}`}>{t.divider}</p>

          {/* Ceremonies */}
          <div className="mt-6 space-y-5 text-left">
            {event.ceremonies.map((c) => (
              <div
                key={c.id}
                className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-black/[0.03]'}`}
              >
                <h2 className={`font-semibold ${t.title}`}>{c.name}</h2>
                <p className="mt-1 text-sm opacity-80">
                  {formatDateFr(c.date)}
                  {c.time ? ` · ${c.time}` : ''}
                </p>
                <p className="text-sm opacity-80">{c.location}</p>
                <iframe
                  title={`Carte ${c.name}`}
                  src={mapsEmbedUrl(c)}
                  className="mt-3 w-full h-40 rounded-lg border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ))}
          </div>

          <p className={`mt-8 text-sm ${t.accent}`}>{t.divider}</p>

          {/* RSVP */}
          <div className="mt-6">
            <RsvpForm
              eventId={event.id}
              ceremonies={event.ceremonies}
              dark={isDark}
            />
          </div>

          <p className="mt-8 text-[11px] opacity-50">
            Créé avec Festara — fais ton invitation
          </p>
        </div>
      </div>
    </main>
  );
}
