'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';

export default function SaveButton() {
  const { pending } = useFormStatus();
  const [showToast, setShowToast] = useState(false);
  const [wasPending, setWasPending] = useState(false);

  useEffect(() => {
    if (pending) {
      setWasPending(true);
    } else if (wasPending && !pending) {
      // Le formulaire a fini de s'enregistrer
      setShowToast(true);
      setWasPending(false);
      setTimeout(() => setShowToast(false), 4000);
    }
  }, [pending, wasPending]);

  return (
    <>
      <button 
        type="submit"
        disabled={pending}
        className="relative group/btn overflow-hidden w-full sm:w-auto px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all hover:-translate-y-1 bg-[#0A1226] text-white hover:shadow-[0_15px_30px_rgba(10,18,38,0.2)] group-has-[:checked]/publish:bg-gradient-to-r group-has-[:checked]/publish:from-festara-gold group-has-[:checked]/publish:via-[#DFB769] group-has-[:checked]/publish:to-festara-gold group-has-[:checked]/publish:text-[#0A1226] group-has-[:checked]/publish:shadow-[0_15px_40px_rgba(197,154,69,0.4)] group-has-[:checked]/publish:scale-105 duration-300 disabled:opacity-70 disabled:cursor-wait"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></span>
        <span className="relative flex items-center justify-center gap-2">
          {pending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white group-has-[:checked]/publish:text-[#0A1226]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enregistrement...
            </>
          ) : (
            'Enregistrer les modifications'
          )}
        </span>
      </button>

      {/* Toast de notification flottant */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-4 rounded-full font-bold shadow-[0_10px_40px_rgba(22,163,74,0.4)] flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="w-6 h-6 bg-white text-green-600 rounded-full flex items-center justify-center text-sm shadow-sm">✓</div>
          Modifications enregistrées !
        </div>
      )}
    </>
  );
}
