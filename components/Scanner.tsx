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

  // Verifie une valeur (uuid ou code) aupres du serveur
  async function verify(value: string) {
    if (busy.current) return;
    busy.current = true;
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, value }),
      });
      const data: ScanResult = await res.json();
      setResult(data);
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
      }, 1500);
    }
  }

  // Boucle de lecture QR
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camOn]);

  const banner = {
    idle: '',
    valid: 'bg-green-600',
    already: 'bg-amber-500',
    unknown: 'bg-red-600',
    error: 'bg-red-700',
  }[result.status];

  const label = {
    idle: '',
    valid: 'Bienvenue',
    already: 'Déjà enregistré',
    unknown: 'Invité non trouvé',
    error: 'Caméra ou réseau indisponible',
  }[result.status];

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-festara-navy">{eventTitle}</h1>
        <span className="text-sm text-festara-ink/60">
          {scanned} / {total} scannés
        </span>
      </div>

      {/* Resultat plein cadre */}
      {result.status !== 'idle' && (
        <div className={`mt-4 rounded-2xl p-6 text-white text-center ${banner}`}>
          <p className="text-2xl font-bold">{label}</p>
          {result.guest && (
            <p className="mt-1 text-lg">
              {result.guest.first_name} · {result.guest.party_size} pers.
            </p>
          )}
          {result.status === 'already' && result.scanned_at && (
            <p className="mt-1 text-sm opacity-90">
              à {new Date(result.scanned_at).toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>
      )}

      {/* Camera */}
      <div className="mt-4 rounded-2xl overflow-hidden bg-black aspect-square relative">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {!camOn && (
          <button
            onClick={() => {
              setResult({ status: 'idle' });
              setCamOn(true);
            }}
            className="absolute inset-0 m-auto h-12 w-48 btn-gold"
          >
            Activer la caméra
          </button>
        )}
      </div>

      {/* Saisie manuelle (fallback obligatoire) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) verify(manual.trim());
          setManual('');
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value.toUpperCase())}
          placeholder="Code à 6 caractères"
          className="flex-1 rounded-lg px-3 min-h-[48px] border border-black/15 bg-white text-base tracking-widest text-center"
          maxLength={6}
        />
        <button className="btn-primary">Vérifier</button>
      </form>

      <p className="mt-3 text-xs text-festara-ink/40 text-center">
        Autorise l&apos;accès caméra. En cas de QR illisible, saisis le code manuellement.
      </p>
    </div>
  );
}
