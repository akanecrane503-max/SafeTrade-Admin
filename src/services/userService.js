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
  const { data } = await api.get(`/users/${id}`);
  return data;
}

// Full detail payload: profile, security, assets, trading, wallets, kyc, binding, notes
export async function getUserDetail(id) {
  const { data } = await api.get(`/users/${id}/detail`);
  return data;
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
export async function updateUserAsset(id, coin, balance) {
  const { data } = await api.put(`/users/${id}/assets/${coin}`, { balance });
  return data;
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
