import api from './api';

// Announcement management API calls. Adjust endpoint paths to match your backend.
export async function getAnnouncements(params = {}) {
  const { data } = await api.get('/announcements', { params });
  return data; // expected shape: { items: [] }
}

export async function createAnnouncement(payload) {
  const { data } = await api.post('/announcements', payload);
  return data;
}

export async function updateAnnouncement(id, payload) {
  const { data } = await api.put(`/announcements/${id}`, payload);
  return data;
}

export async function deleteAnnouncement(id) {
  const { data } = await api.delete(`/announcements/${id}`);
  return data;
}

export async function togglePublish(id, published) {
  const { data } = await api.post(`/announcements/${id}/publish`, { published });
  return data;
}
