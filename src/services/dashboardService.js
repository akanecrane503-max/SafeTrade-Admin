function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function daysAgoIso(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

const MOCK_STATS = {
  totalUsers: 1284,
  onlineUsers: 96,
  newUsersToday: 14,
  pendingDeposits: 6,
  pendingWithdrawals: 3,
  activeTrades: 41,
  verifiedKyc: 812,
  pendingKyc: 27,
  totalPlatformAssets: 4820500,
};

const MOCK_TRADES = [
  { id: 't1', userName: 'Alice Cruz', pair: 'BTC/USDT', direction: 'long', amount: 1200, status: 'open', createdAt: daysAgoIso(0) },
  { id: 't2', userName: 'Ben Sato', pair: 'ETH/USDT', direction: 'short', amount: 850, status: 'closed', createdAt: daysAgoIso(0) },
  { id: 't3', userName: 'Carla Dizon', pair: 'SOL/USDT', direction: 'long', amount: 400, status: 'closed', createdAt: daysAgoIso(1) },
  { id: 't4', userName: 'Diego Reyes', pair: 'BTC/USDT', direction: 'short', amount: 2100, status: 'liquidated', createdAt: daysAgoIso(1) },
  { id: 't5', userName: 'Elena Vega', pair: 'XRP/USDT', direction: 'long', amount: 300, status: 'open', createdAt: daysAgoIso(2) },
];

const MOCK_DEPOSITS = [
  { id: 'd1', userName: 'Alice Cruz', amount: 500, status: 'completed', createdAt: daysAgoIso(0) },
  { id: 'd2', userName: 'Ben Sato', amount: 1500, status: 'pending', createdAt: daysAgoIso(0) },
  { id: 'd3', userName: 'Carla Dizon', amount: 250, status: 'completed', createdAt: daysAgoIso(1) },
  { id: 'd4', userName: 'Frank Uy', amount: 3000, status: 'pending', createdAt: daysAgoIso(2) },
  { id: 'd5', userName: 'Grace Lim', amount: 80, status: 'completed', createdAt: daysAgoIso(3) },
];

const MOCK_WITHDRAWALS = [
  { id: 'w1', userName: 'Diego Reyes', amount: 400, status: 'pending', createdAt: daysAgoIso(0) },
  { id: 'w2', userName: 'Elena Vega', amount: 120, status: 'approved', createdAt: daysAgoIso(1) },
  { id: 'w3', userName: 'Frank Uy', amount: 900, status: 'pending', createdAt: daysAgoIso(1) },
  { id: 'w4', userName: 'Grace Lim', amount: 60, status: 'rejected', createdAt: daysAgoIso(2) },
  { id: 'w5', userName: 'Alice Cruz', amount: 200, status: 'approved', createdAt: daysAgoIso(3) },
];

const MOCK_USERS = [
  { id: 'u1', name: 'Grace Lim', email: 'grace.lim@example.com', status: 'active', createdAt: daysAgoIso(0) },
  { id: 'u2', name: 'Frank Uy', email: 'frank.uy@example.com', status: 'pending', createdAt: daysAgoIso(0) },
  { id: 'u3', name: 'Hana Kim', email: 'hana.kim@example.com', status: 'active', createdAt: daysAgoIso(1) },
  { id: 'u4', name: 'Ivan Cruz', email: 'ivan.cruz@example.com', status: 'active', createdAt: daysAgoIso(2) },
  { id: 'u5', name: 'Jade Santos', email: 'jade.santos@example.com', status: 'suspended', createdAt: daysAgoIso(3) },
];

const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 };

function buildActivitySeries(days) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - i - 1) * 86400000);
    return {
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: Math.round(80000 + Math.random() * 40000),
      activeUsers: Math.round(300 + Math.random() * 150),
    };
  });
}

export async function getDashboardStats() {
  await delay();
  return MOCK_STATS;
}

export async function getActivityChartData(range = '7d') {
  await delay();
  return buildActivitySeries(RANGE_DAYS[range] || 7);
}

export async function getRecentTrades(limit = 5) {
  await delay();
  return MOCK_TRADES.slice(0, limit);
}

export async function getRecentDeposits(limit = 5) {
  await delay();
  return MOCK_DEPOSITS.slice(0, limit);
}

export async function getRecentWithdrawals(limit = 5) {
  await delay();
  return MOCK_WITHDRAWALS.slice(0, limit);
}

export async function getRecentUsers(limit = 5) {
  await delay();
  return MOCK_USERS.slice(0, limit);
}
