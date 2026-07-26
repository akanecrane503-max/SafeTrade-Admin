import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpFromLine } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export default function RecentWithdrawals({ withdrawals, loading }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Recent Withdrawals</h3>
        <Link
          to={ROUTES.WITHDRAWALS}
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
      ) : !withdrawals?.length ? (
        <EmptyState
          icon={ArrowUpFromLine}
          title="No recent withdrawals"
          description="New withdrawal requests will show up here."
        />
      ) : (
        <div className="space-y-1">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <ArrowUpFromLine className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {withdrawal.userName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatRelativeTime(withdrawal.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <p className="text-sm font-semibold text-slate-200">
                  -{formatCurrency(withdrawal.amount)}
                </p>
                <StatusBadge status={withdrawal.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
