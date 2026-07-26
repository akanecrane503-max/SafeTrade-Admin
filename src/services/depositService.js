import api from './api';

// Deposit management API calls. Adjust endpoint paths to match your backend.
export async function getDeposits(params = {}) {
  const { data } = await api.get('/deposits', { params });
  return data; // expected shape: { items: [], total: number }
}

export async function getDepositById(id) {
  const { data } = await api.get(`/deposits/${id}`);
  return data;
}

export async function approveDeposit(id) {
  const { data } = await api.post(`/deposits/${id}/approve`);
  return data;
}

export async function rejectDeposit(id, reason) {
  const { data } = await api.post(`/deposits/${id}/reject`, { reason });
  return data;
}
