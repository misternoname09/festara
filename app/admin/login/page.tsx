"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
      });
      if (error) throw error;
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      router.push('/admin');
    } catch (err: any) {
      setError('ACCÈS REFUSÉ : Code de sécurité invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-4 selection:bg-green-500 selection:text-black">
      <div className="w-full max-w-2xl bg-black border border-green-800 p-8 shadow-[0_0_15px_rgba(0,255,0,0.1)] rounded-sm relative overflow-hidden">
        
        {/* Lignes de scan rétro (optionnel pour l'esthétique) */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-10"></div>

        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-green-900 pb-4 mb-6">
          <div>
            <h1 className="text-sm tracking-widest text-green-700">SYSTEM.CORE</h1>
            <h2 className="text-3xl font-bold tracking-tight text-green-400 mt-1">
              Festara Admin<span className="animate-pulse">_</span>
            </h2>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 border border-green-800">
              CONTROL CENTER
            </span>
          </div>
        </div>

        {/* WARNING */}
        <div className="bg-red-900/20 border-l-4 border-red-600 text-red-500 p-4 text-sm mb-6 shadow-[inset_0_0_10px_rgba(255,0,0,0.1)]">
          <span className="font-bold">[RESTRICTED AREA]</span> Ce portail est strictement réservé au personnel autorisé. Toute tentative de connexion non autorisée sera enregistrée et signalée.
        </div>

        {/* SYSTEM INFO */}
        <div className="text-xs text-green-700 space-y-1 mb-8 font-medium">
          <p>&gt; SYS_VER: <span className="text-green-500">2.4.1-STABLE</span></p>
          <p>&gt; NODE_ENV: <span className="text-green-500">PRODUCTION</span></p>
          <p>&gt; ENCRYPTION: <span className="text-green-500">AES-256-GCM</span></p>
        </div>

        {/* AUTHENTICATION SECTION */}
        <div className="mb-6">
          <h3 className="text-lg font-bold border-b border-green-900 inline-block mb-4">AUTHENTIFICATION</h3>
          
          {error && (
            <div className="text-red-500 text-sm mb-6 flex items-start animate-pulse">
              <span className="mr-2">!</span> 
              <p>{error}</p>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6 relative z-20">
              <div>
                <label className="block text-sm font-bold text-green-600 mb-2">IDENTIFIANT ADMINISTRATEUR (EMAIL)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border-2 border-green-800 text-green-400 text-xl tracking-widest p-3 focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(0,255,0,0.3)] transition-colors"
                  placeholder="admin@domain.com"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <Link 
                  href="/" 
                  className="text-green-700 hover:text-green-400 text-sm flex items-center transition-colors group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform mr-2">←</span> RETOUR
                </Link>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-green-900/20 border border-green-500 text-green-400 px-8 py-3 font-bold hover:bg-green-500 hover:text-black transition-all hover:shadow-[0_0_15px_rgba(0,255,0,0.5)] focus:outline-none disabled:opacity-50"
                >
                  {loading ? 'ENVOI...' : 'CONTINUER'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6 relative z-20">
              <div>
                <label className="block text-sm font-bold text-green-600 mb-2">CODE DE SÉCURITÉ (OTP)</label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-black border-2 border-green-800 text-green-400 text-2xl tracking-[0.5em] p-3 focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(0,255,0,0.3)] transition-colors text-center"
                />
                <p className="text-xs text-green-700 mt-2">&gt; Code de vérification envoyé à votre adresse enregistrée.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setStep('email')} 
                  className="text-green-700 hover:text-green-400 text-sm flex items-center transition-colors group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform mr-2">←</span> CHANGER EMAIL
                </button>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-green-900/20 border border-green-500 text-green-400 px-8 py-3 font-bold hover:bg-green-500 hover:text-black transition-all hover:shadow-[0_0_15px_rgba(0,255,0,0.5)] focus:outline-none disabled:opacity-50"
                >
                  {loading ? 'VÉRIFICATION...' : 'SE CONNECTER'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-green-900 mt-8 pt-4 text-center">
          <p className="text-xs text-green-800">© 2026 Festara Operations.</p>
        </div>

      </div>
    </div>
  );
}
