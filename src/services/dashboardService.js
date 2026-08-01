import { supabase } from '../lib/supabase';

const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 };

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

export async function getDashboardStats() {
  const { count: totalUsers, error: totalUsersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  if (totalUsersError) {
    throw new Error(totalUsersError.message);
  }

  const { count: onlineUsers, error: onlineUsersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_online', true);
  if (onlineUsersError) {
    throw new Error(onlineUsersError.message);
  }

  const todayStart = startOfDay(new Date()).toISOString();
  const { count: newUsersToday, error: newUsersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart);
  if (newUsersError) {
    throw new Error(newUsersError.message);
  }

  const { count: pendingDeposits, error: pendingDepositsError } = await supabase
    .from('deposit_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  if (pendingDepositsError) {
    throw new Error(pendingDepositsError.message);
  }

  const { data: portfolioRows, error: portfolioError } = await supabase
    .from('profiles')
    .select('portfolio_usd');
  if (portfolioError) {
    throw new Error(portfolioError.message);
  }
  const totalPlatformAssets = (portfolioRows || []).reduce(
    (sum, row) => sum + Number(row.portfolio_usd || 0),
    0
  );

  return {
    totalUsers: totalUsers || 0,
    onlineUsers: onlineUsers || 0,
    newUsersToday: newUsersToday || 0,
    pendingDeposits: pendingDeposits || 0,
    pendingWithdrawals: 0,
    activeTrades: 0,
    verifiedKyc: 0,
    pendingKyc: 0,
    totalPlatformAssets,
  };
}

export async function getActivityChartData(range = '7d') {
  const days = RANGE_DAYS[range] || 7;
  const rangeStart = startOfDay(new Date(Date.now() - (days - 1) * 86400000));

  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', rangeStart.toISOString());
  if (error) {
    throw new Error(error.message);
  }

  const counts = {};
  (data || []).forEach((row) => {
    const key = dayKey(row.created_at);
    counts[key] = (counts[key] || 0) + 1;
  });

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(rangeStart.getTime() + i * 86400000);
    const key = dayKey(date);
    return {
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: 0,
      activeUsers: counts[key] || 0,
    };
  });
}

export async function getRecentTrades() {
  return [];
}

export async function getRecentDeposits(limit = 5) {
  const { data: deposits, error } = await supabase
    .from('deposit_requests')
    .select('id, user_id, amount, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    throw new Error(error.message);
  }

  const userIds = [...new Set((deposits || []).map((d) => d.user_id).filter(Boolean))];

  let profilesById = {};
  if (userIds.length) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    if (profilesError) {
      throw new Error(profilesError.message);
    }
    profilesById = (profiles || []).reduce((acc, p) => {
      acc[p.id] = p.full_name;
      return acc;
    }, {});
  }

  return (deposits || []).map((deposit) => ({
    id: deposit.id,
    userName: profilesById[deposit.user_id] || '—',
    amount: deposit.amount,
    status: deposit.status,
    createdAt: deposit.created_at,
  }));
}

export async function getRecentWithdrawals() {
  return [];
}

export async function getRecentUsers(limit = 5) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
  }));
}
