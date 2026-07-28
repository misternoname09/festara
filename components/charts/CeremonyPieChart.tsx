'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function CeremonyPieChart({ guests }: { guests: any[] }) {
  const dataMap = new Map<string, number>();

  guests.forEach(g => {
    if (g.rsvp_confirmed_at && g.ceremonies_attending) {
      g.ceremonies_attending.forEach((ceremony: string) => {
        dataMap.set(ceremony, (dataMap.get(ceremony) || 0) + (g.party_size || 1));
      });
    }
  });

  const data = Array.from(dataMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#0F766E', '#C59A45', '#1E293B', '#F43F5E', '#8B5CF6'];

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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
