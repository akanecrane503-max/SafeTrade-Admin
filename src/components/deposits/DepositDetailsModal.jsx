import Modal from '../common/Modal.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function DepositDetailsModal({ open, onClose, deposit }) {
  if (!deposit) return null;

  const fields = [
    { label: 'Deposit ID', value: deposit.id },
    { label: 'User', value: deposit.userName },
    { label: 'Email', value: deposit.userEmail },
    { label: 'Amount', value: formatCurrency(deposit.amount) },
    { label: 'Method', value: deposit.method },
    { label: 'Wallet / Tx hash', value: deposit.txHash || deposit.wallet },
    { label: 'Network', value: deposit.network },
    { label: 'Date', value: formatDateTime(deposit.createdAt) },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deposit Details"
      footer={
        <button onClick={onClose} className="btn-secondary">
          Close
        </button>
      }
    >
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-emerald-400">
          +{formatCurrency(deposit.amount)}
        </p>
        <StatusBadge status={deposit.status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.label} className={field.label.includes('Wallet') ? 'col-span-2' : ''}>
            <p className="text-xs text-slate-500 mb-1">{field.label}</p>
            <p className="text-sm font-medium text-slate-200 break-all">
              {field.value || '—'}
            </p>
          </div>
        ))}
      </div>

      {deposit.status === 'rejected' && deposit.reason && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
          <p className="text-xs text-red-400 font-medium mb-0.5">Rejection reason</p>
          <p className="text-sm text-red-300">{deposit.reason}</p>
        </div>
      )}
    </Modal>
  );
}
