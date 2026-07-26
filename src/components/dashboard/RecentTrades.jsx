import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export default function RecentTrades({ trades, loading }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Recent Trades</h3>
        <Link
          to={ROUTES.TRADES}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="py-8">
          <LoadingSpinner size="sm" />
        </div>
      ) : !trades?.length ? (
        <EmptyState title="No recent trades" description="Trades will appear here as they happen." />
      ) : (
        <div className="space-y-1">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    trade.direction === 'long' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}
                >
                  {trade.direction === 'long' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {trade.userName} · {trade.pair}
                  </p>
                  <p className="text-xs text-slate-500">{formatRelativeTime(trade.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <p className="text-sm font-semibold text-slate-200">
                  {formatCurrency(trade.amount)}
                </p>
                <StatusBadge status={trade.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
