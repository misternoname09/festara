'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function GalleryUploader({ eventId, initialUrls }: { eventId: string; initialUrls: string | null }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse existing urls (JSON array or single string)
  let existing: string[] = [];
  if (initialUrls) {
    try {
      const parsed = JSON.parse(initialUrls);
      if (Array.isArray(parsed)) existing = parsed;
      else existing = [initialUrls];
    } catch {
      existing = [initialUrls];
    }
  }

  const [images, setImages] = useState<string[]>(existing);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Utilisateur non authentifié.");
        
        const fileName = `${user.id}/${eventId}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to bucket 'festara-images'
        const { error: uploadError } = await supabase.storage
          .from('festara-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage.from('festara-images').getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      }

      const updatedGallery = [...images, ...newUrls];
      setImages(updatedGallery);

      // Save to database
      const { error: dbError } = await supabase
        .from('events')
        .update({ couple_photo_url: JSON.stringify(updatedGallery) })
        .eq('id', eventId);

      if (dbError) throw dbError;

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload. Le bucket 'festara-images' existe-t-il ?");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  }

  async function removeImage(urlToRemove: string) {
    const updatedGallery = images.filter((u) => u !== urlToRemove);
    setImages(updatedGallery);
    
    // Supprimer le fichier du bucket si c'est possible
    try {
      const pathToRemove = urlToRemove.split('/public/festara-images/')[1];
      if (pathToRemove) {
        await supabase.storage.from('festara-images').remove([pathToRemove]);
      }
    } catch (e) {
      console.error("Erreur suppression image:", e);
    }
    
    await supabase
      .from('events')
      .update({ couple_photo_url: JSON.stringify(updatedGallery) })
      .eq('id', eventId);
      
    router.refresh();
  }

  return (
    <div className="glass bg-white/90 rounded-3xl p-8 shadow-sm border border-black/5 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-festara-gold/10 flex items-center justify-center text-festara-gold">📸</div>
        <h2 className="text-2xl font-bold text-festara-navy font-serif">Galerie Photos</h2>
      </div>
      <p className="text-sm text-festara-ink/60 font-medium mb-6">
        Importez vos plus belles photos. Elles seront agencées automatiquement dans un montage élégant sur votre invitation.
      </p>

      {/* Upload Zone */}
      <div className="relative border-2 border-dashed border-festara-navy/20 rounded-2xl p-8 text-center hover:border-festara-gold/50 hover:bg-festara-gold/5 transition-colors group">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">✨</div>
        <p className="text-sm font-bold text-festara-navy">
          {uploading ? 'Importation en cours...' : 'Cliquez ou glissez vos photos ici'}
        </p>
      </div>

      {error && <p className="text-xs text-red-500 font-bold mt-4">{error}</p>}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-sm group">
              <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <button 
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full text-red-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
