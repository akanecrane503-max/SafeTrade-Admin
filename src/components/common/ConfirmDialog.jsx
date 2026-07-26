import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'primary'
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary" disabled={loading}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-xl shrink-0 ${
            variant === 'danger' ? 'bg-red-500/10' : 'bg-blue-500/10'
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 ${variant === 'danger' ? 'text-red-400' : 'text-blue-400'}`}
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-100 mb-1">{title}</h4>
          <p className="text-sm text-slate-400">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
