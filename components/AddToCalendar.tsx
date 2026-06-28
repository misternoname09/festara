'use client';

export default function AddToCalendar({ title, date, location, isDark }: { title: string; date: string; location: string; isDark: boolean }) {
  const downloadICS = () => {
    // Generate simple ICS content
    const startDate = date.replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate}T090000Z
DTEND:${startDate}T230000Z
SUMMARY:${title}
LOCATION:${location}
DESCRIPTION:Ne ratez pas ce grand jour ! Confirmez votre présence sur notre faire-part Festara.
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'mariage.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={downloadICS}
      className={`mt-10 px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto shadow-2xl
        ${isDark ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:shadow-white/10' : 'bg-black/5 text-festara-navy hover:bg-black/10 border border-black/10 hover:shadow-black/10'}`}
    >
      <span className="text-lg">📅</span> Ajouter à l'agenda
    </button>
  );
}
