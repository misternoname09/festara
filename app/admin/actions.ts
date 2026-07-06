"use server";

import { cookies } from 'next/headers';
import { createServerSupabase, createAdminClient } from "@/lib/supabase/server";

export async function getAdminRole(): Promise<string | false> {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPhone = process.env.ADMIN_PHONE;
  
  if (user.email === adminEmail || 
      user.phone === adminPhone || 
      user.phone === `+221${adminPhone}` ||
      user.phone === `221${adminPhone}`) {
    return 'superadmin';
  }

  const supabaseAdmin = createAdminClient();
  const { data: adminUser } = await supabaseAdmin.from('admin_users').select('role').eq('user_id', user.id).single();
  
  if (adminUser) {
    return adminUser.role;
  }
  
  return false;
}

function checkPermission(role: string | false, requiredRoles: string[]) {
  if (!role) throw new Error("Unauthorized");
  if (role === 'superadmin') return true;
  if (!requiredRoles.includes(role)) throw new Error("Permission denied for this action");
  return true;
}

// For backward compatibility if any file calls isAdmin (e.g. login/page.tsx)
export async function isAdmin() {
  const role = await getAdminRole();
  return role !== false;
}

export async function fetchAdminData() {
  const role = await getAdminRole();
  if (!role) {
    throw new Error("Unauthorized");
  }

  const supabaseAdmin = createAdminClient();

  // Fetch all users
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) throw usersError;

  // Fetch events count per user (for the UI) and for moderation
  const { data: eventsData } = await supabaseAdmin.from('events').select('id, user_id, title, slug, admin_status, is_published, created_at');

  // Fetch transactions
  const { data: txnsData } = await supabaseAdmin.from('payments').select('*').order('created_at', { ascending: false });

  // Fetch payouts (if table exists, otherwise wrap in try-catch to avoid crashing before migration)
  let payoutsData = [];
  try {
    const res = await supabaseAdmin.from('payouts').select('*').order('created_at', { ascending: false });
    if (res.data) payoutsData = res.data;
  } catch (e) {}

  // Fetch support tickets
  let ticketsData = [];
  try {
    const res = await supabaseAdmin.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (res.data) ticketsData = res.data;
  } catch (e) {}

  // Fetch global settings
  let settingsData = { commission_rate: 5, maintenance_mode: false };
  try {
    const res = await supabaseAdmin.from('global_settings').select('*');
    if (res.data) {
      const comm = res.data.find((s: any) => s.key === 'commission_rate');
      const maint = res.data.find((s: any) => s.key === 'maintenance_mode');
      if (comm) settingsData.commission_rate = parseInt(comm.value);
      if (maint) settingsData.maintenance_mode = maint.value === 'true' || maint.value === true;
    }
  } catch (e) {}
  
  // Fetch admin users list
  let adminUsersList: any[] = [];
  try {
    const res = await supabaseAdmin.from('admin_users').select('*');
    if (res.data) {
      res.data.forEach((au: any) => {
        const u = usersData.users.find((user: any) => user.id === au.user_id);
        if (u) {
          adminUsersList.push({
            id: au.id,
            user_id: au.user_id,
            email: u.email,
            name: u.user_metadata?.full_name || 'Inconnu',
            role: au.role,
            created_at: au.created_at
          });
        }
      });
    }
  } catch(e) {}

  // Map users
  const users = usersData.users.map(u => {
    const userEvents = eventsData?.filter(e => e.user_id === u.id) || [];
    return {
      id: u.id,
      name: u.user_metadata?.full_name || u.user_metadata?.name || 'Sans Nom',
      email: u.email || '',
      status: u.user_metadata?.blocked ? 'Blocked' : 'Active',
      events: userEvents.length,
      created: u.created_at.split('T')[0]
    };
  });

  const transactions = (txnsData || []).map(t => {
    // find user
    const u = usersData.users.find(user => user.id === t.user_id);
    return {
      id: t.id,
      user: u?.user_metadata?.full_name || u?.email || 'Inconnu',
      amount: `${t.amount} ${t.currency}`,
      type: `Paiement ${t.provider}`,
      time: new Date(t.created_at).toLocaleString(),
      status: t.status,
      refund_status: t.refund_status || 'none'
    };
  });
  
  const payouts = payoutsData.map((p: any) => {
    const u = usersData.users.find(user => user.id === p.user_id);
    return {
      ...p,
      user_name: u?.user_metadata?.full_name || u?.email || 'Inconnu'
    }
  });

  const tickets = ticketsData.map((t: any) => {
    const u = usersData.users.find(user => user.id === t.user_id);
    return {
      ...t,
      user_name: u?.user_metadata?.full_name || u?.email || 'Inconnu'
    }
  });

  const events = (eventsData || []).map((e: any) => {
    const u = usersData.users.find(user => user.id === e.user_id);
    return {
      ...e,
      user_name: u?.user_metadata?.full_name || u?.email || 'Inconnu'
    }
  });

  return {
    currentRole: role,
    adminUsersList,
    users,
    transactions,
    payouts,
    tickets,
    events,
    settings: settingsData,
    stats: {
      totalUsers: users.length,
      totalEvents: eventsData?.length || 0,
      totalRevenue: (txnsData || []).filter(t => t.status === 'confirmed').reduce((acc, t) => acc + t.amount, 0)
    }
  };
}

