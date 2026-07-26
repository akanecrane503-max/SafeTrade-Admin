import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import StatusBadge from '../../common/StatusBadge.jsx';
import LoadingSpinner from '../../common/LoadingSpinner.jsx';
import EmptyState from '../../common/EmptyState.jsx';
import * as depositService from '../../../services/depositService';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { cn } from '../../../utils/helpers';

const STATUS_TABS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'History', value: 'all' },
];

export default function DepositsTab({ user }) {
  const [statusTab, setStatusTab] = useState('pending');

  const { data, loading } = useApi(
    () =>
      depositService.getUserDeposits(user.id, {
        status: statusTab === 'all' ? undefined : statusTab,
      }),
    [user.id, statusTab]
  );

  const items = data?.items || [];

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Deposits</h3>

      <div className="flex items-center gap-4 border-b border-slate-800 mb-4 text-sm">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusTab(tab.value)}
            className={cn(
              'font-semibold pb-2 border-b-2 transition-colors',
              statusTab === tab.value
                ? 'text-blue-400 border-blue-500'
                : 'text-slate-500 border-transparent'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-10">
          <LoadingSpinner size="sm" />
        </div>
      ) : !items.length ? (
        <EmptyState title="No deposits" description="No deposits in this view." />
      ) : (
        <div className="space-y-1">
          {items.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-emerald-400">
                  +{formatCurrency(d.amount)}
                </p>
                <p className="text-xs text-slate-500">{formatDateTime(d.createdAt)}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
