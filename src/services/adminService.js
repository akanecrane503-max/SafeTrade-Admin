import api from './api';

export async function getAdmins(params = {}) {
  const { data } = await api.get('/admins', { params });
  return data;
}

export async function getAdminById(id) {
  const { data } = await api.get(`/admins/${id}`);
  return data;
}

export async function createAdmin(payload) {
  const { data } = await api.post('/admins', payload);
  return data;
}

export async function updateAdmin(id, payload) {
  const { data } = await api.put(`/admins/${id}`, payload);
  return data;
}

export async function toggleAdminStatus(id, enabled) {
  const { data } = await api.post(`/admins/${id}/toggle`, { enabled });
  return data;
}

export async function getActivityLog(params = {}) {
  const { data } = await api.get('/admins/activity-log', { params });
  return data;
}
