import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { updateEvent } from '../actions';
import type { EventRow, EventStats, GuestRow } from '@/lib/types';
import { TEMPLATES } from '@/components/templates';
import PayButton from '@/components/PayButton';
import GalleryUploader from '@/components/GalleryUploader';
import AiTextGenerator from '@/components/AiTextGenerator';
import GuestImporter from '@/components/GuestImporter';
import WhatsAppDispatcher from '@/components/WhatsAppDispatcher';
import ScrollToTop from '@/components/ScrollToTop';
import GuestTable from '@/components/GuestTable';
import SaveButton from '@/components/SaveButton';

import DashboardTabs from '@/components/DashboardTabs';
import CircularGauge from '@/components/CircularGauge';
import BudgetTracker from '@/components/BudgetTracker';
import PayoutRequest from '@/components/PayoutRequest';
import ShareLink from '@/components/ShareLink';
import { getAvailableBalance } from '@/lib/balance';
import EventTeam from '@/components/EventTeam';
import RsvpTimelineChart from '@/components/charts/RsvpTimelineChart';
import CeremonyPieChart from '@/components/charts/CeremonyPieChart';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }>, searchParams: Promise<{ tab?: string }> };

export default async function EditEvent(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('events')
    .select('*, organizations(plan)')
    .eq('id', params.id)
    .maybeSingle();
  if (!data) notFound();
  const ev = data as EventRow & { organizations: { plan: string } | null };

  const isFreePlan = ev.plan === 'gratuit' && ev.organizations?.plan !== 'agency';

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

  const inputClass = 'dashboard-input';
  const labelClass = 'dashboard-label';

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

  // Récupération des postes budgétaires
  const { data: budgetData } = await supabase
    .from('budget_items')
    .select('*')
    .eq('event_id', ev.id)
    .order('created_at', { ascending: true });
  const budgetItems = budgetData || [];

  // Récupération des reversements et solde
  const availableBalance = await getAvailableBalance(ev.id);
  const { data: payoutsData } = await supabase
    .from('payouts')
    .select('*')
    .eq('event_id', ev.id)
    .order('created_at', { ascending: false });
  const payouts = payoutsData || [];

  // Récupération des agences de l'utilisateur (filtrées par RLS org_select)
  const { data: userOrgsData } = await supabase
    .from('organizations')
    .select('id, name')
    .order('name');
  const userOrgs = userOrgsData || [];

  // Récupération des collaborateurs et invitations
  const { data: collaboratorsData } = await supabase
    .from('event_collaborators')
    .select('id, event_id, user_id, role, users(email)')
    .eq('event_id', ev.id);
  const collaborators = collaboratorsData || [];

  const { data: invitationsData } = await supabase
    .from('event_invitations')
    .select('*')
    .eq('event_id', ev.id)
    .order('created_at', { ascending: false });
  const invitations = invitationsData || [];

  const tab = searchParams.tab || 'studio';
  const confirmedGuestsCount = guests.filter((g: GuestRow) => g.rsvp_confirmed_at).length;
  const scannedGuestsCount = guests.filter((g: GuestRow) => g.scanned_at).length;
  const totalPeopleCount = s?.people_confirmed ?? 0;

  return (
    <main className="min-h-screen bg-festara-sand relative font-sans pb-32 selection:bg-festara-gold/30 selection:text-festara-navy">
      {/* --- CSS Animations Inline --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* --- CLEAN DASHBOARD HEADER --- */}
      <div className="bg-white border-b border-black/5 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0s' }}>
            <div>
              <Link href="/dashboard" className="group inline-flex items-center gap-2 text-[10px] font-bold text-festara-navy/50 hover:text-festara-navy transition-all duration-300 uppercase tracking-[0.2em] mb-6 bg-white border border-[#0A1226]/5 hover:border-[#0A1226]/15 hover:shadow-sm px-4 py-2 rounded-full">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0A1226]/5 group-hover:bg-[#0A1226]/10 transition-colors">
                  <span className="text-xs leading-none -translate-y-[1px] group-hover:-translate-x-0.5 transition-transform">←</span>
                </div>
                Retour
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold font-serif text-festara-navy tracking-tight">{ev.title}</h1>
              <div className="flex items-center gap-3 mt-3">
                <span className={`inline-flex px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${ev.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {ev.is_published ? '✨ En Ligne' : 'Brouillon'}
                </span>
                <span className="bg-[#0A1226]/5 px-3 py-1 rounded-md text-festara-navy/70 font-mono text-xs font-medium border border-black/5 flex items-center gap-2">
                  festara.app/i/{ev.slug}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href={`/i/${ev.slug}?ref=dashboard`} target="_blank" className="relative group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold text-festara-navy uppercase tracking-widest rounded-xl bg-white border border-black/10 hover:border-festara-gold/50 hover:shadow-md transition-all">
                <span className="relative flex items-center gap-2">
                  Aperçu Public <span className="text-lg leading-none group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-festara-gold">↗</span>
                </span>
              </Link>
            </div>
          </div>
          
          {/* Tabs Navigation now part of the clean header visually */}
          <div className="mt-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <DashboardTabs eventId={ev.id} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        
        {/* Tab Content Area */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          
          {isFreePlan && (
            <div className="mb-8 p-6 bg-gradient-to-r from-festara-gold/10 to-festara-sand/50 rounded-2xl border border-festara-gold/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-festara-navy font-bold font-serif text-lg flex items-center gap-2">
                  <span>💎</span> Débloquez toutes les fonctionnalités
                </h3>
                <p className="text-festara-navy/70 text-sm mt-1">Vous utilisez la version gratuite. Passez à un plan payant pour débloquer les <strong>invités illimités</strong> et le <strong>scan des QR codes</strong>.</p>
              </div>
              <Link href="?tab=overview#abonnement" className="shrink-0 px-6 py-3 bg-festara-navy text-white text-sm font-bold rounded-xl hover:bg-festara-gold transition-colors shadow-sm">
                Voir les abonnements
              </Link>
            </div>
          )}
          
          {tab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Overview Stats */}
              <div className="lg:col-span-2 space-y-8">
                <div className="dashboard-card group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-festara-gold/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <h2 className="text-2xl font-bold text-[#0A1226] font-serif mb-10 flex items-center gap-4 relative z-10">
                    <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-festara-sand to-festara-gold/20 flex items-center justify-center text-festara-gold shadow-inner border border-white text-xl">📊</span>
                    Statistiques en Temps Réel
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 relative z-10">
                    <CircularGauge 
                      value={confirmedGuestsCount} 
                      max={guests.length} 
                      label="RSVP Confirmés" 
                      sublabel="Groupes d'invités"
                      colorClass="text-[#0A1226]" 
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

                {/* --- NOUVEAUX GRAPHIQUES ANALYTICS --- */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="dashboard-card group">
                    <h3 className="text-sm font-bold text-[#0A1226]/50 uppercase tracking-widest mb-6">Évolution des Confirmations</h3>
                    <RsvpTimelineChart guests={guests} />
                  </div>
                  <div className="dashboard-card group">
                    <h3 className="text-sm font-bold text-[#0A1226]/50 uppercase tracking-widest mb-6">Répartition par Cérémonie</h3>
                    <CeremonyPieChart guests={guests} />
                  </div>
                </div>

                {/* Latest Guestbook Messages */}
                <div className="dashboard-card group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-2xl font-bold text-[#0A1226] font-serif flex items-center gap-4">
                      <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner border border-white text-xl">📖</span>
                      Derniers Mots Doux
                    </h2>
                    <span className="text-xs font-bold text-[#0A1226]/60 uppercase tracking-[0.2em] bg-festara-sand/50 px-4 py-2 rounded-full">{messages.length} total</span>
                  </div>
                  {messages.length === 0 ? (
                    <div className="text-center py-12 bg-[#FDFBF7] rounded-[1.5rem] border border-dashed border-[#0A1226]/10 relative z-10">
                      <p className="text-base text-[#0A1226]/60 font-medium">Aucun message pour le moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 relative z-10">
                      {messages.slice(0, 3).map((msg: any) => (
                        <div key={msg.id} className="bg-[#FDFBF7] rounded-[1.5rem] p-6 border border-black/5 hover:border-black/10 transition-colors shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-[#0A1226] text-sm">{msg.author_name}</span>
                            <span className="text-[11px] uppercase tracking-widest text-[#0A1226]/60 font-bold">{new Date(msg.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <p className="text-base text-[#0A1226]/80 italic leading-relaxed">"{msg.message}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payout Request */}
                <PayoutRequest 
                  eventId={ev.id} 
                  availableBalance={availableBalance} 
                  payouts={payouts} 
                />
              </div>

              {/* Sidebar Overview */}
              <div className="space-y-8">
                <div className="dashboard-card flex flex-col gap-6 group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-festara-teal/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-50 to-festara-teal/10 flex items-center justify-center text-festara-teal shadow-inner border border-white text-xl">📋</div>
                    <h2 className="text-xl font-bold text-[#0A1226] font-serif">Export Données</h2>
                  </div>
                  <p className="text-sm text-[#0A1226]/60 font-medium leading-relaxed relative z-10">Récupérez la liste complète en format Excel/CSV pour votre suivi.</p>
                  <a href={`/api/export/${ev.id}`} className="relative inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold uppercase tracking-widest text-festara-teal border border-festara-teal/20 rounded-2xl hover:bg-festara-teal hover:text-white transition-all hover:shadow-[0_10px_20px_rgba(15,118,110,0.2)] hover:-translate-y-1 z-10 bg-white/50">
                    Télécharger Export CSV
                  </a>
                </div>


              </div>
            </div>
          )}

          {tab === 'guests' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="dashboard-card group">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-50 to-festara-teal/10 flex items-center justify-center text-festara-teal shadow-inner border border-white text-xl">👥</div>
                    <h2 className="text-2xl font-bold text-[#0A1226] font-serif">CRM Événementiel ({guests.length} invités)</h2>
                  </div>
                  
                  {guests.length === 0 ? (
                    <div className="text-center py-16 bg-[#FDFBF7] rounded-[1.5rem] border border-dashed border-[#0A1226]/10">
                      <p className="text-base text-[#0A1226]/60 font-medium mb-2">Votre liste d'invités est vide.</p>
                      <p className="text-xs text-[#0A1226]/60 uppercase tracking-widest font-bold">Utilisez le module d'import Excel à droite pour commencer.</p>
                    </div>
                  ) : (
                    <GuestTable guests={guests} />
                  )}
                </div>
              </div>
              <div className="space-y-8">
                <GuestImporter eventId={ev.id} />
                <WhatsAppDispatcher guests={guests} eventSlug={ev.slug} eventId={ev.id} plan={ev.plan} />
              </div>
            </div>
          )}

          {tab === 'budget' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                <BudgetTracker eventId={ev.id} initialItems={budgetItems} />
              </div>
            </div>
          )}

          {tab === 'studio' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="dashboard-card group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-200/50 flex items-center justify-center text-slate-600 shadow-inner border border-white text-xl">🎨</div>
                    <h2 className="text-2xl font-bold text-[#0A1226] font-serif">Studio de Personnalisation</h2>
                  </div>

                  <ScrollToTop trigger={ev.is_published} />

                  {ev.is_published && (
                    <div id="studio-banner" className="mb-10 p-5 bg-green-50 border border-green-200 rounded-3xl flex flex-col sm:flex-row items-center gap-5 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex flex-shrink-0 items-center justify-center text-2xl shadow-inner">✅</div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-green-800 font-bold text-lg">Cet événement est en ligne !</h3>
                        <p className="text-green-700/80 text-sm mt-1">Partagez ce lien avec vos invités pour qu'ils puissent confirmer leur présence.</p>
                      </div>
                      <div className="w-full sm:w-auto">
                        <ShareLink slug={ev.slug} title={ev.title} />
                      </div>
                    </div>
                  )}

                  <form action={action} className="space-y-10">
                    <div className="grid sm:grid-cols-2 gap-8">
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

                    <div className="grid sm:grid-cols-2 gap-8">
                      <div>
                        <label className={labelClass}>Agence (B2B)</label>
                        <select name="organization_id" defaultValue={ev.organization_id || ''} className={inputClass}>
                          <option value="">-- Aucune (Événement personnel) --</option>
                          {userOrgs.map((org: { id: string, name: string }) => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-4">
                      <AiTextGenerator initialText={ev.welcome_message} title={ev.title} />
                    </div>

                    <div className="pt-8 border-t border-black/5">
                      <h3 className="text-xl font-bold text-[#0A1226] font-serif mb-6">Programme & Lieux</h3>
                      <div className="space-y-6">
                        {rows.map((c, i) => (
                          <div key={i} className="dashboard-card relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-festara-gold/30 group-focus-within:bg-festara-gold transition-colors"></div>
                            <input type="hidden" name={`cid_${i}`} defaultValue={c?.id || `c${i}`} />
                            
                            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                              <div>
                                <label className={labelClass}>Cérémonie</label>
                                <input name={`name_${i}`} defaultValue={c?.name || ''} placeholder={`Nom (ex: Mairie)`} className={inputClass + ' bg-white'} />
                              </div>
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <label className={labelClass}>Date</label>
                                  <input type="date" name={`date_${i}`} defaultValue={c?.date || ''} className={inputClass + ' bg-white'} />
                                </div>
                                <div className="flex-1">
                                  <label className={labelClass}>Heure</label>
                                  <input type="time" name={`time_${i}`} defaultValue={c?.time || ''} className={inputClass + ' bg-white'} />
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <label className={labelClass}>Adresse exacte</label>
                              <input name={`location_${i}`} defaultValue={c?.location || ''} placeholder="Lieu complet" className={inputClass + ' bg-white'} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="group/publish pt-8 flex flex-col sm:flex-row items-center justify-between gap-8 bg-white p-6 rounded-2xl border border-black/5 shadow-sm mt-8">
                      <div className="flex flex-col gap-2">
                        <label className={`flex items-center gap-4 ${isFreePlan ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group/toggle'}`}>
                          <input type="checkbox" name="is_published" defaultChecked={isFreePlan ? false : ev.is_published} disabled={isFreePlan} className="peer sr-only" />
                          <div className={`relative w-14 h-7 rounded-full transition-colors border border-black/5 ${isFreePlan ? 'bg-[#0A1226]/10' : 'bg-[#0A1226]/10 peer-checked:bg-festara-teal'}`}>
                            <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-all peer-checked:translate-x-7 shadow-sm"></div>
                          </div>
                          <span className="font-bold text-[#0A1226] text-sm flex items-center gap-2 uppercase tracking-wider group-has-[:checked]/publish:text-festara-teal transition-colors">
                            Publier officiellement {isFreePlan && '🔒'}
                          </span>
                        </label>
                        {isFreePlan && (
                          <p className="text-xs font-bold uppercase tracking-wider text-red-500/80 mt-1 max-w-[250px] leading-relaxed">
                            Achetez un abonnement pour activer le lien de vos invités.
                          </p>
                        )}
                      </div>

                      <SaveButton />
                    </div>
                  </form>
                </div>
              </div>
              
              <div className="space-y-8">
                <GalleryUploader eventId={ev.id} initialUrls={ev.couple_photo_url} />
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-[#0A1226] text-white rounded-[3rem] p-10 sm:p-16 shadow-[0_30px_60px_rgba(10,18,38,0.4)] relative overflow-hidden group border border-white/10">
                <div className="absolute -right-32 -top-32 w-96 h-96 bg-[radial-gradient(circle,rgba(197,154,69,0.15)_0%,transparent_60%)] rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-festara-gold/20 to-festara-gold/5 flex items-center justify-center text-festara-gold text-3xl shadow-inner border border-festara-gold/20">🛡️</div>
                  <div>
                    <h2 className="text-3xl font-bold font-serif mb-2">Mode Sécurité & Vigiles</h2>
                    <p className="text-base text-white/60 font-medium">Interface isolée pour le contrôle d'accès</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 relative z-10 backdrop-blur-md">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-festara-gold mb-5">Comment ça marche ?</h3>
                  <ul className="text-sm text-white/80 space-y-5 font-medium leading-relaxed">
                    <li className="flex gap-4"><span className="text-festara-gold font-bold">1.</span> Cliquez sur le bouton ci-dessous pour générer le lien de sécurité.</li>
                    <li className="flex gap-4"><span className="text-festara-gold font-bold">2.</span> Partagez ce lien à vos agents de sécurité à l'entrée.</li>
                    <li className="flex gap-4"><span className="text-festara-gold font-bold">3.</span> Les agents ouvrent le lien sur leur smartphone (la caméra s'active).</li>
                    <li className="flex gap-4"><span className="text-festara-gold font-bold">4.</span> Ils scannent les QR Codes. Le retour aux paramètres privés de l'événement est bloqué pour eux.</li>
                  </ul>
                </div>
                
                <Link href={`/scan/${ev.id}`} target="_blank" className="relative group overflow-hidden bg-gradient-to-r from-festara-gold to-[#DFB769] hover:from-[#DFB769] hover:to-[#C59A45] text-[#0A1226] font-bold w-full py-6 text-lg shadow-[0_15px_40px_rgba(197,154,69,0.3)] hover:shadow-[0_20px_50px_rgba(197,154,69,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-4 z-10 rounded-[2rem]">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                  <span className="text-3xl relative z-10 group-hover:scale-110 transition-transform">📷</span>
                  <span className="relative z-10 tracking-wide">Ouvrir le Scanner de QR Codes</span>
                </Link>
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div className="max-w-4xl mx-auto">
              <div className="dashboard-card group relative overflow-hidden bg-[#0A1226] text-white rounded-[3rem] p-10 sm:p-16 shadow-[0_30px_60px_rgba(10,18,38,0.4)] border border-white/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(197,154,69,0.15)_0%,transparent_60%)] rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-festara-gold/20 to-festara-gold/5 flex items-center justify-center text-festara-gold text-3xl shadow-inner border border-festara-gold/20">💳</div>
                  <div>
                    <h2 className="text-3xl font-bold font-serif mb-2">Facturation & Plan</h2>
                    <p className="text-base text-gray-100 font-medium">Gérez votre abonnement et débloquez des fonctionnalités premium.</p>
                  </div>
                </div>
                
                <div className="relative z-10 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                  <PayButton eventId={ev.id} currentPlan={ev.plan} />
                </div>
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div className="max-w-4xl mx-auto">
              <EventTeam 
                eventId={ev.id} 
                collaborators={collaborators} 
                invitations={invitations} 
              />
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

