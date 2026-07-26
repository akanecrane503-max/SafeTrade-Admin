export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/',
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  DEPOSITS: '/deposits',
  WITHDRAWALS: '/withdrawals',
  WALLETS: '/wallets',
  TRADES: '/trades',
  ANNOUNCEMENTS: '/announcements',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  ADMIN_MANAGEMENT: '/admins',
  ACTIVITY_LOG: '/activity-log',
  SYSTEM_CONTROL: '/system-control',
};

export function userDetailPath(id) {
  return `/users/${id}`;
}

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  BANNED: 'banned',
  FROZEN: 'frozen',
};

export const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const WITHDRAWAL_TYPE = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
};

export const TRADE_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  LIQUIDATED: 'liquidated',
};

export const KYC_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  DENIED: 'denied',
};

export const BINDING_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  DENIED: 'denied',
};

export const ADMIN_ROLES = {
  MAIN_ADMIN: 'main_admin',
  FINANCE_ADMIN: 'finance_admin',
  SUPPORT_ADMIN: 'support_admin',
  MODERATOR: 'moderator',
};

export const ADMIN_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

export const ASSET_LIST = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'USDT', 'USDC'];

export const NETWORKS = [
  { label: 'BTC', value: 'BTC' },
  { label: 'ETH', value: 'ETH' },
  { label: 'SOL', value: 'SOL' },
  { label: 'XRP', value: 'XRP' },
  { label: 'TRON', value: 'TRON' },
  { label: 'BNB', value: 'BNB' },
  { label: 'USDT (ERC20)', value: 'USDT_ERC20' },
  { label: 'USDT (TRC20)', value: 'USDT_TRC20' },
  { label: 'USDT (BEP20)', value: 'USDT_BEP20' },
];

export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRADE: 'trade',
  KYC: 'kyc',
  BINDING: 'binding',
};

export const ADMIN_ACTION_TYPES = {
  EDIT_BALANCE: 'edit_balance',
  APPROVE_DEPOSIT: 'approve_deposit',
  REJECT_DEPOSIT: 'reject_deposit',
  APPROVE_WITHDRAWAL: 'approve_withdrawal',
  REJECT_WITHDRAWAL: 'reject_withdrawal',
  UPDATE_WALLET: 'update_wallet',
  VERIFY_KYC: 'verify_kyc',
  DENY_KYC: 'deny_kyc',
  CREATE_ADMIN: 'create_admin',
  EDIT_ANNOUNCEMENT: 'edit_announcement',
  SUSPEND_LOGIN: 'suspend_login',
  FREEZE_ACCOUNT: 'freeze_account',
  ACTIVATE_ACCOUNT: 'activate_account',
  RESET_PASSWORD: 'reset_password',
  TOGGLE_TRADING: 'toggle_trading',
};

export const STATUS_COLORS = {
  active: 'success',
  completed: 'success',
  approved: 'success',
  closed: 'success',
  verified: 'success',
  pending: 'warning',
  open: 'warning',
  suspended: 'danger',
  failed: 'danger',
  banned: 'danger',
  frozen: 'danger',
  denied: 'danger',
  rejected: 'danger',
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
