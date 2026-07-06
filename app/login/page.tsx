'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/dashboard';
  const supabase = createClient();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [step, setStep] = useState<'enter' | 'otp'>('enter');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    'w-full bg-white/50 border-b-2 border-festara-navy/10 px-4 pt-6 pb-2 text-festara-navy font-medium outline-none focus:bg-white focus:border-festara-gold transition-all peer';
  const labelClass =
    'absolute left-4 top-4 text-xs font-bold text-festara-ink/40 uppercase tracking-widest peer-focus:text-festara-gold peer-focus:-translate-y-2 peer-focus:scale-90 transition-all pointer-events-none origin-left';

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Erreur lors de la connexion Google.');
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) throw error;
      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      setLoading(false);
      if (err.message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError(err.message || 'Erreur lors de la connexion.');
      }
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });
      if (error) throw error;
      alert("Un email contenant un lien de réinitialisation a été envoyé !");
      setMode('login');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi de l'email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      setLoading(false);
      if (error) throw error;
      setStep('otp');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Erreur lors de l'inscription.");
    }
  }

  async function verifySignupOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });
      setLoading(false);
      if (error) throw error;
      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Code de vérification invalide.');
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row font-sans bg-festara-sand">
      
      {/* Left Panel: Inspiration (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-[#0A1226] relative overflow-hidden flex-col justify-between p-12 lg:p-20 text-white">
        {/* Background Effects */}
        <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] rounded-full bg-festara-gold/10 blur-[120px] pointer-events-none animate-float"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-festara-teal/10 blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-festara-gold"></span>
          <span className="font-bold uppercase tracking-widest text-sm text-festara-gold">Festara</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 animate-fade-in-up">
          <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-tight mb-6">
            L'art de l'invitation digitale.
          </h1>
          <p className="text-lg text-white/60 font-medium max-w-md leading-relaxed">
            Organisez vos événements de prestige. Impressionnez vos invités avant même le jour J.
          </p>
        </div>

        {/* Footer/Trust */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-white/40 uppercase tracking-wider font-semibold">
          <span>Sécurisé</span>
          <span className="w-1 h-1 rounded-full bg-white/20"></span>
          <span>Élégant</span>
          <span className="w-1 h-1 rounded-full bg-white/20"></span>
          <span>Innovant</span>
        </div>
      </div>

      {/* Right Panel: Action (Form) */}
      <div className="w-full md:w-[55%] lg:w-[50%] flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Logo */}
        <div className="md:hidden absolute top-8 left-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-festara-gold"></span>
          <span className="font-bold uppercase tracking-widest text-xs text-festara-gold">Festara</span>
        </div>

        <div className="w-full max-w-md animate-fade-in-up relative z-10">
          
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-festara-navy font-serif mb-3">
              {mode === 'login' ? 'Bon retour' : 'Créer un compte'}
            </h2>
            <p className="text-festara-ink/50 font-medium">
              {mode === 'login' 
                ? 'Saisissez vos identifiants pour accéder à votre tableau de bord.' 
                : mode === 'forgot_password'
                ? 'Saisissez votre email pour réinitialiser votre mot de passe.'
                : 'Rejoignez-nous pour concevoir des invitations inoubliables.'}
            </p>
          </div>

          {step === 'enter' && (
            <div className="mb-10 flex gap-4 border-b border-black/5 pb-4">
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className={`text-sm font-bold uppercase tracking-widest transition-all ${
                  mode === 'login' || mode === 'forgot_password' ? 'text-festara-navy' : 'text-festara-ink/30 hover:text-festara-navy/60'
                }`}
              >
                Connexion
                {(mode === 'login' || mode === 'forgot_password') && <div className="h-0.5 w-full bg-festara-gold mt-4 absolute left-0" style={{ width: '85px' }}></div>}
              </button>
              <button
                onClick={() => { setMode('signup'); setError(null); }}
                className={`text-sm font-bold uppercase tracking-widest transition-all ${
                  mode === 'signup' ? 'text-festara-navy' : 'text-festara-ink/30 hover:text-festara-navy/60'
                }`}
              >
                Inscription
                {mode === 'signup' && <div className="h-0.5 w-full bg-festara-gold mt-4 absolute left-[101px]" style={{ width: '105px' }}></div>}
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && step === 'enter' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <input
                  type="email"
                  required
                  id="email_login"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                />
                <label htmlFor="email_login" className={labelClass + (email ? ' -translate-y-2 scale-90' : '')}>Email</label>
              </div>
              
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <input
                  type="password"
                  required
                  id="pwd_login"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                />
                <label htmlFor="pwd_login" className={labelClass + (password ? ' -translate-y-2 scale-90' : '')}>Mot de passe</label>
              </div>

              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setMode('forgot_password')} 
                  className="text-xs text-festara-navy/70 hover:text-festara-navy font-bold underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
              
              <button disabled={loading} className="btn-primary w-full py-4 text-base shadow-lg hover:-translate-y-0.5 transition-all mt-4">
                {loading ? 'Authentification…' : 'Se connecter'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <input
                  type="email"
                  required
                  id="email_forgot"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                />
                <label htmlFor="email_forgot" className={labelClass + (email ? ' -translate-y-2 scale-90' : '')}>Email</label>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
              
              <button disabled={loading} className="btn-primary w-full py-4 text-base shadow-lg hover:-translate-y-0.5 transition-all mt-4">
                {loading ? 'Envoi...' : 'Réinitialiser le mot de passe'}
              </button>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => setMode('login')} 
                  className="text-sm text-festara-navy/70 hover:text-festara-navy font-bold"
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && step === 'enter' && (
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <input
                  type="text"
                  required
                  id="name_signup"
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder=" "
                />
                <label htmlFor="name_signup" className={labelClass + (fullName ? ' -translate-y-2 scale-90' : '')}>Nom complet</label>
              </div>

              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <input
                  type="email"
                  required
                  id="email_signup"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                />
                <label htmlFor="email_signup" className={labelClass + (email ? ' -translate-y-2 scale-90' : '')}>Email</label>
              </div>
              
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <input
                  type="password"
                  required
                  minLength={6}
                  id="pwd_signup"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                />
                <label htmlFor="pwd_signup" className={labelClass + (password ? ' -translate-y-2 scale-90' : '')}>Mot de passe (Min 6)</label>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
              
              <button disabled={loading} className="btn-primary w-full py-4 text-base shadow-lg hover:-translate-y-0.5 transition-all mt-4">
                {loading ? 'Création en cours…' : 'Créer mon compte'}
              </button>
            </form>
          )}

          {/* OTP FORM */}
          {mode === 'signup' && step === 'otp' && (
            <form onSubmit={verifySignupOtp} className="space-y-6">
              <div className="bg-white/60 p-6 rounded-2xl text-center border border-white">
                <div className="text-4xl mb-4">✉️</div>
                <p className="text-sm text-festara-ink/80 leading-relaxed font-medium">
                  Nous avons envoyé un code de sécurité à<br/>
                  <strong className="text-festara-navy mt-1 block text-lg">{email}</strong>
                </p>
              </div>
              <div>
                <input
                  type="text"
                  required
                  className="w-full bg-white border-2 border-festara-navy/10 rounded-2xl px-4 py-4 text-festara-navy font-bold tracking-[0.7em] text-center text-3xl outline-none focus:border-festara-gold transition-colors shadow-inner"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="00000000"
                  inputMode="numeric"
                  maxLength={8}
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
              
              <button disabled={loading} className="btn-primary w-full py-4 text-base shadow-lg">
                {loading ? 'Vérification…' : 'Confirmer mon adresse'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('enter'); setError(null); setOtp(''); }}
                className="btn-outline w-full py-4 border-festara-navy/20 text-festara-navy/50 hover:text-festara-navy"
              >
                ← Retour
              </button>
            </form>
          )}

          {/* OAUTH */}
          {step === 'enter' && (
            <>
              <div className="relative mt-12 mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                  <span className="bg-festara-sand px-4 text-festara-ink/30">Ou continuer avec</span>
                </div>
              </div>

              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-4 text-base font-bold border border-white bg-white hover:bg-white/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-festara-navy"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </>
          )}

        </div>
      </div>
    </main>
  );
}
