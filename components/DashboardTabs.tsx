'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Tab = {
  id: string;
  label: string;
  icon: string;
};

const TABS: Tab[] = [
  { id: 'studio', label: 'Studio Design', icon: '🎨' },
  { id: 'overview', label: "Vue d'ensemble", icon: '📊' },
  { id: 'guests', label: 'CRM & Invités', icon: '👥' },
  { id: 'budget', label: 'Budget', icon: '💰' },
  { id: 'security', label: 'Sécurité & Scan', icon: '🛡️' },
  { id: 'team', label: 'Équipe', icon: '🤝' },
];

export default function DashboardTabs({ eventId }: { eventId: string }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'studio';

  return (
    <div className="w-full overflow-x-auto hide-scrollbar mb-10 pb-2">
      <div className="inline-flex items-center gap-2 bg-white/50 p-2 rounded-full backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative z-20">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/dashboard/${eventId}?tab=${tab.id}`}
              className={`relative group flex items-center gap-3 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 whitespace-nowrap overflow-hidden ${
                isActive
                  ? 'text-festara-navy shadow-[0_10px_30px_rgba(197,154,69,0.15)]'
                  : 'text-festara-ink/50 hover:text-festara-navy hover:bg-white/60'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-festara-sand border border-festara-gold/20 rounded-full"></div>
              )}
              
              <span className={`relative z-10 text-xl transition-transform duration-500 ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110 group-hover:rotate-12'}`}>
                {tab.icon}
              </span>
              <span className="relative z-10">{tab.label}</span>
              
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-festara-gold/0 via-festara-gold to-festara-gold/0 rounded-t-full opacity-50"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
