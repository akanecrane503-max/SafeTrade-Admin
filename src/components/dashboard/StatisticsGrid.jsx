import {
  Users,
  Radio,
  UserPlus,
  ArrowDownToLine,
  ArrowUpFromLine,
  LineChart,
  BadgeCheck,
  Clock,
  Coins,
} from 'lucide-react';
import StatCard from './StatCard.jsx';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';

export default function StatisticsGrid({ stats, loading }) {
  const items = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats ? formatCompactNumber(stats.totalUsers) : '—',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      icon: Radio,
      label: 'Online Users',
      value: stats ? formatCompactNumber(stats.onlineUsers) : '—',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    {
      icon: UserPlus,
      label: 'New Users Today',
      value: stats ? formatCompactNumber(stats.newUsersToday) : '—',
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10',
    },
    {
      icon: ArrowDownToLine,
      label: 'Pending Deposits',
      value: stats ? formatCompactNumber(stats.pendingDeposits) : '—',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      icon: ArrowUpFromLine,
      label: 'Pending Withdrawals',
      value: stats ? formatCompactNumber(stats.pendingWithdrawals) : '—',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      icon: LineChart,
      label: 'Active Trades',
      value: stats ? formatCompactNumber(stats.activeTrades) : '—',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      icon: BadgeCheck,
      label: 'Verified KYC',
      value: stats ? formatCompactNumber(stats.verifiedKyc) : '—',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    {
      icon: Clock,
      label: 'Pending KYC',
      value: stats ? formatCompactNumber(stats.pendingKyc) : '—',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      icon: Coins,
      label: 'Total Platform Assets',
      value: stats ? formatCurrency(stats.totalPlatformAssets) : '—',
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <StatCard key={item.label} {...item} loading={loading} />
      ))}
    </div>
  );
}
