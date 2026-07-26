import { TrendingUp, TrendingDown } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatCurrency, formatDateTime, formatPercent } from '../../utils/formatters';
import { cn } from '../../utils/helpers';

export default function TradeDetailsModal({ open, onClose, trade }) {
  if (!trade) return null;

  const isProfit = trade.pnl >= 0;

  const fields = [
    { label: 'Trade ID', value: trade.id },
    { label: 'User', value: trade.userName },
    { label: 'Email', value: trade.userEmail },
    { label: 'Pair', value: trade.pair },
    { label: 'Entry price', value: formatCurrency(trade.entryPrice) },
    { label: 'Exit price', value: trade.exitPrice ? formatCurrency(trade.exitPrice) : '—' },
    { label: 'Leverage', value: trade.leverage ? `${trade.leverage}x` : '—' },
    { label: 'Amount', value: formatCurrency(trade.amount) },
    { label: 'Opened', value: formatDateTime(trade.createdAt) },
    { label: 'Closed', value: trade.closedAt ? formatDateTime(trade.closedAt) : '—' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Trade Details"
      footer={
        <button onClick={onClose} className="btn-secondary">
          Close
        </button>
      }
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full',
              trade.direction === 'long'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {trade.direction === 'long' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {trade.direction === 'long' ? 'Long' : 'Short'}
          </span>
          <StatusBadge status={trade.status} />
        </div>
        <div className="text-right">
          <p className={cn('text-2xl font-bold', isProfit ? 'text-emerald-400' : 'text-red-400')}>
            {isProfit ? '+' : ''}
            {formatCurrency(trade.pnl)}
          </p>
          <p className={cn('text-xs', isProfit ? 'text-emerald-400/70' : 'text-red-400/70')}>
            {formatPercent(trade.pnlPercent)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-xs text-slate-500 mb-1">{field.label}</p>
            <p className="text-sm font-medium text-slate-200">{field.value || '—'}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
