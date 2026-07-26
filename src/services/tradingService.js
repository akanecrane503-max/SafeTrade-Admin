import api from './api';

// Per-user trading status control (separate from platform-wide trading
// toggle, which lives in systemService.js).
export async function toggleUserTrading(userId, enabled) {
  const { data } = await api.post(`/users/${userId}/trading/toggle`, { enabled });
  return data;
}

export async function getUserTrades(userId, params = {}) {
  const { data } = await api.get(`/users/${userId}/trades`, { params });
  return data;
}
