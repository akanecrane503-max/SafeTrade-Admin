/* src/components/trades/TradesTable.jsx */
import { Eye, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

export default function TradesTable({ trades, loading, onView, onClose, onForceSettle }) {
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
        <EmptyState title="No trades found" description="Trades will appear here when users place positions." />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="px-4 py-3 font-medium text-slate-500">Trade ID</th>
              <th className="px-4 py-3 font-medium text-slate-500">User</th>
              <th className="px-4 py-3 font-medium text-slate-500">Pair</th>
              <th className="px-4 py-3 font-medium text-slate-500">Amount</th>
              <th className="px-4 py-3 font-medium text-slate-500">Direction</th>
              <th className="px-4 py-3 font-medium text-slate-500">Entry</th>
              <th className="px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 font-medium text-slate-500">Date</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                  #{trade.id?.slice(0, 8)}
                </td>
                <td className="px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-200 truncate">{trade.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500 truncate">{trade.profiles?.email || ''}</p>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-white">{trade.symbol}</td>
                <td className="px-4 py-3 text-slate-300 font-medium">
                  ${Number(trade.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                    trade.direction === 'Long' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {trade.direction === 'Long' ? '↑' : '↓'} {trade.direction}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  ${Number(trade.entry_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={trade.status} />
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {formatRelativeTime(trade.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    
                    {/* --- ADMIN AUTO WIN / LOSE BUTTONS --- */}
                    {trade.status === 'open' && (
                      <>
                        <button
                          onClick={() => onForceSettle(trade, 'win')}
                          className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors tooltip"
                          title="Force Auto-Win"
                        >
                          <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => onForceSettle(trade, 'lose')}
                          className="p-1.5 rounded-md bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors tooltip"
                          title="Force Auto-Lose"
                        >
                          <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </>
                    )}

                    {/* VIEW BUTTON */}
                    <button
                      onClick={() => onView(trade)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                      title="Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* FORCE CLOSE (Market Price) BUTTON */}
                    {trade.status === 'open' && (
                      <button
                        onClick={() => onClose(trade)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Force Close (Market)"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
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
