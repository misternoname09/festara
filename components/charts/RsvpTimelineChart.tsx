'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

export default function RsvpTimelineChart({ guests }: { guests: any[] }) {
  // Agréger les confirmations par date (YYYY-MM-DD)
  const confirmed = guests.filter((g) => g.rsvp_confirmed_at);
  const dataMap = new Map<string, number>();

  confirmed.forEach((g) => {
    const d = new Date(g.rsvp_confirmed_at).toISOString().split('T')[0];
    dataMap.set(d, (dataMap.get(d) || 0) + 1);
  });

  const rawData = Array.from(dataMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Cumul
  let cumul = 0;
  const data = rawData.map((d) => {
    cumul += d.count;
    return {
      date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      Total: cumul,
      Nouveaux: d.count,
    };
  });

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[#0A1226]/50">
        Pas encore assez de données.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0A122610" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#0A122680' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#0A122680' }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Area type="monotone" dataKey="Total" stroke="#0F766E" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
