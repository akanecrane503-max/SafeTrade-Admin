import api from './api';

export async function getSystemSettings() {
  const { data } = await api.get('/system/settings');
  return data; // { registration, login, trading, deposits, withdrawals, maintenanceMode }
}

export async function updateSystemSettings(payload) {
  const { data } = await api.put('/system/settings', payload);
  return data;
}

export async function getBanner() {
  const { data } = await api.get('/system/banner');
  return data;
}

export async function updateBanner(payload) {
  const { data } = await api.put('/system/banner', payload);
  return data;
}

export async function getSystemAnnouncement() {
  const { data } = await api.get('/system/announcement');
  return data;
}

export async function updateSystemAnnouncement(payload) {
  const { data } = await api.put('/system/announcement', payload);
  return data;
}
