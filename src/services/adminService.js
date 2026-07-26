const ADMINS_KEY = 'admin_accounts';
const ACTIVITY_KEY = 'admin_activity_log';

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readList(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to reseed below
  }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

const SEED_ADMINS = [
  {
    id: 'admin_main',
    name: 'Main Admin',
    username: 'mainadmin',
    email: 'ascendextradefunction@gmail.com',
    role: 'main_admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

const SEED_ACTIVITY = [
  {
    id: 'log_seed',
    adminName: 'Main Admin',
    action: 'Signed in',
    target: '—',
    createdAt: new Date().toISOString(),
  },
];

function logActivity(action, target) {
  const items = readList(ACTIVITY_KEY, SEED_ACTIVITY);
  const record = {
    id: `log_${Date.now()}`,
    adminName: 'Main Admin',
    action,
    target: target || '—',
    createdAt: new Date().toISOString(),
  };
  writeList(ACTIVITY_KEY, [record, ...items]);
}

export async function getAdmins() {
  await delay();
  const items = readList(ADMINS_KEY, SEED_ADMINS);
  return { items, total: items.length };
}

export async function createAdmin(payload) {
  await delay();
  const items = readList(ADMINS_KEY, SEED_ADMINS);
  const record = {
    id: `admin_${Date.now()}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    ...payload,
  };
  writeList(ADMINS_KEY, [record, ...items]);
  logActivity('Created administrator', record.name || record.email);
  return record;
}

export async function updateAdmin(id, payload) {
  await delay();
  const items = readList(ADMINS_KEY, SEED_ADMINS);
  const updated = items.map((a) => (a.id === id ? { ...a, ...payload } : a));
  writeList(ADMINS_KEY, updated);
  logActivity('Updated administrator', payload.name || id);
  return updated.find((a) => a.id === id);
}

export async function toggleAdminStatus(id, activate) {
  await delay();
  const items = readList(ADMINS_KEY, SEED_ADMINS);
  const updated = items.map((a) =>
    a.id === id ? { ...a, status: activate ? 'active' : 'suspended' } : a
  );
  writeList(ADMINS_KEY, updated);
  const target = updated.find((a) => a.id === id);
  logActivity(activate ? 'Activated administrator' : 'Suspended administrator', target?.name || id);
  return target;
}

export async function getActivityLog({ limit = 20 } = {}) {
  await delay();
  const items = readList(ACTIVITY_KEY, SEED_ACTIVITY);
  return { items: items.slice(0, limit), total: items.length };
}
