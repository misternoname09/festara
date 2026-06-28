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
}: {
  eventId: string;
  eventTitle: string;
  initialScanned: number;
  total: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camOn, setCamOn] = useState(false);
  const [manual, setManual] = useState('');
  const [result, setResult] = useState<ScanResult>({ status: 'idle' });
  const [scanned, setScanned] = useState(initialScanned);
  const busy = useRef(false);
  const lastValue = useRef<string>('');

  async function verify(value: string) {
    if (busy.current) return;
    busy.current = true;
    let finalStatus: Status = 'error';
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

  return (
    <div className="flex flex-col items-center">
      <div className="w-full mb-6 text-center">
        <h1 className="text-2xl font-bold text-festara-navy font-serif mb-1">{eventTitle}</h1>
        <div className="inline-flex items-center gap-2 bg-white/60 px-4 py-1.5 rounded-full border border-black/5 text-sm font-semibold text-festara-ink/70">
          <span className="w-2 h-2 rounded-full bg-festara-teal animate-pulse"></span>
          {scanned} / {total} invités scannés
        </div>
      </div>

      {/* Resultat pleine largeur */}
      {result.status !== 'idle' && (
        <div className={`w-full mb-6 rounded-2xl p-5 text-center border-2 animate-fade-in-up shadow-sm ${bannerColors}`}>
          <p className="text-xl font-bold font-serif">{label}</p>
          {result.guest && (
            <p className="mt-2 text-md font-medium opacity-90">
              {result.guest.first_name} <span className="mx-2 opacity-50">•</span> {result.guest.party_size} pers.
            </p>
          )}
          {result.status === 'already' && result.scanned_at && (
            <p className="mt-2 text-sm opacity-80 font-mono bg-white/50 inline-block px-3 py-1 rounded-md">
              Scanné à {new Date(result.scanned_at).toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>
      )}

      {/* Camera Container */}
      <div className={`w-full rounded-[2rem] overflow-hidden bg-[#0A1226] aspect-[4/5] relative shadow-inner border-4 transition-colors duration-300 ${result.status === 'valid' ? 'border-green-500' : result.status === 'idle' ? 'border-[#0A1226]' : 'border-red-500'}`}>
        <video ref={videoRef} className="w-full h-full object-cover opacity-90" muted playsInline />
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A1226]/80 backdrop-blur-sm p-6 text-center">
            <span className="text-4xl mb-4">📷</span>
            <button
              onClick={() => {
                setResult({ status: 'idle' });
                setCamOn(true);
              }}
              className="btn bg-[#C59A45] hover:bg-[#DFB769] text-white shadow-lg w-full max-w-[200px]"
            >
              Activer la caméra
            </button>
            <p className="text-white/40 text-xs mt-4">Autorisez l'accès à la caméra pour scanner les Pass Festara.</p>
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
