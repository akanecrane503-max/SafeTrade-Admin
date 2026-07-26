// Central place for enums, route paths, and shared config values.
// Import from here instead of hardcoding strings across the app.

export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/',
  USERS: '/users',
  DEPOSITS: '/deposits',
  WITHDRAWALS: '/withdrawals',
  WALLETS: '/wallets',
  TRADES: '/trades',
  ANNOUNCEMENTS: '/announcements',
  REPORTS: '/reports',
  SETTINGS: '/settings',
};

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  BANNED: 'banned',
};

export const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const TRADE_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  LIQUIDATED: 'liquidated',
};

export const STATUS_COLORS = {
  active: 'success',
  completed: 'success',
  closed: 'success',
  pending: 'warning',
  open: 'warning',
  suspended: 'danger',
  failed: 'danger',
  banned: 'danger',
  liquidated: 'danger',
  cancelled: 'neutral',
};

export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  grid: '#1e293b',
  axis: '#64748b',
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

export const AUTH_TOKEN_KEY = 'admin_auth_token';
export const AUTH_USER_KEY = 'admin_auth_user';
