import api from './api';

export async function getDeposits(params = {}) {
  const { data } = await api.get('/deposits', { params });
  return data;
}

// Convenience wrapper for a single user's deposits, used by the
// user detail page's Deposits tab.
export async function getUserDeposits(userId, params = {}) {
  return getDeposits({ ...params, userId });
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
