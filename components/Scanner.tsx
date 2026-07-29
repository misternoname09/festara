'use client';

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

type Status = 'idle' | 'valid' | 'already' | 'unknown' | 'error';
interface ScanResult {
  status: Status;
  guest?: { first_name: string; party_size: number };
  scanned_at?: string;
}

export default function Scanner({
  eventId,
  eventTitle,
  initialScanned,
  total,
  guests,
}: {
  eventId: string;
  eventTitle: string;
  initialScanned: number;
  total: number;
  guests: any[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camOn, setCamOn] = useState(false);
  const [manual, setManual] = useState('');
  const [result, setResult] = useState<ScanResult>({ status: 'idle' });
  const [scanned, setScanned] = useState(initialScanned);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const busy = useRef(false);
  const lastValue = useRef<string>('');

  // Initialisation et gestion de la connexion
  useEffect(() => {
    // 1. Sauvegarder les invités en cache local (si on a internet, ça met à jour le cache)
    if (guests && guests.length > 0) {
      localStorage.setItem(`festara_guests_${eventId}`, JSON.stringify(guests));
    }

    // 2. Vérifier la connectivité
    setIsOnline(navigator.onLine);
    const handleOnline = () => { setIsOnline(true); syncOfflineScans(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Mettre à jour le compteur des attentes au chargement
    const queue = JSON.parse(localStorage.getItem(`festara_offline_queue_${eventId}`) || '[]');
    setPendingSync(queue.length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [guests, eventId]);

  const syncOfflineScans = async () => {
    const queue = JSON.parse(localStorage.getItem(`festara_offline_queue_${eventId}`) || '[]');
    if (queue.length === 0) return;

    for (const val of queue) {
      try {
        await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: eventId, value: val }),
        });
      } catch (err) {
        console.error('Erreur de synchronisation pour', val);
      }
    }
    // Nettoyer la file une fois synchronisé (version simplifiée, idéalement on filtre ceux qui ont échoué)
    localStorage.setItem(`festara_offline_queue_${eventId}`, '[]');
    setPendingSync(0);
  };

  async function verify(value: string) {
    if (busy.current) return;
    busy.current = true;
    let finalStatus: Status = 'error';
    
    // LOGIQUE HORS-LIGNE
    if (!navigator.onLine) {
      const cachedGuests = JSON.parse(localStorage.getItem(`festara_guests_${eventId}`) || '[]');
      const localGuest = cachedGuests.find((g: any) => g.pass_uuid === value || g.pass_code === value);
      
      if (!localGuest) {
        finalStatus = 'unknown';
        setResult({ status: 'unknown' });
      } else {
        // Est-il déjà scanné localement (dans cette session) ?
        const queue = JSON.parse(localStorage.getItem(`festara_offline_queue_${eventId}`) || '[]');
        if (localGuest.scanned_at || queue.includes(value)) {
          finalStatus = 'already';
          setResult({ status: 'already', guest: localGuest, scanned_at: localGuest.scanned_at || new Date().toISOString() });
          if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
        } else {
          // OK !
          queue.push(value);
          localStorage.setItem(`festara_offline_queue_${eventId}`, JSON.stringify(queue));
          setPendingSync(queue.length);
          finalStatus = 'valid';
          setResult({ status: 'valid', guest: localGuest });
          setScanned((n) => n + 1);
          if (navigator.vibrate) navigator.vibrate(120);
        }
      }

      setTimeout(() => {
        busy.current = false;
        lastValue.current = '';
        if (finalStatus === 'valid') {
            setTimeout(() => setResult({status: 'idle'}), 2000);
        }
      }, 1500);
      return;
    }

    // LOGIQUE EN LIGNE (normale)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, value }),
      });
      const data: ScanResult = await res.json();
      setResult(data);
      finalStatus = data.status;
      if (data.status === 'valid') {
        setScanned((n) => n + 1);
        if (navigator.vibrate) navigator.vibrate(120);
      } else if (data.status === 'already') {
        if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
      }
    } catch {
      setResult({ status: 'error' });
    } finally {
      setTimeout(() => {
        busy.current = false;
        lastValue.current = '';
        if (finalStatus === 'valid') {
            setTimeout(() => setResult({status: 'idle'}), 2000);
        }
      }, 1500);
    }
  }

  useEffect(() => {
    if (!camOn) return;
    let stream: MediaStream | null = null;
    let raf = 0;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        tick();
      } catch {
        setResult({ status: 'error' });
        setCamOn(false);
      }
    })();

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height);
          if (code && code.data && code.data !== lastValue.current && !busy.current) {
            lastValue.current = code.data;
            verify(code.data);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [camOn]);

  const bannerColors = {
    idle: 'border-festara-navy/10',
    valid: 'bg-green-500/10 border-green-500 text-green-700',
    already: 'bg-amber-500/10 border-amber-500 text-amber-700',
    unknown: 'bg-red-500/10 border-red-500 text-red-700',
    error: 'bg-red-700/10 border-red-700 text-red-800',
  }[result.status];

  const label = {
    idle: '',
    valid: 'Bienvenue ! ✅',
    already: 'Déjà enregistré ⚠️',
    unknown: 'Pass introuvable ❌',
    error: 'Erreur réseau',
  }[result.status];

    <div className="flex flex-col items-center w-full h-full">
      <div className="w-full mb-6 text-center z-10 relative">
        <h1 className="text-2xl font-bold text-white font-serif mb-1">{eventTitle}</h1>
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 text-sm font-semibold text-white/80">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-festara-teal animate-pulse' : 'bg-red-500'}`}></span>
          {scanned} / {total} invités scannés
        </div>
        {!isOnline && (
          <p className="text-xs text-amber-400 mt-2 font-bold bg-amber-500/10 inline-block px-3 py-1 rounded-full border border-amber-500/20">
            ⚠️ Hors-ligne : {pendingSync} scan(s) en attente
          </p>
        )}
      </div>

      {/* Resultat PLEIN ECRAN (Flash) */}
      {result.status !== 'idle' && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center text-white transition-colors duration-300 ${
          result.status === 'valid' ? 'bg-green-600' :
          result.status === 'already' ? 'bg-amber-500' :
          'bg-red-600'
        }`}>
          <div className="animate-fade-in-up">
            <p className="text-5xl font-bold font-serif mb-6">{label}</p>
            {result.guest && (
              <p className="mt-2 text-3xl font-medium opacity-100">
                {result.guest.first_name}
                <br/>
                <span className="opacity-80 text-xl inline-block mt-4">{result.guest.party_size} pers. attendue(s)</span>
              </p>
            )}
            {result.status === 'already' && result.scanned_at && (
              <p className="mt-8 text-sm opacity-90 font-mono bg-black/20 inline-block px-4 py-2 rounded-xl">
                Scanné à {new Date(result.scanned_at).toLocaleTimeString('fr-FR')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Camera Container */}
      <div className={`w-full max-w-sm rounded-[2.5rem] overflow-hidden bg-black aspect-[4/5] relative shadow-2xl border-4 transition-colors duration-300 ${result.status === 'valid' ? 'border-green-500' : result.status === 'idle' ? 'border-white/10' : 'border-red-500'}`}>
        <video ref={videoRef} className="w-full h-full object-cover opacity-100" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Cadre de visée decoratif */}
        {camOn && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="w-48 h-48 border-2 border-white/30 rounded-3xl relative">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-festara-gold rounded-tl-2xl"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-festara-gold rounded-tr-2xl"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-festara-gold rounded-bl-2xl"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-festara-gold rounded-br-2xl"></div>
             </div>
          </div>
        )}

        {!camOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
            <span className="text-5xl mb-6">📷</span>
            <button
              onClick={() => {
                setResult({ status: 'idle' });
                setCamOn(true);
              }}
              className="px-8 py-4 bg-festara-gold hover:bg-[#DFB769] text-[#0A1226] font-bold uppercase tracking-widest text-sm rounded-full transition-all shadow-[0_10px_30px_rgba(197,154,69,0.3)] hover:shadow-[0_10px_40px_rgba(197,154,69,0.5)] hover:-translate-y-1 w-full max-w-[250px]"
            >
              Activer la caméra
            </button>
            <p className="text-white/40 text-xs mt-6 font-medium">Autorisez l'accès à la caméra pour scanner les Pass Festara.</p>
          </div>
        )}
      </div>

      {/* Saisie manuelle (fallback) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) verify(manual.trim());
          setManual('');
        }}
        className="mt-6 w-full flex gap-2"
      >
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value.toUpperCase())}
          placeholder="Entrer le code (ex: AB1234)"
          className="flex-1 rounded-xl px-4 min-h-[50px] border border-black/10 bg-white/60 focus:bg-white text-base font-mono tracking-widest text-center uppercase outline-none focus:ring-2 focus:ring-festara-gold/50 transition-all placeholder:text-festara-ink/30 placeholder:tracking-normal placeholder:font-sans"
          maxLength={6}
        />
        <button className="btn-primary rounded-xl px-6">Vérifier</button>
      </form>
    </div>
  );
}
