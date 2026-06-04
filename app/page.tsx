import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-festara-gold font-semibold tracking-wide uppercase text-sm">
          Festara — Yëgël
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-festara-navy leading-tight">
          Tes invitations de mariage,
          <br /> à la sénégalaise.
        </h1>
        <p className="mt-5 text-lg text-festara-ink/70">
          Crée ton invitation en 10 minutes. RSVP automatique, Pass d&apos;accès
          QR, partage WhatsApp. Pensé pour le Sénégal et la diaspora.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="btn-primary">
            Créer mon invitation
          </Link>
          <Link href="/i/demo" className="btn-outline">
            Voir une démo
          </Link>
        </div>
        <p className="mt-4 text-sm text-festara-ink/50">
          Chaque invitation, une lumière.
        </p>
      </section>

      {/* Atouts */}
      <section className="max-w-4xl mx-auto px-6 pb-20 grid sm:grid-cols-3 gap-5">
        {[
          {
            t: 'RSVP en 1 tap',
            d: 'Tes invités confirment en un geste, accompagnants inclus. Tu sais qui vient, en temps réel.',
          },
          {
            t: 'Pass Festara',
            d: 'Chaque invité reçoit un QR personnel. Scan à l’entrée depuis ton téléphone, même hors ligne.',
          },
          {
            t: 'Paiement local',
            d: 'PayDunya / Wave au Sénégal, carte bancaire pour la diaspora. Dès 15 000 FCFA.',
          },
        ].map((c) => (
          <div
            key={c.t}
            className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
          >
            <h3 className="font-bold text-festara-navy text-lg">{c.t}</h3>
            <p className="mt-2 text-sm text-festara-ink/70">{c.d}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-sm text-festara-ink/50 pb-10">
        © {new Date().getFullYear()} Festara · Yëgël — Document de travail
      </footer>
    </main>
  );
}
