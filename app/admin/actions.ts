"use server";

import { cookies } from 'next/headers';
import { createServerSupabase, createAdminClient } from "@/lib/supabase/server";

export async function isAdmin() {
  const cookieStore = cookies();
  if (cookieStore.get('admin_demo_auth')?.value === 'true') {
    return true; // Bypass for OTP demo
  }

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPhone = process.env.ADMIN_PHONE;
  
  return user.email === adminEmail || 
         user.phone === adminPhone || 
         user.phone === `+221${adminPhone}` ||
         user.phone === `221${adminPhone}`;
}

export async function fetchAdminData() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  const supabaseAdmin = createAdminClient();

  // Fetch all users
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) throw usersError;

  // Fetch events count per user (for the UI)
  const { data: eventsData } = await supabaseAdmin.from('events').select('id, user_id, created_at');

  // Fetch transactions
  const { data: txnsData } = await supabaseAdmin.from('payments').select('*').order('created_at', { ascending: false });

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
      time: new Date(t.created_at).toLocaleString()
    };
  });

  return {
    users,
    transactions,
    stats: {
      totalUsers: users.length,
      totalEvents: eventsData?.length || 0,
      totalRevenue: (txnsData || []).filter(t => t.status === 'confirmed').reduce((acc, t) => acc + t.amount, 0)
    }
  };
}

export async function toggleBlockUserAction(userId: string, currentStatus: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  
  const supabaseAdmin = createAdminClient();
  const isBlocked = currentStatus === 'Blocked';
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { blocked: !isBlocked }
  });
  
  if (error) throw error;
  return !isBlocked ? 'Blocked' : 'Active';
}

export async function deleteUserAction(userId: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
  return true;
}

export async function editUserAction(userId: string, name: string, email: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email: email,
    user_metadata: { full_name: name }
  });
  
  if (error) throw error;
  return true;
}
