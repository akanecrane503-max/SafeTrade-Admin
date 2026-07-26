import api from './api';

// Trade management API calls. Adjust endpoint paths to match your backend.
export async function getTrades(params = {}) {
  const { data } = await api.get('/trades', { params });
  return data; // expected shape: { items: [], total: number }
}

export async function getTradeById(id) {
  const { data } = await api.get(`/trades/${id}`);
  return data;
}

export async function closeTrade(id) {
  const { data } = await api.post(`/trades/${id}/close`);
  return data;
}
