import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import StatusBadge from '../../common/StatusBadge.jsx';
import LoadingSpinner from '../../common/LoadingSpinner.jsx';
import EmptyState from '../../common/EmptyState.jsx';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import { useToast } from '../../common/Toast.jsx';
import * as withdrawalService from '../../../services/withdrawalService';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { cn } from '../../../utils/helpers';

const TYPES = [
  { label: 'Internal', value: 'internal' },
  { label: 'External', value: 'external' },
];
const STATUS_TABS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'History', value: 'all' },
];

export default function WithdrawalsTab({ user }) {
  const [type, setType] = useState('internal');
  const [statusTab, setStatusTab] = useState('pending');
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'approve'|'reject', withdrawal }
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const { data, loading, refetch } = useApi(
    () =>
      withdrawalService.getUserWithdrawals(user.id, {
        type,
        status: statusTab === 'all' ? undefined : statusTab,
      }),
    [user.id, type, statusTab]
  );
  const items = data?.items || [];

  async function handleConfirmedAction() {
    if (!confirmAction) return;
    const { type: actionType, withdrawal } = confirmAction;
    setSaving(true);
    try {
      if (actionType === 'approve') await withdrawalService.approveWithdrawal(withdrawal.id);
      if (actionType === 'reject') await withdrawalService.rejectWithdrawal(withdrawal.id);
      addToast(`Withdrawal ${actionType}d successfully`, 'success');
      setConfirmAction(null);
      refetch();
    } catch (err) {
      addToast(err.message || `Failed to ${actionType} withdrawal`, 'error');
    } finally {
      setSaving(false);
    }
  }

  const confirmCopy = {
    approve: {
      title: 'Approve this withdrawal?',
      message:
        type === 'internal'
          ? 'The recipient will be credited immediately.'
          : "Funds will be sent to the user's destination wallet.",
      confirmLabel: 'Approve',
      variant: 'primary',
    },
    reject: {
      title: 'Reject this withdrawal?',
      message: 'The held amount will be refunded back to the user\u2019s balance.',
      confirmLabel: 'Reject',
      variant: 'danger',
    },
  };

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Withdrawals</h3>
      <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 w-fit mb-4">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              type === t.value ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
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
        <EmptyState title="No withdrawals" description={`No ${type} withdrawals in this view.`} />
      ) : (
        <div className="space-y-1">
          {items.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-200">{formatCurrency(w.amount)}</p>
                <p className="text-xs text-slate-500">{formatDateTime(w.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={w.status} />
                {w.status === 'pending' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setConfirmAction({ type: 'approve', withdrawal: w })}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setConfirmAction({ type: 'reject', withdrawal: w })}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmedAction}
        loading={saving}
        {...(confirmAction ? confirmCopy[confirmAction.type] : {})}
      />
    </div>
  );
}
