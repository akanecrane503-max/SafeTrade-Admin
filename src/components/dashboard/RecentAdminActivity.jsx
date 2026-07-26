import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatRelativeTime } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export default function RecentAdminActivity({ logs, loading }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Recent Admin Activity</h3>
        <Link
          to={ROUTES.ACTIVITY_LOG}
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
      ) : !logs?.length ? (
        <EmptyState
          icon={ShieldCheck}
          title="No recent activity"
          description="Administrator actions will appear here."
        />
      ) : (
        <div className="space-y-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {log.adminName} — <span className="text-slate-400">{log.action}</span>
                  </p>
                  <p className="text-xs text-slate-500 truncate">{log.target}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 shrink-0">{formatRelativeTime(log.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
