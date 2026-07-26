import Modal from '../common/Modal.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function UserDetailsModal({ open, onClose, user }) {
  if (!user) return null;

  const fields = [
    { label: 'User ID', value: user.id },
    { label: 'Full name', value: user.name },
    { label: 'Email', value: user.email },
    { label: 'Role', value: user.role?.replace('_', ' ') },
    { label: 'Balance', value: formatCurrency(user.balance) },
    { label: 'Joined', value: formatDate(user.createdAt) },
    { label: 'Last login', value: formatDate(user.lastLoginAt) },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="User Details"
      footer={
        <button onClick={onClose} className="btn-secondary">
          Close
        </button>
      }
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold shrink-0">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-base font-semibold text-slate-100">{user.name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={user.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-xs text-slate-500 mb-1">{field.label}</p>
            <p className="text-sm font-medium text-slate-200 capitalize">
              {field.value || '—'}
            </p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
