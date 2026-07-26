import api from './api';

// Dashboard-specific data fetching. Adjust endpoint paths to match your backend.
export async function getDashboardStats() {
  const { data } = await api.get('/dashboard/stats');
  return data;
}

export async function getActivityChartData(range = '7d') {
  const { data } = await api.get('/dashboard/activity', { params: { range } });
  return data;
}

export async function getRecentTrades(limit = 5) {
  const { data } = await api.get('/dashboard/recent-trades', { params: { limit } });
  return data;
}

export async function getRecentDeposits(limit = 5) {
  const { data } = await api.get('/dashboard/recent-deposits', { params: { limit } });
  return data;
}

export async function getRecentWithdrawals(limit = 5) {
  const { data } = await api.get('/dashboard/recent-withdrawals', { params: { limit } });
  return data;
}

export async function getRecentUsers(limit = 5) {
  const { data } = await api.get('/dashboard/recent-users', { params: { limit } });
  return data;
}
