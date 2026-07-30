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
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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

  // Telecharger une seule photo
  const downloadPhoto = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `festara-souvenir-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Erreur telechargement:', err);
    }
  };

  // Telecharger toutes les photos
  const downloadAll = async () => {
    setDownloading(true);
    for (let i = 0; i < photos.length; i++) {
      await downloadPhoto(photos[i], i);
      // Petit delai pour eviter que le navigateur bloque les telechargements
      await new Promise(r => setTimeout(r, 500));
    }
    setDownloading(false);
  };

  const previewCount = 4;
  const previewPhotos = photos.slice(0, previewCount);
  const remainingCount = photos.length - previewCount;

  return (
    <div className="mt-12 text-center">
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

      {/* Aperçu des photos (max 4) */}
      {photos.length > 0 ? (
        <div>
          {/* Mini grille d'aperçu */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {previewPhotos.map((url, i) => (
              <div
                key={url}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-lg cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => setPreviewUrl(url)}
              >
                <img
                  src={url}
                  alt="Souvenir"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                {/* Overlay au survol */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                </div>
                {/* Badge "+X" sur la dernière photo si il en reste */}
                {i === previewCount - 1 && remainingCount > 0 && (
                  <div
                    className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                  >
                    <span className="text-white text-2xl font-bold">+{remainingCount}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Compteur et boutons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-festara-ink/40'}`}>
              {photos.length} photo{photos.length > 1 ? 's' : ''}
            </span>

            <button
              onClick={() => setIsOpen(true)}
              className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-sm ${isDark ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-festara-navy/5 text-festara-navy border border-festara-navy/10 hover:bg-festara-navy/10'}`}
            >
              Voir toutes les photos
            </button>

            <button
              onClick={downloadAll}
              disabled={downloading}
              className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-sm ${isDark ? 'bg-festara-gold text-[#0A1226] hover:bg-[#DFB769]' : 'bg-festara-gold text-white hover:bg-[#DFB769]'} disabled:opacity-50`}
            >
              {downloading ? 'Telechargement...' : 'Tout telecharger'}
            </button>
          </div>
        </div>
      ) : (
        <div className={`py-12 rounded-3xl border-2 border-dashed ${isDark ? 'border-white/10 text-white/30' : 'border-festara-navy/10 text-festara-navy/30'}`}>
          <p className="text-5xl mb-4">📷</p>
          <p className="font-medium text-sm">Aucune photo pour l{"'"}instant.</p>
          <p className="font-medium text-sm">Soyez le premier !</p>
        </div>
      )}

      {/* Modal Galerie complète */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col"
          onClick={() => setIsOpen(false)}
        >
          {/* Header du modal */}
          <div className="flex items-center justify-between p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-left">
              <h4 className="text-white font-bold text-lg">Galerie Collaborative</h4>
              <p className="text-white/50 text-xs">{photos.length} photo{photos.length > 1 ? 's' : ''} partagees</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={downloadAll}
                disabled={downloading}
                className="px-5 py-2.5 bg-festara-gold text-[#0A1226] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#DFB769] transition-colors disabled:opacity-50"
              >
                {downloading ? '...' : 'Tout telecharger'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Grille complète */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-[180px] sm:auto-rows-[220px]">
              {photos.map((url, i) => (
                <div
                  key={url}
                  className={`relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer ${i % 5 === 0 ? 'row-span-2' : ''}`}
                  onClick={() => setPreviewUrl(url)}
                >
                  <img
                    src={url}
                    alt={`Souvenir ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Bouton telecharger individuel */}
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadPhoto(url, i); }}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-festara-gold hover:text-[#0A1226]"
                  >
                    ⬇
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox plein ecran pour une photo */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 text-white text-2xl flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          >
            ✕
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const idx = photos.indexOf(previewUrl);
              downloadPhoto(previewUrl, idx >= 0 ? idx : 0);
            }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-festara-gold text-[#0A1226] rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#DFB769] transition-colors z-10"
          >
            Telecharger cette photo
          </button>
          <img
            src={previewUrl}
            alt="Apercu"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

