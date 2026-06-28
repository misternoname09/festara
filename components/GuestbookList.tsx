import type { GuestbookMessageRow } from '@/lib/types';

export default function GuestbookList({ messages, isDark }: { messages: GuestbookMessageRow[]; isDark: boolean }) {
  if (!messages || messages.length === 0) return null;

  // Fonction pour un affichage de date relatif simple (ex: "Il y a 2 jours" ou "12 mai")
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="w-full space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`p-5 rounded-3xl border text-left shadow-sm transition-transform hover:-translate-y-1 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-serif font-bold text-lg ${isDark ? 'text-festara-gold' : 'text-festara-teal'}`}>
              {msg.author_name}
            </span>
            <span className={`text-[10px] uppercase tracking-widest opacity-50 ${isDark ? 'text-white' : 'text-festara-navy'}`}>
              {formatDate(msg.created_at)}
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-white/90' : 'text-festara-ink/90'}`}>
            "{msg.message}"
          </p>
        </div>
      ))}
    </div>
  );
}
