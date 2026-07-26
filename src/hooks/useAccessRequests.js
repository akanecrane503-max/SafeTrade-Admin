const STORAGE_KEY = 'admin_access_requests';
const UPDATE_EVENT = 'access-requests-updated';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function addAccessRequest({ fullName, email }) {
  const requests = readAll();
  const record = {
    id: `req_${Date.now()}`,
    fullName,
    email,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  writeAll([record, ...requests]);
  return record.id;
}

export function getAccessRequests() {
  return readAll();
}

export function getPendingRequestCount() {
  return readAll().filter((r) => r.status === 'pending').length;
}

export function approveAccessRequest(id) {
  writeAll(readAll().map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
}

export function rejectAccessRequest(id) {
  writeAll(readAll().map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
}

export function removeAccessRequest(id) {
  writeAll(readAll().filter((r) => r.id !== id));
}

export { UPDATE_EVENT as ACCESS_REQUESTS_UPDATE_EVENT };
