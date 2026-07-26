import api from './api';

export async function getWithdrawals(params = {}) {
  const { data } = await api.get('/withdrawals', { params });
  return data;
}

// params.type: 'internal' | 'external'
export async function getUserWithdrawals(userId, params = {}) {
  return getWithdrawals({ ...params, userId });
}

export async function getWithdrawalById(id) {
  const { data } = await api.get(`/withdrawals/${id}`);
  return data;
}

export async function approveWithdrawal(id) {
  const { data } = await api.post(`/withdrawals/${id}/approve`);
  return data;
}

export async function rejectWithdrawal(id, reason) {
  const { data } = await api.post(`/withdrawals/${id}/reject`, { reason });
  return data;
}
