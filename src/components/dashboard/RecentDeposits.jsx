import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDownToLine } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export default function RecentDeposits({ deposits, loading }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Recent Deposits</h3>
        <Link
          to={ROUTES.DEPOSITS}
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
      ) : !deposits?.length ? (
        <EmptyState
          icon={ArrowDownToLine}
          title="No recent deposits"
          description="New deposits will show up here."
        />
      ) : (
        <div className="space-y-1">
          {deposits.map((deposit) => (
            <div
              key={deposit.id}
              className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {deposit.userName}
                  </p>
                  <p className="text-xs text-slate-500">{formatRelativeTime(deposit.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <p className="text-sm font-semibold text-emerald-400">
                  +{formatCurrency(deposit.amount)}
                </p>
                <StatusBadge status={deposit.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
