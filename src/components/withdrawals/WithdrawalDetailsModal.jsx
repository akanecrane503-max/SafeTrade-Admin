import Modal from '../common/Modal.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function WithdrawalDetailsModal({ open, onClose, withdrawal }) {
  if (!withdrawal) return null;

  const fields = [
    { label: 'Withdrawal ID', value: withdrawal.id },
    { label: 'User', value: withdrawal.userName },
    { label: 'Email', value: withdrawal.userEmail },
    { label: 'Amount', value: formatCurrency(withdrawal.amount) },
    { label: 'Fee', value: formatCurrency(withdrawal.fee || 0) },
    { label: 'Method', value: withdrawal.method },
    { label: 'Destination wallet', value: withdrawal.destinationWallet },
    { label: 'Network', value: withdrawal.network },
    { label: 'Date', value: formatDateTime(withdrawal.createdAt) },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Withdrawal Details"
      footer={
        <button onClick={onClose} className="btn-secondary">
          Close
        </button>
      }
    >
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-slate-100">
          -{formatCurrency(withdrawal.amount)}
        </p>
        <StatusBadge status={withdrawal.status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div
            key={field.label}
            className={field.label.includes('wallet') ? 'col-span-2' : ''}
          >
            <p className="text-xs text-slate-500 mb-1">{field.label}</p>
            <p className="text-sm font-medium text-slate-200 break-all">
              {field.value || '—'}
            </p>
          </div>
        ))}
      </div>

      {withdrawal.status === 'rejected' && withdrawal.reason && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
          <p className="text-xs text-red-400 font-medium mb-0.5">Rejection reason</p>
          <p className="text-sm text-red-300">{withdrawal.reason}</p>
        </div>
      )}
    </Modal>
  );
}
