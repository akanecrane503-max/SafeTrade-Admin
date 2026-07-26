import api from './api';

export async function getWallets(params = {}) {
  const { data } = await api.get('/wallets', { params });
  return data;
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

// Accepts a FormData instance containing the 'qrCode' file field.
export async function uploadWalletQr(id, formData) {
  const { data } = await api.post(`/wallets/${id}/qr-code`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
