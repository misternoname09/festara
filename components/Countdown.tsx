'use client';
import { useState, useEffect } from 'react';

export default function Countdown({ targetDate, isDark }: { targetDate: string; isDark: boolean }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    // On recupere la date a minuit
    const target = new Date(`${targetDate}T00:00:00`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null; // Hydration safe

  const bgClass = isDark ? 'bg-black/40 text-white border-white/10' : 'bg-white/60 text-festara-navy border-black/5';

  return (
    <div className="flex items-center justify-center gap-3 md:gap-4 w-full animate-fade-in-up">
      {[
        { label: 'Jours', value: timeLeft.d },
        { label: 'Heures', value: timeLeft.h },
        { label: 'Min', value: timeLeft.m },
        { label: 'Sec', value: timeLeft.s },
      ].map((item, i) => (
        <div key={i} className={`flex flex-col items-center justify-center w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl backdrop-blur-md border shadow-2xl transition-transform hover:scale-105 ${bgClass}`}>
          <span className="text-xl md:text-2xl font-bold font-serif leading-none">{String(item.value).padStart(2, '0')}</span>
          <span className="text-[9px] md:text-[10px] uppercase tracking-widest mt-1 opacity-70 font-semibold">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
