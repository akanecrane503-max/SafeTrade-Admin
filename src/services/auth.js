export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function getPendingAdmins() {
  const { data } = await api.get('/admin/pending');
  return data;
}

export async function approveAdmin(id) {
  const { data } = await api.post(`/admin/pending/${id}/approve`);
  return data;
}

export async function rejectAdmin(id) {
  const { data } = await api.post(`/admin/pending/${id}/reject`);
  return data;
}
