import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import StatisticsGrid from '../components/dashboard/StatisticsGrid.jsx';
import ActivityChart from '../components/dashboard/ActivityChart.jsx';
import RecentTrades from '../components/dashboard/RecentTrades.jsx';
import RecentDeposits from '../components/dashboard/RecentDeposits.jsx';
import RecentWithdrawals from '../components/dashboard/RecentWithdrawals.jsx';
import RecentUsers from '../components/dashboard/RecentUsers.jsx';
import RecentAdminActivity from '../components/dashboard/RecentAdminActivity.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';
import * as dashboardService from '../services/dashboardService';
import * as adminService from '../services/adminService';

export default function Dashboard() {
  const [range, setRange] = useState('7d');
  const location = useLocation();
  const [showApprovedBanner, setShowApprovedBanner] = useState(
    Boolean(location.state?.justApproved)
  );

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
  const { data: adminLogs, loading: adminLogsLoading } = useApi(
    () => adminService.getActivityLog({ limit: 5 }),
    []
  );

  return (
    <div className="space-y-6">
      {showApprovedBanner && (
        <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-300">You're approved!</p>
            <p className="text-sm text-emerald-400/80 mt-0.5">
              Welcome to the admin panel — you can now access your dashboard.
            </p>
          </div>
          <button
            onClick={() => setShowApprovedBanner(false)}
            className="text-emerald-400/60 hover:text-emerald-300 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
