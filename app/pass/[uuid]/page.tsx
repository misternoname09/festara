import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Props = { params: { uuid: string } };

async function getPass(uuid: string) {
  // Pass de demo
  if (uuid === '00000000-0000-0000-0000-000000000000') {
    return {
      first_name: 'Khady Diop',
      party_size: 2,
      pass_code: 'DEMO24',
      pass_uuid: uuid,
      event: { title: 'Mariage Aïda & Modou', slug: 'demo' },
    };
  }
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('guests')
    .select('first_name, party_size, pass_code, pass_uuid, events(title, slug)')
    .eq('pass_uuid', uuid)
    .maybeSingle();
  if (!data) return null;
  return { ...data, event: (data as any).events };
}

export default async function PassPage({ params }: Props) {
  const pass = await getPass(params.uuid);
  if (!pass) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const qrData = await QRCode.toDataURL(`${base}/pass/${pass.pass_uuid}`, {
    margin: 1,
    width: 320,
    color: {
      dark: '#1A2A4A', // Festara Navy
      light: '#ffffff00' // Transparent background for glass effect
    }
  });

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 font-sans bg-[#050B14]">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-festara-gold/10 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-festara-teal/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      </div>

      <div className="w-full max-w-[400px] relative z-10 animate-fade-in-up">
        {/* The VIP Pass Card */}
        <div className="relative group">
          {/* Animated Gold Border Glow */}
          <div className="absolute -inset-1 bg-gradient-to-br from-festara-gold via-[#FDF5E6] to-[#C59A45] rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header: Event Title */}
            <div className="px-8 pt-10 pb-6 text-center relative border-b border-white/10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-festara-gold mb-3">
                Invitation Privée
              </p>
              <h1 className="text-3xl font-serif font-bold text-white leading-tight drop-shadow-md">
                {pass.event?.title}
              </h1>
            </div>

            {/* Body: Guest Info & QR Code */}
            <div className="px-8 py-8 flex flex-col items-center bg-gradient-to-b from-white/5 to-white/10">
              
              <div className="text-center mb-8 w-full">
                <p className="text-xs text-white/50 uppercase tracking-[0.2em] font-medium mb-1">Pass au nom de</p>
                <h2 className="text-2xl font-bold text-white font-serif tracking-wide truncate px-2">{pass.first_name}</h2>
                <div className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-black/20 rounded-full border border-white/10 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-festara-gold animate-pulse"></span>
                  <p className="text-sm font-semibold text-white/90">
                    {pass.party_size} Accès {pass.party_size > 1 ? 'Valides' : 'Valide'}
                  </p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="relative bg-white p-5 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)] border-4 border-festara-gold/30 group-hover:border-festara-gold transition-colors duration-500">
                {/* scanning laser line animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-festara-gold/80 shadow-[0_0_15px_#D4AF37] z-20 rounded-t-3xl opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_ease-in-out_infinite]"></div>
                
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrData}
                  alt="QR Pass Festara"
                  className="w-[200px] h-[200px] object-contain relative z-10"
                />
                
                {/* Decorative corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-festara-gold"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-festara-gold"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-festara-gold"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-festara-gold"></div>
              </div>

              {/* Code Manuel */}
              <div className="mt-8 text-center bg-black/30 w-full py-4 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-1">Code Manuel</p>
                <p className="text-3xl font-mono font-bold tracking-[0.3em] text-festara-gold drop-shadow-sm">
                  {pass.pass_code}
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-black/40 py-5 text-center flex flex-col items-center justify-center gap-1 border-t border-white/5">
              <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">
                Festara • Yëgël
              </span>
              <span className="text-[8px] uppercase tracking-widest text-white/20">
                Veuillez présenter ce code à l'entrée
              </span>
            </div>
          </div>
        </div>

        {/* Back to Invitation Button */}
        {pass.event?.slug && (
          <div className="mt-8 text-center">
            <Link href={`/i/${pass.event.slug}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-bold uppercase tracking-widest transition-all hover:-translate-y-1">
              <span>←</span> Voir l'invitation
            </Link>
          </div>
        )}
      </div>
      
      {/* Custom CSS for scan animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </main>
  );
}
