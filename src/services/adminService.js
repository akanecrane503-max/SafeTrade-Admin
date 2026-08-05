import { supabase } from '../lib/supabase';

function deriveUsername(email) {
  return email ? email.split('@')[0] : '—';
}

async function logAdminActivity(action, target) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;
  await supabase.from('admin_activity_log').insert({
    admin_id: session.user.id,
    action,
    target: target || '—',
  });
}

export async function getAdmins() {
  const { data, error } = await supabase
    .from('admins')
    .select('id, email, full_name, role, status, created_at, last_login')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  const items = (data || []).map((a) => ({
    id: a.id,
    name: a.full_name,
    username: deriveUsername(a.email), // derived for display — admins table has no username column
    email: a.email,
    role: a.role,
    status: a.status,
    lastLoginAt: a.last_login,
    createdAt: a.created_at,
  }));
  return { items, total: items.length };
}

export async function registerPendingAdmin({ fullName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  if (!data.user) throw new Error('Registration failed. Please try again.');

  const { error: insertError } = await supabase.from('admins').insert({
    id: data.user.id,
    email,
    full_name: fullName,
    role: 'support_admin',
    status: 'pending',
  });
  if (insertError) throw new Error(insertError.message);

  await supabase.auth.signOut();
}

export async function createAdmin() {
  throw new Error(
    "Direct admin creation isn't available yet — ask the new admin to register at the Request Access page, then approve them here."
  );
}

export async function updateAdmin(id, payload) {
  if (payload.password) {
    throw new Error("Password changes aren't supported yet — leave the password field blank.");
  }
  const updates = {};
  if (payload.name !== undefined) updates.full_name = payload.name;
  if (payload.role !== undefined) updates.role = payload.role;

  const { data, error } = await supabase
    .from('admins')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logAdminActivity('Updated administrator', data.full_name || data.email);
  return data;
}

export async function toggleAdminStatus(id, activate) {
  const { data, error } = await supabase
    .from('admins')
    .update({ status: activate ? 'active' : 'suspended' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logAdminActivity(
    activate ? 'Activated administrator' : 'Suspended administrator',
    data.full_name || data.email
  );
  return data;
}

export async function approvePendingAdmin(id) {
  const { data, error } = await supabase
    .from('admins')
    .update({ status: 'active' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  await logAdminActivity('Approved administrator', data.full_name || data.email);
  return data;
}

export async function rejectPendingAdmin(id) {
  const { data, error } = await supabase
    .from('admins')
    .update({ status: 'rejected' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  await logAdminActivity('Rejected administrator', data.full_name || data.email);
  return data;
}

export async function deleteAdmin(id) {
  const { data: target, error: fetchError } = await supabase
    .from('admins')
    .select('full_name, email, role')
    .eq('id', id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  if (target.role === 'main_admin') {
    throw new Error("Main Admin accounts can't be removed.");
  }

  const { error } = await supabase.from('admins').delete().eq('id', id);
  if (error) throw new Error(error.message);

  await logAdminActivity('Removed administrator', target.full_name || target.email);
}

export async function getActivityLog({ limit = 20 } = {}) {
  const { data, error } = await supabase
    .from('admin_activity_log')
    .select('id, admin_id, action, target, created_at, admins:admin_id (full_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  const items = (data || []).map((row) => ({
    id: row.id,
    adminName: row.admins?.full_name || row.admins?.email || 'Unknown',
    action: row.action,
    target: row.target,
    createdAt: row.created_at,
  }));
  return { items, total: items.length };
}
