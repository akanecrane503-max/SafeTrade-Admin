import { useState } from 'react';
import { Link2, X, Smartphone, Mail } from 'lucide-react';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import { useToast } from '../../common/Toast.jsx';
import * as userService from '../../../services/userService';

function VerificationCard({ title, icon: Icon, value, status, onApprove, onDeny, loading }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <p className="text-sm text-slate-400 mb-4">
        {value || 'No value submitted yet.'}
      </p>

      {status === 'pending' ? (
        <div className="flex gap-3">
          <button
            onClick={onApprove}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            <Link2 className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={onDeny}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Deny
          </button>
        </div>
      ) : status === 'approved' ? (
        <p className="text-sm text-slate-500">This has already been approved.</p>
      ) : (
        <p className="text-sm text-slate-500">The user hasn't submitted this yet.</p>
      )}
    </div>
  );
}

export default function BindingTab({ user, onRefetch }) {
  const [confirm, setConfirm] = useState(null); // { kind: 'phone' | 'email', action: 'approve' | 'deny' }
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const phoneStatus = user.phoneVerificationStatus || 'not_linked';
  const emailStatus = user.emailVerificationStatus || 'not_linked';

  async function handleConfirm() {
    if (!confirm) return;
    setLoading(true);
    try {
      if (confirm.kind === 'phone' && confirm.action === 'approve') {
        await userService.approveUserPhoneVerification(user.id);
      } else if (confirm.kind === 'phone' && confirm.action === 'deny') {
        await userService.denyUserPhoneVerification(user.id);
      } else if (confirm.kind === 'email' && confirm.action === 'approve') {
        await userService.approveUserEmailVerification(user.id);
      } else if (confirm.kind === 'email' && confirm.action === 'deny') {
        await userService.denyUserEmailVerification(user.id);
      }
      addToast(
        `${confirm.kind === 'phone' ? 'Phone' : 'Email'} verification ${confirm.action === 'approve' ? 'approved' : 'denied'}`,
        'success'
      );
      setConfirm(null);
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <VerificationCard
        title="Phone Verification"
        icon={Smartphone}
        value={user.phoneNumber}
        status={phoneStatus}
        onApprove={() => setConfirm({ kind: 'phone', action: 'approve' })}
        onDeny={() => setConfirm({ kind: 'phone', action: 'deny' })}
        loading={loading}
      />

      <VerificationCard
        title="Email Verification"
        icon={Mail}
        value={user.verificationEmail}
        status={emailStatus}
        onApprove={() => setConfirm({ kind: 'email', action: 'approve' })}
        onDeny={() => setConfirm({ kind: 'email', action: 'deny' })}
        loading={loading}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        loading={loading}
        title={
          confirm?.action === 'approve'
            ? `Approve this ${confirm.kind} verification?`
            : `Deny this ${confirm?.kind} verification?`
        }
        message={
          confirm?.action === 'approve'
            ? "The user's submission will be marked as approved."
            : 'The submission will be reset, and the user can resubmit.'
        }
        confirmLabel={confirm?.action === 'approve' ? 'Approve' : 'Deny'}
        variant={confirm?.action === 'approve' ? 'primary' : 'danger'}
      />
    </div>
  );
}
