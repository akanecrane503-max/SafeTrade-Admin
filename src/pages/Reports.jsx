import { useState } from 'react';
import { Download, DollarSign, Receipt, BarChart3, TrendingUp } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import Dropdown from '../components/common/Dropdown.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import RevenueChart from '../components/reports/RevenueChart.jsx';
import TradingVolumeChart from '../components/reports/TradingVolumeChart.jsx';
import * as reportService from '../services/reportService';
import { formatCurrency } from '../utils/formatters';

const RANGE_OPTIONS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This year', value: 'ytd' },
];

export default function Reports() {
  const [range, setRange] = useState('30d');

  const { data: summary, loading: summaryLoading } = useApi(
    () => reportService.getSummary(range),
    [range]
  );

  const { data: revenueData, loading: revenueLoading } = useApi(
    () => reportService.getRevenueReport(range),
    [range]
  );

  const { data: volumeData, loading: volumeLoading } = useApi(
    () => reportService.getTradingVolumeReport(range),
    [range]
  );

  async function handleExport() {
    await reportService.exportReport(range);
  }

  const statItems = [
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: summary ? formatCurrency(summary.totalRevenue) : '—',
      change: summary?.revenueChange,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      icon: Receipt,
      label: 'Total Fees',
      value: summary ? formatCurrency(summary.totalFees) : '—',
      change: summary?.feesChange,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10',
    },
    {
      icon: BarChart3,
      label: 'Trading Volume',
      value: summary ? formatCurrency(summary.totalVolume) : '—',
      change: summary?.volumeChange,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Net Profit',
      value: summary ? formatCurrency(summary.netProfit) : '—',
      change: summary?.profitChange,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Revenue, fees, and trading volume across your platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dropdown
            options={RANGE_OPTIONS}
            value={range}
            onChange={setRange}
            className="w-44"
          />
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 shrink-0">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item) => (
          <StatCard key={item.label} {...item} loading={summaryLoading} />
        ))}
      </div>

      <RevenueChart data={revenueData} loading={revenueLoading} />
      <TradingVolumeChart data={volumeData} loading={volumeLoading} />
    </div>
  );
}
