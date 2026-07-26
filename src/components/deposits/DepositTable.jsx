import { Eye, Check, X } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { formatCurrency, formatDateTime, truncateAddress } from '../../utils/formatters';

export default function DepositTable({ deposits, loading, onView, onApprove, onReject }) {
  if (loading) {
    return (
      <div className="card py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!deposits?.length) {
    return (
      <div className="card">
        <EmptyState title="No deposits found" description="Try adjusting your search or filters." />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="px-4 py-3 font-medium text-slate-500">User</th>
              <th className="px-4 py-3 font-medium text-slate-500">Amount</th>
              <th className="px-4 py-3 font-medium text-slate-500">Method</th>
              <th className="px-4 py-3 font-medium text-slate-500">Tx / Wallet</th>
              <th className="px-4 py-3 font-medium text-slate-500">Date</th>
              <th className="px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {deposits.map((deposit) => (
              <tr key={deposit.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-200">{deposit.userName}</p>
                  <p className="text-xs text-slate-500">{deposit.userEmail}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-emerald-400">
                  +{formatCurrency(deposit.amount)}
                </td>
                <td className="px-4 py-3 text-slate-400 capitalize">{deposit.method || '—'}</td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                  {truncateAddress(deposit.txHash || deposit.wallet)}
                </td>
                <td className="px-4 py-3 text-slate-400">{formatDateTime(deposit.createdAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={deposit.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(deposit)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {deposit.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(deposit)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReject(deposit)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
