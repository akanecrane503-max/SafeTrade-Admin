import { Eye, TrendingUp, TrendingDown, XCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { formatCurrency, formatDateTime, formatPercent } from '../../utils/formatters';
import { cn } from '../../utils/helpers';

export default function TradesTable({ trades, loading, onView, onClose }) {
  if (loading) {
    return (
      <div className="card py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!trades?.length) {
    return (
      <div className="card">
        <EmptyState title="No trades found" description="Try adjusting your search or filters." />
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
              <th className="px-4 py-3 font-medium text-slate-500">Pair</th>
              <th className="px-4 py-3 font-medium text-slate-500">Direction</th>
              <th className="px-4 py-3 font-medium text-slate-500">Amount</th>
              <th className="px-4 py-3 font-medium text-slate-500">P&L</th>
              <th className="px-4 py-3 font-medium text-slate-500">Opened</th>
              <th className="px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {trades.map((trade) => {
              const isProfit = trade.pnl >= 0;
              return (
                <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{trade.userName}</p>
                    <p className="text-xs text-slate-500">{trade.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-medium">{trade.pair}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-semibold',
                        trade.direction === 'long' ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      {trade.direction === 'long' ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {trade.direction === 'long' ? 'Long' : 'Short'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatCurrency(trade.amount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'font-semibold',
                        isProfit ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      {isProfit ? '+' : ''}
                      {formatCurrency(trade.pnl)}
                      <span className="text-xs ml-1 opacity-70">
                        ({formatPercent(trade.pnlPercent)})
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDateTime(trade.createdAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={trade.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(trade)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {trade.status === 'open' && (
                        <button
                          onClick={() => onClose(trade)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Force close"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