export async function toggleBlockUserAction(userId: string, currentStatus: string) {
  const role = await getAdminRole();
  checkPermission(role, ['moderator']);
  
  const supabaseAdmin = createAdminClient();
  const isBlocked = currentStatus === 'Blocked';
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { blocked: !isBlocked }
  });
  
  if (error) throw error;
  return !isBlocked ? 'Blocked' : 'Active';
}

export async function deleteUserAction(userId: string) {
  const role = await getAdminRole();
  checkPermission(role, []); // only superadmin
  
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
  return true;
}

export async function editUserAction(userId: string, name: string, email: string) {
  const role = await getAdminRole();
  checkPermission(role, ['moderator']);
  
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email: email,
    user_metadata: { full_name: name }
  });
  
  if (error) throw error;
  return true;
}

export async function updatePayoutStatusAction(payoutId: string, status: 'processed' | 'rejected') {
  const role = await getAdminRole();
  checkPermission(role, ['finance']);

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('payouts').update({ status, processed_at: new Date().toISOString() }).eq('id', payoutId);
  if (error) throw error;
  return true;
}

export async function updateEventAdminStatusAction(eventId: string, admin_status: 'active' | 'suspended') {
  const role = await getAdminRole();
  checkPermission(role, ['moderator']);

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('events').update({ admin_status }).eq('id', eventId);
  if (error) throw error;
  return true;
}

export async function refundTransactionAction(transactionId: string) {
  const role = await getAdminRole();
  checkPermission(role, ['finance']);

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('payments').update({ refund_status: 'refunded' }).eq('id', transactionId);
  if (error) throw error;
  return true;
}

export async function updateGlobalSettingsAction(commission_rate: number, maintenance_mode: boolean) {
  const role = await getAdminRole();
  checkPermission(role, []); // only superadmin

  const supabaseAdmin = createAdminClient();
  
  await supabaseAdmin.from('global_settings').upsert({ key: 'commission_rate', value: commission_rate, description: 'Taux de commission prélevé par Festara en %' });
  await supabaseAdmin.from('global_settings').upsert({ key: 'maintenance_mode', value: maintenance_mode, description: 'Activer/Désactiver la création publique devenements' });
  
  return true;
}

export async function addAdminUserAction(email: string, adminRole: 'superadmin' | 'finance' | 'moderator' | 'support') {
  const currentRole = await getAdminRole();
  checkPermission(currentRole, []); // only superadmin

  const supabaseAdmin = createAdminClient();
  
  // Find if user exists
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) throw usersError;

  let targetUser = usersData.users.find(u => u.email === email);
  
  if (!targetUser) {
    // We could create a user, but typically we want them to sign up first.
    // Or we invite them
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    if (inviteError) throw new Error("Cet email n'a pas de compte et l'invitation a échoué: " + inviteError.message);
    targetUser = inviteData.user;
  }

  // Insert into admin_users
  const { error } = await supabaseAdmin.from('admin_users').insert({
    user_id: targetUser!.id,
    role: adminRole
  });

  if (error) {
    if (error.code === '23505') throw new Error("Cet utilisateur est déjà administrateur.");
    throw error;
  }
  
  return true;
}

export async function removeAdminUserAction(adminUserId: string) {
  const currentRole = await getAdminRole();
  checkPermission(currentRole, []); // only superadmin

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('admin_users').delete().eq('id', adminUserId);
  if (error) throw error;
  return true;
}
