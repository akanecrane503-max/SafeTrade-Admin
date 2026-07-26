import api from './api';

// Reporting API calls. Adjust endpoint paths to match your backend.
export async function getRevenueReport(range = '30d') {
  const { data } = await api.get('/reports/revenue', { params: { range } });
  return data; // expected shape: [{ label, revenue, fees }]
}

export async function getTradingVolumeReport(range = '30d') {
  const { data } = await api.get('/reports/trading-volume', { params: { range } });
  return data; // expected shape: [{ label, longVolume, shortVolume }]
}

export async function getSummary(range = '30d') {
  const { data } = await api.get('/reports/summary', { params: { range } });
  return data; // expected shape: { totalRevenue, totalFees, totalVolume, netProfit, changes }
}

export async function exportReport(range = '30d') {
  const { data } = await api.get('/reports/export', { params: { range } });
  return data;
}
