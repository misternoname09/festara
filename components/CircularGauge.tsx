'use client';

import { useEffect, useState } from 'react';

type CircularGaugeProps = {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  colorClass: string; // ex: 'text-festara-gold' ou 'text-festara-teal'
  strokeColor: string; // ex: '#C59A45'
};

export default function CircularGauge({ value, max, label, sublabel, colorClass, strokeColor }: CircularGaugeProps) {
  const [offset, setOffset] = useState(0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const targetOffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    // Animation au chargement
    setOffset(circumference);
    const timer = setTimeout(() => {
      setOffset(targetOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [targetOffset, circumference]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Cercle de fond */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-black/5"
          />
          {/* Cercle de progression */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Texte au centre */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold font-serif ${colorClass}`}>
            {value}
          </span>
          <span className="text-[10px] font-bold text-festara-ink/40 uppercase tracking-widest mt-0.5">
            / {max > 0 ? max : '-'}
          </span>
        </div>
      </div>
      
      {/* Libellés */}
      <div className="text-center mt-3">
        <span className="block text-xs font-bold text-festara-navy uppercase tracking-wider">{label}</span>
        {sublabel && <span className="block text-[10px] text-festara-ink/50 mt-1">{sublabel}</span>}
      </div>
    </div>
  );
}
