"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toggleBlockUserAction, deleteUserAction, editUserAction, updatePayoutStatusAction, updateEventAdminStatusAction, refundTransactionAction, updateGlobalSettingsAction, addAdminUserAction, removeAdminUserAction } from './actions';

// --- Icons ---
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UnlockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BanknotesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const CogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

type User = {
  id: string;
  name: string;
  email: string;
  status: string;
  events: number;
  created: string;
};

type Transaction = {
  id: string;
  user: string;
  amount: string;
  type: string;
  time: string;
  status?: string;
  refund_status?: string;
};

type Stats = {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
};

type Payout = {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  bank_details: string;
  status: 'pending' | 'processed' | 'rejected';
  created_at: string;
};

type SupportTicket = {
  id: string;
  user_id: string;
  user_name: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved' | 'closed';
  created_at: string;
};

type EventData = {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  slug: string;
  admin_status: 'active' | 'suspended';
  is_published: boolean;
};

type Settings = {
  commission_rate: number;
  maintenance_mode: boolean;
};

type AdminUser = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'finance' | 'moderator' | 'support';
  created_at: string;
};

export default function AdminClient({ 
  currentRole,
  initialAdminUsers,
  initialUsers, 
  initialTransactions, 
  initialPayouts,
  initialTickets,
  initialEvents,
  initialSettings,
  stats 
}: { 
  currentRole: string | false,
  initialAdminUsers: AdminUser[],
  initialUsers: User[], 
  initialTransactions: Transaction[], 
  initialPayouts: Payout[],
  initialTickets: SupportTicket[],
  initialEvents: EventData[],
  initialSettings: Settings,
  stats: Stats 
}) {
  const router = useRouter();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers || []);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts || []);
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets || []);
  const [events, setEvents] = useState<EventData[]>(initialEvents || []);
  const [settings, setSettings] = useState<Settings>(initialSettings || { commission_rate: 5, maintenance_mode: false });
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTxns = initialTransactions.filter(t => 
    t.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'superadmin'|'finance'|'moderator'|'support'>('support');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{id: string, name: string, email: string} | null>(null);

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await editUserAction(editingUser.id, editingUser.name, editingUser.email);
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, name: editingUser.name, email: editingUser.email } : u));
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      alert("Erreur lors de la modification : " + err.message);
    }
  };

  const toggleBlock = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = await toggleBlockUserAction(userId, currentStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur définitivement ?")) return;
    try {
      await deleteUserAction(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const handlePayoutStatus = async (payoutId: string, status: 'processed' | 'rejected') => {
    if (!confirm(`Confirmer le statut ${status} pour ce reversement ?`)) return;
    try {
      await updatePayoutStatusAction(payoutId, status);
      setPayouts(payouts.map(p => p.id === payoutId ? { ...p, status } : p));
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const handleEventStatus = async (eventId: string, admin_status: 'active' | 'suspended') => {
    const action = admin_status === 'suspended' ? 'suspendre' : 'réactiver';
    if (!confirm(`Voulez-vous vraiment ${action} cet événement ?`)) return;
    try {
      await updateEventAdminStatusAction(eventId, admin_status);
      setEvents(events.map(e => e.id === eventId ? { ...e, admin_status } : e));
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const handleRefund = async (transactionId: string) => {
    if (!confirm("Voulez-vous vraiment rembourser cette transaction ?")) return;
    try {
      await refundTransactionAction(transactionId);
      setTransactions(transactions.map(t => t.id === transactionId ? { ...t, refund_status: 'refunded' } : t));
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateGlobalSettingsAction(settings.commission_rate, settings.maintenance_mode);
      alert("Paramètres sauvegardés avec succès !");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAdminUserAction(newAdminEmail, newAdminRole);
      alert("Administrateur ajouté ou invité avec succès ! (Rechargez la page pour le voir dans la liste)");
      setNewAdminEmail('');
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (!confirm("Voulez-vous révoquer l'accès de cet administrateur ?")) return;
    try {
      await removeAdminUserAction(adminId);
      setAdminUsers(adminUsers.filter(a => a.id !== adminId));
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(val);
  };

  return (
    <div className="min-h-screen bg-festara-sand flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-festara-navy text-festara-sand flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-serif text-festara-gold font-bold">Festara Admin</h1>
          <p className="text-sm opacity-60">Superviseur Global</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-festara-gold text-festara-navy font-medium' : 'hover:bg-white/5'}`}
          >
            <ActivityIcon />
            <span>Vue d'ensemble</span>
          </button>
          
          {(currentRole === 'superadmin' || currentRole === 'moderator') && (
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-festara-gold text-festara-navy font-medium' : 'hover:bg-white/5'}`}
            >
              <UsersIcon />
              <span>Gestion Comptes</span>
            </button>
          )}
          
          {(currentRole === 'superadmin' || currentRole === 'finance') && (
            <>
              <button 
                onClick={() => setActiveTab('transactions')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'transactions' ? 'bg-festara-gold text-festara-navy font-medium' : 'hover:bg-white/5'}`}
              >
                <CreditCardIcon />
                <span>Transactions & Flux</span>
              </button>
              <button 
                onClick={() => setActiveTab('payouts')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'payouts' ? 'bg-festara-gold text-festara-navy font-medium' : 'hover:bg-white/5'}`}
              >
                <BanknotesIcon />
                <span>Reversements</span>
              </button>
            </>
          )}

          {(currentRole === 'superadmin' || currentRole === 'moderator') && (
            <button 
              onClick={() => setActiveTab('moderation')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'moderation' ? 'bg-festara-gold text-festara-navy font-medium' : 'hover:bg-white/5'}`}
            >
              <ExclamationTriangleIcon />
              <span>Modération</span>
            </button>
          )}

          {(currentRole === 'superadmin' || currentRole === 'support') && (
            <button 
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'support' ? 'bg-festara-gold text-festara-navy font-medium' : 'hover:bg-white/5'}`}
            >
              <ChatBubbleIcon />
              <span>Support Client</span>
            </button>
          )}

          {currentRole === 'superadmin' && (
            <>
              <button 
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'team' ? 'bg-festara-gold text-festara-navy font-medium' : 'hover:bg-white/5'}`}
              >
                <UsersIcon />
                <span>Équipe (Admins)</span>
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'security' ? 'bg-festara-gold text-festara-navy font-medium' : 'hover:bg-white/5'}`}
              >
                <ShieldIcon />
                <span>Sécurité & Logs</span>
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-festara-gold text-festara-navy font-medium' : 'hover:bg-white/5'}`}
              >
                <CogIcon />
                <span>Paramètres</span>
              </button>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-festara-gold flex items-center justify-center text-festara-navy font-bold uppercase">
                {currentRole ? currentRole.substring(0, 2) : '??'}
              </div>
              <div>
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-festara-gold capitalize">Rôle: {currentRole}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Se déconnecter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        
        {/* Top Header */}
        <header className="bg-white/60 backdrop-blur-md border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center bg-white rounded-full px-4 py-2 w-96 shadow-sm border border-gray-100">
            <SearchIcon />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un utilisateur, un événement, une transaction..." 
              className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm text-festara-ink"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-gray-700 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                  <div className="p-3 border-b border-gray-100 font-bold text-sm text-festara-navy">Notifications (0)</div>
                  <ul className="text-sm text-left">
                    <li className="p-3 text-gray-500">Aucune nouvelle notification.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-serif text-festara-navy font-bold">Panneau de Contrôle Central</h2>
            <p className="text-gray-500 mt-1">Gérez l'ensemble de la plateforme (Données réelles).</p>
          </div>

          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <UsersIcon />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Utilisateurs Totaux</p>
                  <p className="text-3xl font-bold text-festara-navy mt-2">{stats.totalUsers}</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ActivityIcon />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Événements Créés</p>
                  <p className="text-3xl font-bold text-festara-navy mt-2">{stats.totalEvents}</p>
                </div>

                <div className="bg-festara-teal text-white rounded-xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <CreditCardIcon />
                  </div>
                  <p className="text-sm font-medium opacity-80">Volume Paiements Conf.</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
                </div>

                {/* NEW: Platform Revenue */}
                <div className="bg-gradient-to-br from-festara-gold to-yellow-600 text-festara-navy rounded-xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <BanknotesIcon />
                  </div>
                  <p className="text-sm font-medium opacity-90">Revenus FESTARA ({settings.commission_rate}%)</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue * (settings.commission_rate / 100))}</p>
                </div>

                <div className="bg-festara-navy text-white rounded-xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldIcon />
                  </div>
                  <p className="text-sm font-medium opacity-80">Comptes Bloqués</p>
                  <p className="text-3xl font-bold mt-2">{users.filter(u => u.status === 'Blocked').length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Live Activities Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-festara-navy flex items-center">
                      <ActivityIcon /> <span className="ml-2">Dernières Activités</span>
                    </h3>
                  </div>
                  <div className="p-0">
                    <ul className="divide-y divide-gray-100">
                      {filteredTxns.slice(0, 5).map(txn => (
                        <li key={txn.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-festara-sand flex items-center justify-center text-festara-teal">
                              <CreditCardIcon />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-festara-navy">{txn.amount}</p>
                              <p className="text-xs text-gray-500">{txn.user} - {txn.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-medium text-gray-400">{txn.time}</span>
                          </div>
                        </li>
                      ))}
                      {filteredTxns.length === 0 && (
                        <li className="p-4 text-center text-gray-500 text-sm">Aucune activité récente.</li>
                      )}
                    </ul>
                    <div className="p-4 text-center border-t border-gray-100">
                      <button onClick={() => setActiveTab('transactions')} className="text-sm font-medium text-festara-teal hover:underline">
                        Voir tout l'historique financier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-festara-navy flex items-center">
                  <UsersIcon /> <span className="ml-2">Tous les Utilisateurs</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium">Utilisateur</th>
                      <th className="px-6 py-4 font-medium">Événements</th>
                      <th className="px-6 py-4 font-medium">Date d'inscription</th>
                      <th className="px-6 py-4 font-medium">Statut</th>
                      <th className="px-6 py-4 font-medium text-right">Privilèges & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="p-6 text-center text-gray-500">Aucun résultat trouvé.</td></tr>
                    )}
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-festara-navy">{user.name}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.events}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.created}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                            user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => {
                                setEditingUser({id: user.id, name: user.name, email: user.email});
                                setIsEditModalOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                              title="Modifier"
                            >
                              <EditIcon />
                            </button>
                            <button 
                              onClick={() => toggleBlock(user.id, user.status)}
                              className={`p-2 rounded-lg transition ${
                                user.status === 'Blocked' 
                                  ? 'text-green-600 hover:bg-green-50' 
                                  : 'text-orange-500 hover:bg-orange-50'
                              }`}
                              title={user.status === 'Blocked' ? 'Débloquer' : 'Bloquer (Suspendre)'}
                            >
                              {user.status === 'Blocked' ? <UnlockIcon /> : <LockIcon />}
                            </button>
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                              title="Supprimer définitivement"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-festara-navy flex items-center">
                  <CreditCardIcon /> <span className="ml-2">Historique des Transactions</span>
                </h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {filteredTxns.length === 0 && (
                  <li className="p-6 text-center text-gray-500">Aucune transaction trouvée.</li>
                )}
                {filteredTxns.map(txn => (
                  <li key={txn.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-festara-sand flex items-center justify-center text-festara-teal">
                        <CreditCardIcon />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-festara-navy">{txn.amount}</p>
                        <p className="text-sm text-gray-500">{txn.user}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {txn.id}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium">{txn.type}</span>
                      {txn.status === 'confirmed' && txn.refund_status !== 'refunded' && (
                        <button 
                          onClick={() => handleRefund(txn.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                          Rembourser
                        </button>
                      )}
                      {txn.refund_status === 'refunded' && (
                        <span className="text-xs text-red-500 font-bold">Remboursé</span>
                      )}
                      <p className="text-xs font-medium text-gray-400">{txn.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <ShieldIcon />
              <h3 className="text-xl font-bold text-festara-navy mt-4">Logs de Sécurité</h3>
              <p className="text-gray-500 mt-2">Aucune alerte de sécurité majeure n'a été détectée aujourd'hui.</p>
              <button 
                onClick={() => alert("Téléchargement du rapport de sécurité initié...")}
                className="mt-4 px-6 py-2 bg-festara-navy text-white rounded-lg hover:bg-festara-ink transition"
              >
                Télécharger le rapport
              </button>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-festara-navy flex items-center">
                  <BanknotesIcon /> <span className="ml-2">Demandes de Reversements (Payouts)</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium">Organisateur</th>
                      <th className="px-6 py-4 font-medium">Montant Demandé</th>
                      <th className="px-6 py-4 font-medium">Infos Bancaires</th>
                      <th className="px-6 py-4 font-medium">Statut</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payouts.length === 0 && (
                      <tr><td colSpan={5} className="p-6 text-center text-gray-500">Aucune demande de reversement.</td></tr>
                    )}
                    {payouts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-festara-navy">{p.user_name}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-festara-navy">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {p.bank_details}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                            p.status === 'processed' ? 'bg-green-100 text-green-700' :
                            p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {p.status === 'pending' ? 'En attente' : p.status === 'processed' ? 'Traité' : 'Rejeté'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {p.status === 'pending' ? (
                            <>
                              <button className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2" onClick={() => handlePayoutStatus(p.id, 'processed')}>Approuver</button>
                              <button className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200" onClick={() => handlePayoutStatus(p.id, 'rejected')}>Rejeter</button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">Traité le {new Date(p.created_at).toLocaleDateString()}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-festara-navy flex items-center">
                  <ExclamationTriangleIcon /> <span className="ml-2">Modération des Événements</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium">Événement</th>
                      <th className="px-6 py-4 font-medium">Organisateur</th>
                      <th className="px-6 py-4 font-medium">Signalements</th>
                      <th className="px-6 py-4 font-medium">Statut Actuel</th>
                      <th className="px-6 py-4 font-medium text-right">Actions Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {events.length === 0 && (
                      <tr><td colSpan={5} className="p-6 text-center text-gray-500">Aucun événement.</td></tr>
                    )}
                    {events.map(e => (
                      <tr key={e.id} className={`hover:bg-gray-50 transition-colors ${e.admin_status === 'suspended' ? 'bg-red-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-festara-navy">{e.title}</div>
                          <div className="text-xs text-gray-500">/i/{e.slug}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">{e.user_name}</td>
                        <td className="px-6 py-4">
                          <span className="text-gray-500 text-sm">0</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                            e.admin_status === 'suspended' ? 'bg-red-100 text-red-700' :
                            e.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {e.admin_status === 'suspended' ? 'Suspendu' : e.is_published ? 'Publié' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {e.admin_status === 'suspended' ? (
                            <button className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200" onClick={() => handleEventStatus(e.id, 'active')}>Réactiver</button>
                          ) : (
                            <button className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleEventStatus(e.id, 'suspended')}>Suspendre</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-festara-navy flex items-center">
                  <ChatBubbleIcon /> <span className="ml-2">Tickets de Support</span>
                </h3>
              </div>
              <div className="p-0">
                <ul className="divide-y divide-gray-100">
                  {tickets.length === 0 && (
                    <li className="p-6 text-center text-gray-500">Aucun ticket ouvert. (Module en cours d'intégration)</li>
                  )}
                  {tickets.map(t => (
                    <li key={t.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-festara-navy">{t.subject}</p>
                          <p className="text-sm text-gray-500 mt-1">{t.message}</p>
                          <p className="text-xs text-gray-400 mt-2">De : {t.user_name} le {new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${t.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {t.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'team' && currentRole === 'superadmin' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-festara-navy flex items-center">
                  <UsersIcon /> <span className="ml-2">Équipe (Administrateurs)</span>
                </h3>
              </div>
              <div className="p-6 border-b border-gray-100 bg-white">
                <h4 className="text-sm font-bold text-gray-700 mb-4">Ajouter un administrateur</h4>
                <form onSubmit={handleAddAdmin} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="email@festara.com"
                      value={newAdminEmail}
                      onChange={e => setNewAdminEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="w-48">
                    <label className="block text-xs text-gray-500 mb-1">Rôle</label>
                    <select 
                      value={newAdminRole}
                      onChange={e => setNewAdminRole(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="superadmin">Super Admin</option>
                      <option value="finance">Finance</option>
                      <option value="moderator">Modérateur</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                  <button type="submit" className="px-6 py-2 bg-festara-navy text-white rounded-lg hover:bg-festara-ink font-medium text-sm h-10">
                    Ajouter / Inviter
                  </button>
                </form>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium">Administrateur</th>
                      <th className="px-6 py-4 font-medium">Rôle</th>
                      <th className="px-6 py-4 font-medium">Ajouté le</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminUsers.map(admin => (
                      <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-festara-navy">{admin.name}</div>
                          <div className="text-xs text-gray-500">{admin.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700 uppercase">
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleRemoveAdmin(admin.id)}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Révoquer
                          </button>
                        </td>
                      </tr>
                    ))}
                    {adminUsers.length === 0 && (
                      <tr><td colSpan={4} className="p-6 text-center text-gray-500">Aucun autre administrateur défini.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-festara-navy flex items-center">
                  <CogIcon /> <span className="ml-2">Paramètres Globaux de la Plateforme</span>
                </h3>
              </div>
              <div className="p-8 max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Taux de commission FESTARA (%)</label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        value={settings.commission_rate} 
                        onChange={(e) => setSettings({...settings, commission_rate: parseInt(e.target.value) || 0})}
                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-festara-gold focus:border-festara-gold" 
                      />
                      <span className="ml-3 text-sm text-gray-500">Appliqué sur tous les futurs paiements et cagnottes.</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mode Maintenance</label>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => setSettings({...settings, maintenance_mode: !settings.maintenance_mode})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenance_mode ? 'bg-red-500' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="text-sm text-gray-600">Désactiver la création de nouveaux événements publiquement.</span>
                    </div>
                  </div>

                  <div className="pt-8">
                    <button onClick={handleSaveSettings} className="px-6 py-2 bg-festara-navy text-white rounded-lg hover:bg-festara-ink font-medium">
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-festara-navy mb-4">Modifier l'Utilisateur</h3>
            <form onSubmit={handleEditUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input 
                    type="text" 
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-festara-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse Email</label>
                  <input 
                    type="email" 
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-festara-gold"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
