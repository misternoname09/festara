'use client';

import { useState, useEffect } from 'react';
import { getGuestPhotos } from '@/app/actions/gallery';

export default function LiveGallery({
  eventId,
  isDark = false,
  dict,
}: {
  eventId: string;
  isDark?: boolean;
  dict: any;
}) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction de chargement de la galerie
  const loadPhotos = async () => {
    const urls = await getGuestPhotos(eventId);
    setPhotos(urls);
  };

  // Chargement initial et polling toutes les 15 secondes
  useEffect(() => {
    loadPhotos();
    const interval = setInterval(loadPhotos, 15000);
    return () => clearInterval(interval);
  }, [eventId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);

    try {
      const res = await fetch('/api/gallery-upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi.");
      
      // On rajoute la photo optimiste en premier dans la liste locale
      setPhotos((prev) => [data.url, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = ''; // reset input
    }
  };

  return (
    <div className={`mt-12 text-center`}>
      <h3 className={`text-4xl mb-4 font-serif ${isDark ? 'text-festara-gold' : 'text-festara-navy'}`}>
        {dict.galleryTitle}
      </h3>
      <p className={`text-sm mb-10 opacity-80 ${isDark ? 'text-white' : 'text-festara-navy'}`}>
        {dict.gallerySubtitle}
      </p>

      {/* Zone d'upload */}
      <div className="mb-10 relative">
        <label className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all cursor-pointer hover:-translate-y-1 hover:shadow-2xl overflow-hidden group ${isDark ? 'bg-gradient-to-r from-festara-gold to-[#DFB769] text-[#0A1226]' : 'bg-gradient-to-r from-festara-navy to-[#1A2A4A] text-white'}`}>
          <span className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          {uploading ? (
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <span className="text-xl">📸</span>
          )}
          <span>{uploading ? dict.uploading : dict.galleryBtn}</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
        {error && <p className="mt-4 text-xs text-red-500 font-bold bg-red-50 inline-block px-3 py-1 rounded-md">{error}</p>}
      </div>

      {/* Grille de photos */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 auto-rows-[150px]">
          {photos.map((url, i) => (
            <div
              key={url}
              className={`relative rounded-2xl overflow-hidden shadow-lg animate-fade-in-up ${i % 3 === 0 ? 'row-span-2' : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <img
                src={url}
                alt="Souvenir"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={`py-12 rounded-3xl border-2 border-dashed ${isDark ? 'border-white/10 text-white/30' : 'border-festara-navy/10 text-festara-navy/30'}`}>
          <p className="text-5xl mb-4">📷</p>
          <p className="font-medium text-sm">Aucune photo pour l'instant.</p>
          <p className="font-medium text-sm">Soyez le premier !</p>
        </div>
      )}
    </div>
  );
}
