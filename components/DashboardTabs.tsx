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
  { id: 'billing', label: 'Facturation & Plan', icon: '💳' },
];

export default function DashboardTabs({ eventId }: { eventId: string }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'studio';

  return (
    <div className="w-full overflow-x-auto hide-scrollbar pb-2">
      <div className="inline-flex items-center gap-1.5 bg-[#0A1226]/5 p-1.5 rounded-2xl border border-black/5">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/dashboard/${eventId}?tab=${tab.id}`}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? 'text-festara-navy bg-white shadow-sm border border-black/5'
                  : 'text-festara-navy/60 hover:text-festara-navy hover:bg-white/50'
              }`}
            >
              <span className={`text-base transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : ''}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              
              {isActive && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-festara-gold/0 via-festara-gold to-festara-gold/0 rounded-t-full opacity-70"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
