import { Users, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import StatCard from './StatCard.jsx';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';

export default function StatisticsGrid({ stats, loading }) {
  const items = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats ? formatCompactNumber(stats.totalUsers) : '—',
      change: stats?.usersChange,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      icon: Wallet,
      label: 'Platform Balance',
      value: stats ? formatCurrency(stats.platformBalance) : '—',
      change: stats?.balanceChange,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10',
    },
    {
      icon: ArrowDownToLine,
      label: 'Total Deposits',
      value: stats ? formatCurrency(stats.totalDeposits) : '—',
      change: stats?.depositsChange,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    {
      icon: ArrowUpFromLine,
      label: 'Total Withdrawals',
      value: stats ? formatCurrency(stats.totalWithdrawals) : '—',
      change: stats?.withdrawalsChange,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <StatCard key={item.label} {...item} loading={loading} />
      ))}
    </div>
  );
}
