import { useState } from 'react';
import { LogIn, ArrowDownToLine, ArrowUpFromLine, LineChart, BadgeCheck, Link2 } from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import LoadingSpinner from '../../common/LoadingSpinner.jsx';
import EmptyState from '../../common/EmptyState.jsx';
import * as userService from '../../../services/userService';
import { formatRelativeTime } from '../../../utils/formatters';

const TYPE_ICONS = {
  login: LogIn,
  deposit: ArrowDownToLine,
  withdrawal: ArrowUpFromLine,
  trade: LineChart,
  kyc: BadgeCheck,
  binding: Link2,
};

export default function ActivityTab({ user }) {
  const [page] = useState(1);
  const { data, loading } = useApi(
    () => userService.getUserActivity(user.id, { page }),
    [user.id, page]
  );

  const items = data?.items || [];

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Recent Activity</h3>

      {loading ? (
        <div className="py-10">
          <LoadingSpinner size="sm" />
        </div>
      ) : !items.length ? (
        <EmptyState title="No activity" description="This user has no recorded activity yet." />
      ) : (
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = TYPE_ICONS[item.type] || LogIn;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-sm text-slate-200 truncate">{item.description}</p>
                </div>
                <p className="text-xs text-slate-500 shrink-0">
                  {formatRelativeTime(item.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
