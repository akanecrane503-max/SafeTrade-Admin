import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import StatisticsGrid from '../components/dashboard/StatisticsGrid.jsx';
import ActivityChart from '../components/dashboard/ActivityChart.jsx';
import RecentTrades from '../components/dashboard/RecentTrades.jsx';
import RecentDeposits from '../components/dashboard/RecentDeposits.jsx';
import RecentWithdrawals from '../components/dashboard/RecentWithdrawals.jsx';
import RecentUsers from '../components/dashboard/RecentUsers.jsx';
import * as dashboardService from '../services/dashboardService';

export default function Dashboard() {
  const [range, setRange] = useState('7d');

  const { data: stats, loading: statsLoading } = useApi(
    () => dashboardService.getDashboardStats(),
    []
  );

  const { data: activityData, loading: activityLoading } = useApi(
    () => dashboardService.getActivityChartData(range),
    [range]
  );

  const { data: trades, loading: tradesLoading } = useApi(
    () => dashboardService.getRecentTrades(5),
    []
  );

  const { data: deposits, loading: depositsLoading } = useApi(
    () => dashboardService.getRecentDeposits(5),
    []
  );

  const { data: withdrawals, loading: withdrawalsLoading } = useApi(
    () => dashboardService.getRecentWithdrawals(5),
    []
  );

  const { data: users, loading: usersLoading } = useApi(
    () => dashboardService.getRecentUsers(5),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back — here's what's happening on your platform.
        </p>
      </div>

      <StatisticsGrid stats={stats} loading={statsLoading} />

      <ActivityChart
        data={activityData}
        loading={activityLoading}
        range={range}
        onRangeChange={setRange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTrades trades={trades} loading={tradesLoading} />
        <RecentUsers users={users} loading={usersLoading} />
        <RecentDeposits deposits={deposits} loading={depositsLoading} />
        <RecentWithdrawals withdrawals={withdrawals} loading={withdrawalsLoading} />
      </div>
    </div>
  );
}
