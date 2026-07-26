import { useState } from 'react';
import { Link2, X } from 'lucide-react';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import { useToast } from '../../common/Toast.jsx';
import * as userService from '../../../services/userService';

export default function BindingTab({ user, onRefetch }) {
  const [confirmType, setConfirmType] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const status = user.bindingStatus || 'pending';

  async function handleConfirm() {
    setLoading(true);
    try {
      if (confirmType === 'approve') await userService.approveUserBinding(user.id);
      if (confirmType === 'deny') await userService.denyUserBinding(user.id);
      addToast(`Account binding ${confirmType === 'approve' ? 'approved' : 'denied'}`, 'success');
      setConfirmType(null);
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-200">Account Binding</h3>
        <StatusBadge status={status} />
      </div>

      {status === 'pending' ? (
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmType('approve')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <Link2 className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => setConfirmType('deny')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <X className="w-4 h-4" />
            Deny
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          This user's account binding has already been {status}.
        </p>
      )}

      <ConfirmDialog
        open={Boolean(confirmType)}
        onClose={() => setConfirmType(null)}
        onConfirm={handleConfirm}
        loading={loading}
        title={confirmType === 'approve' ? 'Approve this binding?' : 'Deny this binding?'}
        message={
          confirmType === 'approve'
            ? 'The user\u2019s account binding will be marked as verified.'
            : 'The binding request will be rejected.'
        }
        confirmLabel={confirmType === 'approve' ? 'Approve' : 'Deny'}
        variant={confirmType === 'approve' ? 'primary' : 'danger'}
      />
    </div>
  );
}
