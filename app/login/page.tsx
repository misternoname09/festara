'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Connexion : Email (lien magique, gratuit, pour tester) OU Téléphone (OTP SMS).
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState<'enter' | 'otp' | 'sent'>('enter');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+221');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const input =
    'w-full rounded-lg px-3 min-h-[48px] text-base border border-black/15 bg-white';

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setStep('sent');
  }

  async function sendSms(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) return setError(error.message);
    setStep('otp');
  }

  async function verifySms(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
    setLoading(false);
    if (error) return setError(error.message);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-black/5 p-7">
        <h1 className="text-2xl font-bold text-festara-navy text-center">Connexion Festara</h1>

        {/* Sélecteur */}
        <div className="mt-5 grid grid-cols-2 gap-1 bg-black/5 rounded-lg p-1 text-sm">
          {(['email', 'phone'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setStep('enter');
                setError(null);
              }}
              className={
                'py-2 rounded-md font-medium ' +
                (mode === m ? 'bg-white shadow text-festara-navy' : 'text-festara-ink/60')
              }
            >
              {m === 'email' ? 'Email' : 'Téléphone'}
            </button>
          ))}
        </div>

        {/* EMAIL */}
        {mode === 'email' && step !== 'sent' && (
          <form onSubmit={sendEmail} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Ton email</label>
              <input
                type="email"
                className={input + ' mt-1'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom@email.com"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="btn-primary w-full">
              {loading ? 'Envoi…' : 'Recevoir le lien'}
            </button>
          </form>
        )}

        {mode === 'email' && step === 'sent' && (
          <div className="mt-6 text-center">
            <p className="text-festara-navy font-semibold">Vérifie ta boîte mail 📩</p>
            <p className="mt-2 text-sm text-festara-ink/60">
              Un lien de connexion a été envoyé à <strong>{email}</strong>. Clique
              dessus pour entrer dans ton tableau de bord.
            </p>
            <button onClick={() => setStep('enter')} className="btn-outline w-full mt-5">
              Renvoyer
            </button>
          </div>
        )}

        {/* TELEPHONE */}
        {mode === 'phone' && step === 'enter' && (
          <form onSubmit={sendSms} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Numéro de téléphone</label>
              <input
                type="tel"
                className={input + ' mt-1'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 7X XXX XX XX"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="btn-primary w-full">
              {loading ? 'Envoi…' : 'Recevoir le code'}
            </button>
            <p className="text-xs text-festara-ink/40">
              Nécessite un fournisseur SMS configuré dans Supabase.
            </p>
          </form>
        )}

        {mode === 'phone' && step === 'otp' && (
          <form onSubmit={verifySms} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Code reçu par SMS</label>
              <input
                className={input + ' mt-1 tracking-widest text-center'}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                inputMode="numeric"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="btn-primary w-full">
              {loading ? 'Vérification…' : 'Me connecter'}
            </button>
            <button type="button" onClick={() => setStep('enter')} className="btn-outline w-full">
              Changer de numéro
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
