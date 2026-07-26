import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatRelativeTime } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export default function RecentUsers({ users, loading }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">New Users</h3>
        <Link
          to={ROUTES.USERS}
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
      ) : !users?.length ? (
        <EmptyState title="No new users" description="Newly registered users will appear here." />
      ) : (
        <div className="space-y-1">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <p className="text-xs text-slate-500">{formatRelativeTime(user.createdAt)}</p>
                <StatusBadge status={user.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
