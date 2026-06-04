import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Props = { params: { uuid: string } };

async function getPass(uuid: string) {
  // Pass de demo
  if (uuid === '00000000-0000-0000-0000-000000000000') {
    return {
      first_name: 'Fatou',
      party_size: 3,
      pass_code: 'DEMO24',
      pass_uuid: uuid,
      event: { title: 'Mariage Aïda & Modou' },
    };
  }
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('guests')
    .select('first_name, party_size, pass_code, pass_uuid, events(title)')
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
    width: 240,
  });

  return (
    <main className="min-h-screen bg-festara-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden text-center">
        <div className="bg-festara-navy text-white py-5">
          <p className="uppercase tracking-[0.2em] text-xs text-festara-gold">
            Pass Festara
          </p>
          <h1 className="mt-1 text-lg font-semibold">{pass.event?.title}</h1>
        </div>

        <div className="px-6 py-7">
          <p className="text-2xl font-bold text-festara-navy">{pass.first_name}</p>
          <p className="text-sm text-festara-ink/60">
            {pass.party_size} personne{pass.party_size > 1 ? 's' : ''}
          </p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrData}
            alt="QR Pass"
            className="mx-auto mt-6 w-56 h-56"
            width={224}
            height={224}
          />

          <p className="mt-4 text-sm text-festara-ink/60">Code d&apos;entrée</p>
          <p className="text-3xl font-mono font-bold tracking-widest text-festara-navy">
            {pass.pass_code}
          </p>

          <p className="mt-6 text-[11px] text-festara-ink/40">
            Présente ce QR ou ce code à l&apos;entrée. Créé avec Festara.
          </p>
        </div>
      </div>
    </main>
  );
}
