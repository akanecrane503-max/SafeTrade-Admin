import api from './api';

// Wallet management API calls. Adjust endpoint paths to match your backend.
export async function getWallets(params = {}) {
  const { data } = await api.get('/wallets', { params });
  return data; // expected shape: { items: [] }
}

export async function getWalletById(id) {
  const { data } = await api.get(`/wallets/${id}`);
  return data;
}

export async function updateWallet(id, payload) {
  const { data } = await api.put(`/wallets/${id}`, payload);
  return data;
}

export async function toggleWalletStatus(id, enabled) {
  const { data } = await api.post(`/wallets/${id}/toggle`, { enabled });
  return data;
}
