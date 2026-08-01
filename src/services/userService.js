import api from './api';
import { supabase } from '../lib/supabase';
export async function getUsers(params = {}) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, uid, full_name, email, country, role, status, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  const items = (data || []).map((row) => ({
    id: row.id,
    uid: row.uid,
    name: row.full_name,
    email: row.email,
    country: row.country,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  }));
  return { items };
}
export async function getUserById(id) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    uid: data.uid,
    name: data.full_name,
    email: data.email,
    role: data.role,
    status: data.status,
    country: data.country,
    portfolio_usd: data.portfolio_usd,
    btc: data.btc,
    eth: data.eth,
    bnb: data.bnb,
    sol: data.sol,
    xrp: data.xrp,
    usdt: data.usdt,
    createdAt: data.created_at,
    lastLogin: data.last_login,
    isOnline: data.is_online,
  };
}
// Full detail payload: profile, security, assets, trading, wallets, kyc, binding, notes
export async function getUserDetail(id) {
  const profile = await getUserById(id);

  return {
    ...profile,

    assets: [
      {
        coin: "BTC",
        balance: profile.btc,
        usdValue: 0,
      },
      {
        coin: "ETH",
        balance: profile.eth,
        usdValue: 0,
      },
      {
        coin: "BNB",
        balance: profile.bnb,
        usdValue: 0,
      },
      {
        coin: "SOL",
        balance: profile.sol,
        usdValue: 0,
      },
      {
        coin: "XRP",
        balance: profile.xrp,
        usdValue: 0,
      },
      {
        coin: "USDT",
        balance: profile.usdt,
        usdValue: profile.usdt,
      },
    ],
  };
}
export async function updateUser(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
}
export async function suspendUser(id) {
  const { data } = await api.post(`/users/${id}/suspend`);
  return data;
}
export async function activateUser(id) {
  const { data } = await api.post(`/users/${id}/activate`);
  return data;
}
export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}
// --- Security ---
export async function resetUserPassword(id) {
  const { data } = await api.post(`/users/${id}/reset-password`);
  return data;
}
export async function suspendUserLogin(id) {
  const { data } = await api.post(`/users/${id}/suspend-login`);
  return data;
}
export async function freezeUserAccount(id) {
  const { data } = await api.post(`/users/${id}/freeze`);
  return data;
}
export async function activateUserAccount(id) {
  const { data } = await api.post(`/users/${id}/reactivate`);
  return data;
}
// --- Assets ---
export async function updateUserAsset(
  userId,
  coin,
  balance,
  type = "adjustment",
  description = ""
) {
  const column = coin.toLowerCase();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(column)
    .eq("id", userId)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const before = Number(profile[column] || 0);
  const after = Number(balance);
  const change = after - before;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      [column]: after,
    })
    .eq("id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: historyError } = await supabase
    .from("admin_balance_history")
    .insert({
      user_id: userId,
      admin_id: user?.id || null,
      coin,
      amount_before: before,
      amount_after: after,
      change_amount: change,
      type,
      description,
    });

  if (historyError) {
    throw new Error(historyError.message);
  }

  return {
    success: true,
  };
}
// --- Wallets ---
export async function updateUserWalletAddress(id, network, address) {
  const { data } = await api.put(`/users/${id}/wallets/${network}`, { address });
  return data;
}
// --- KYC ---
export async function approveUserKyc(id) {
  const { data } = await api.post(`/users/${id}/kyc/approve`);
  return data;
}
export async function denyUserKyc(id, reason) {
  const { data } = await api.post(`/users/${id}/kyc/deny`, { reason });
  return data;
}
// --- Account Binding ---
export async function approveUserBinding(id) {
  const { data } = await api.post(`/users/${id}/binding/approve`);
  return data;
}
export async function denyUserBinding(id, reason) {
  const { data } = await api.post(`/users/${id}/binding/deny`, { reason });
  return data;
}
// --- Admin Notes ---
export async function addAdminNote(id, note) {
  const { data } = await api.post(`/users/${id}/notes`, { note });
  return data;
}
// --- Activity ---
export async function getUserActivity(id, params = {}) {
  const { data } = await api.get(`/users/${id}/activity`, { params });
  return data;
}
