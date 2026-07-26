import api from './api';

// User management API calls. Adjust endpoint paths to match your backend.
export async function getUsers(params = {}) {
  const { data } = await api.get('/users', { params });
  return data; // expected shape: { items: [], total: number }
}

export async function getUserById(id) {
  const { data } = await api.get(`/users/${id}`);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
}

export async function suspendUser(id) {
  const { data } = await api.post(`/users/${id}/suspend`);
  return data;
}

export async function activateUser(id) {
  const { data } = await api.post(`/users/${id}/activate`);
  return data;
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}
