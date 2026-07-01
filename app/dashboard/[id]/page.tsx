import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { updateEvent } from '../actions';
import type { EventRow, EventStats } from '@/lib/types';
import { TEMPLATES } from '@/components/templates';
import PayButton from '@/components/PayButton';
import GalleryUploader from '@/components/GalleryUploader';
import AiTextGenerator from '@/components/AiTextGenerator';
import GuestImporter from '@/components/GuestImporter';
import WhatsAppDispatcher from '@/components/WhatsAppDispatcher';

import DashboardTabs from '@/components/DashboardTabs';
import CircularGauge from '@/components/CircularGauge';

export const dynamic = 'force-dynamic';

type Props = { params: { id: string }, searchParams: { tab?: string } };

export default async function EditEvent({ params, searchParams }: Props) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();
  if (!data) notFound();
  const ev = data as EventRow;

  // Recuperation des statistiques
  const { data: stat } = await supabase
    .from('event_stats')
    .select('*')
    .eq('event_id', ev.id)
    .maybeSingle();
  const s = stat as EventStats | null;

  // Garantit 3 lignes de ceremonie editables
  const rows = Array.from({ length: 3 }, (_, i) => ev.ceremonies[i] ?? null);
  const action = updateEvent.bind(null, ev.id);

  const inputClass = 'w-full rounded-xl px-4 min-h-[50px] text-base border border-festara-navy/10 bg-white/60 focus:bg-white focus:ring-2 focus:ring-festara-gold/50 outline-none transition-all placeholder:text-festara-ink/30';
  const labelClass = 'block text-xs font-bold text-festara-navy uppercase tracking-wider ml-1 mb-1.5';

  // Récupération des messages du livre d'or
  const { data: messagesData } = await supabase
    .from('guestbook_messages')
    .select('*')
    .eq('event_id', ev.id)
    .order('created_at', { ascending: false });
  const messages = messagesData || [];

  // Récupération des invités
  const { data: guestsData } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', ev.id)
    .order('created_at', { ascending: false });
  const guests = guestsData || [];

  const tab = searchParams.tab || 'overview';
  const confirmedGuestsCount = guests.filter((g: any) => g.rsvp_confirmed_at).length;
  const scannedGuestsCount = guests.filter((g: any) => g.scanned_at).length;
  const totalPeopleCount = s?.people_confirmed ?? 0;

  return (
    <main className="min-h-screen bg-festara-sand relative overflow-hidden font-sans pb-20">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-festara-navy pointer-events-none rounded-b-[4rem] shadow-2xl"></div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10 animate-fade-in-up">
        
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 text-white">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors uppercase tracking-wider mb-2">
              <span>←</span> Mes Événements
            </Link>
            <h1 className="text-4xl font-bold font-serif">{ev.title}</h1>
            <p className="text-sm text-white/70 mt-1 font-medium">Lien public : <span className="bg-white/20 px-2 py-0.5 rounded text-white selection:bg-white/40">festara.app/i/{ev.slug}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${ev.is_published ? 'bg-green-500/20 text-green-300 border-green-500/50' : 'bg-amber-500/20 text-amber-300 border-amber-500/50'}`}>
              {ev.is_published ? 'Publiée' : 'Brouillon'}
            </span>
            <Link href={`/i/${ev.slug}?ref=dashboard`} className="relative group inline-flex items-center justify-center gap-2 px-8 py-2.5 text-xs font-bold text-festara-navy uppercase tracking-widest rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all hover:-translate-y-1 bg-gradient-to-r from-white to-[#F5F0E6] border border-white/50">
              <span className="absolute inset-0 w-full h-full bg-festara-gold/5 group-hover:opacity-0 transition-opacity"></span>
              <span className="relative flex items-center gap-2">
                Aperçu Public <span className="text-lg leading-none group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-festara-gold">↗</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Dashboard Tabs Navigation */}
        <DashboardTabs eventId={ev.id} />

        {/* Tab Content Area */}
        <div className="animate-fade-in">
          
          {tab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Overview Stats */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass bg-white/90 rounded-3xl p-8 shadow-sm border border-black/5">
                  <h2 className="text-2xl font-bold text-festara-navy font-serif mb-8 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-festara-gold/10 flex items-center justify-center text-festara-gold">📊</span>
                    Statistiques en Temps Réel
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <CircularGauge 
                      value={confirmedGuestsCount} 
                      max={guests.length} 
                      label="RSVP Confirmés" 
                      sublabel="Groupes d'invités"
                      colorClass="text-festara-navy" 
                      strokeColor="#0A1226" 
                    />
                    <CircularGauge 
                      value={totalPeopleCount} 
                      max={totalPeopleCount > 0 ? totalPeopleCount : 1} // Évite division par zero, purement visuel ici
                      label="Personnes" 
                      sublabel="Total attendu (+1)"
                      colorClass="text-festara-teal" 
                      strokeColor="#0F766E" 
                    />
                    <CircularGauge 
                      value={scannedGuestsCount} 
                      max={confirmedGuestsCount} 
                      label="Scans Jour-J" 
                      sublabel="Invités arrivés"
                      colorClass="text-festara-gold" 
                      strokeColor="#C59A45" 
                    />
                  </div>
                </div>

                {/* Latest Guestbook Messages */}
                <div className="glass bg-white/90 rounded-3xl p-8 shadow-sm border border-black/5">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-festara-navy font-serif flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 text-sm">📖</span>
                      Derniers Mots Doux
                    </h2>
                    <span className="text-xs font-bold text-festara-ink/40 uppercase tracking-wider">{messages.length} total</span>
                  </div>
                  {messages.length === 0 ? (
                    <div className="text-center py-6 bg-festara-sand/30 rounded-2xl border border-dashed border-black/10">
                      <p className="text-sm text-festara-ink/60 font-medium">Aucun message pour le moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.slice(0, 3).map((msg: any) => (
                        <div key={msg.id} className="bg-festara-sand/30 rounded-2xl p-4 border border-black/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-festara-navy text-sm">{msg.author_name}</span>
                            <span className="text-[10px] uppercase tracking-widest text-festara-ink/40">{new Date(msg.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <p className="text-sm text-festara-ink/80 italic">"{msg.message}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Overview */}
              <div className="space-y-6">
                <div className="glass bg-white/90 rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-festara-teal/10 flex items-center justify-center text-festara-teal">📋</div>
                    <h2 className="text-lg font-bold text-festara-navy font-serif">Export Données</h2>
                  </div>
                  <p className="text-xs text-festara-ink/60 font-medium">Récupérez la liste complète en format Excel/CSV pour votre suivi.</p>
                  <a href={`/api/export/${ev.id}`} className="btn-outline w-full text-center border-festara-teal/30 text-festara-teal hover:bg-festara-teal hover:text-white">
                    Télécharger Export CSV
                  </a>
                </div>

                <div className="glass bg-white/90 rounded-3xl p-6 shadow-sm border border-black/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-festara-gold/10 flex items-center justify-center text-festara-gold">💎</div>
                    <h2 className="text-lg font-bold text-festara-navy font-serif">Abonnement</h2>
                  </div>
                  <PayButton eventId={ev.id} currentPlan={ev.plan} />
                </div>
              </div>
            </div>
          )}

          {tab === 'guests' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass bg-white/90 rounded-3xl p-8 shadow-sm border border-black/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-festara-teal/10 flex items-center justify-center text-festara-teal text-lg">👥</div>
                    <h2 className="text-2xl font-bold text-festara-navy font-serif">CRM Événementiel ({guests.length} invités)</h2>
                  </div>
                  
                  {guests.length === 0 ? (
                    <div className="text-center py-12 bg-festara-sand/30 rounded-2xl border border-dashed border-black/10">
                      <p className="text-sm text-festara-ink/60 font-medium mb-2">Votre liste d'invités est vide.</p>
                      <p className="text-xs text-festara-ink/40">Utilisez le module d'import Excel à droite pour commencer.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-black/5 text-festara-ink/50 uppercase tracking-wider text-[10px] font-bold">
                            <th className="pb-3 pl-2">Nom</th>
                            <th className="pb-3 text-center">Personnes</th>
                            <th className="pb-3 text-center">RSVP</th>
                            <th className="pb-3 text-center">Statut Jour-J</th>
                          </tr>
                        </thead>
                        <tbody>
                          {guests.map((g: any) => (
                            <tr key={g.id} className="border-b border-black/[0.02] hover:bg-black/[0.01]">
                              <td className="py-3 pl-2 font-bold text-festara-navy">{g.first_name} {g.last_name}</td>
                              <td className="py-3 text-center text-festara-ink/70 font-mono"><span className="bg-festara-sand/50 px-2 py-0.5 rounded-md">{g.party_size}</span></td>
                              <td className="py-3 text-center">
                                {g.rsvp_confirmed_at ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Confirmé</span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-[10px] font-bold uppercase tracking-wider">En attente</span>
                                )}
                              </td>
                              <td className="py-3 text-center">
                                {g.scanned_at ? (
                                  <span className="px-2 py-1 bg-festara-gold/20 text-festara-gold rounded-md text-[10px] font-bold uppercase tracking-wider">Scanné</span>
                                ) : (
                                  <span className="text-festara-ink/20">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <GuestImporter eventId={ev.id} />
                <WhatsAppDispatcher guests={guests} eventSlug={ev.slug} />
              </div>
            </div>
          )}

          {tab === 'studio' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass bg-white/90 rounded-3xl p-8 shadow-sm border border-black/5">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-full bg-festara-navy/10 flex items-center justify-center text-festara-navy">⚙️</div>
                    <h2 className="text-2xl font-bold text-festara-navy font-serif">Studio de Personnalisation</h2>
                  </div>

                  <form action={action} className="space-y-8">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Titre de l'événement</label>
                        <input name="title" defaultValue={ev.title} className={inputClass} placeholder="Aïda & Modou" />
                      </div>
                      <div>
                        <label className={labelClass}>Thème Visuel</label>
                        <select name="template" defaultValue={ev.template} className={inputClass}>
                          {Object.entries(TEMPLATES).map(([k, v]) => (
                            <option key={k} value={k}>{v.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <AiTextGenerator initialText={ev.welcome_message} title={ev.title} />
                    </div>

                    <div className="pt-6 border-t border-black/5">
                      <h3 className="text-lg font-bold text-festara-navy mb-4">Programme & Lieux</h3>
                      <div className="space-y-4">
                        {rows.map((c, i) => (
                          <div key={i} className="bg-festara-sand/50 border border-black/5 rounded-2xl p-5 transition-shadow hover:shadow-md relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-festara-gold/30 group-focus-within:bg-festara-gold transition-colors"></div>
                            <input type="hidden" name={`cid_${i}`} defaultValue={c?.id || `c${i}`} />
                            
                            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className={labelClass}>Cérémonie</label>
                                <input name={`name_${i}`} defaultValue={c?.name || ''} placeholder={`Nom (ex: Mairie)`} className={inputClass} />
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className={labelClass}>Date</label>
                                  <input type="date" name={`date_${i}`} defaultValue={c?.date || ''} className={inputClass} />
                                </div>
                                <div className="flex-1">
                                  <label className={labelClass}>Heure</label>
                                  <input type="time" name={`time_${i}`} defaultValue={c?.time || ''} className={inputClass} />
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <label className={labelClass}>Adresse exacte</label>
                              <input name={`location_${i}`} defaultValue={c?.location || ''} placeholder="Lieu complet" className={inputClass} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-festara-navy/[0.02] p-4 rounded-2xl border border-festara-navy/5">
                      <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <label className={`flex items-center gap-3 ${ev.plan === 'gratuit' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer group'}`}>
                          <div className="relative">
                            <input type="checkbox" name="is_published" defaultChecked={ev.plan === 'gratuit' ? false : ev.is_published} disabled={ev.plan === 'gratuit'} className="peer sr-only" />
                            <div className={`w-12 h-6 rounded-full transition-colors ${ev.plan === 'gratuit' ? 'bg-black/10' : 'bg-black/10 peer-checked:bg-festara-teal'}`}></div>
                            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6 shadow-sm"></div>
                          </div>
                          <span className="text-sm font-bold text-festara-navy flex items-center gap-2">
                            Publier officiellement {ev.plan === 'gratuit' && '🔒'}
                          </span>
                        </label>
                        {ev.plan === 'gratuit' && (
                          <p className="text-[10px] font-bold uppercase tracking-wider text-red-500/80 mt-1 ml-1 max-w-[200px] leading-tight">
                            Achetez un abonnement pour activer le lien de vos invités.
                          </p>
                        )}
                      </div>

                      <button className="btn-primary w-full sm:w-auto px-8 py-3 rounded-xl">Enregistrer les modifications</button>
                    </div>
                  </form>
                </div>
              </div>
              
              <div className="space-y-6">
                <GalleryUploader eventId={ev.id} initialUrls={ev.couple_photo_url} />
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="max-w-2xl mx-auto">
              <div className="glass bg-[#0A1226] text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group border border-white/10">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-festara-gold/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-festara-gold/20 flex items-center justify-center text-festara-gold text-2xl">🛡️</div>
                  <div>
                    <h2 className="text-2xl font-bold font-serif">Mode Sécurité & Vigiles</h2>
                    <p className="text-sm text-white/60 font-medium mt-1">Interface isolée pour le contrôle d'accès</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 relative z-10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-festara-gold mb-3">Comment ça marche ?</h3>
                  <ul className="text-sm text-white/80 space-y-3 font-medium">
                    <li className="flex gap-3"><span className="text-festara-gold">1.</span> Cliquez sur le bouton ci-dessous pour générer le lien de sécurité.</li>
                    <li className="flex gap-3"><span className="text-festara-gold">2.</span> Partagez ce lien à vos agents de sécurité à l'entrée.</li>
                    <li className="flex gap-3"><span className="text-festara-gold">3.</span> Les agents ouvrent le lien sur leur smartphone (la caméra s'active).</li>
                    <li className="flex gap-3"><span className="text-festara-gold">4.</span> Ils scannent les QR Codes. Le retour aux paramètres privés de l'événement est bloqué pour eux.</li>
                  </ul>
                </div>
                
                <Link href={`/scan/${ev.id}`} target="_blank" className="btn bg-festara-gold hover:bg-[#DFB769] text-festara-navy font-bold w-full py-5 text-lg shadow-[0_10px_30px_rgba(197,154,69,0.3)] hover:shadow-[0_15px_40px_rgba(197,154,69,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 relative z-10 rounded-xl">
                  <span className="text-2xl">📷</span>
                  Ouvrir le Scanner de QR Codes
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
