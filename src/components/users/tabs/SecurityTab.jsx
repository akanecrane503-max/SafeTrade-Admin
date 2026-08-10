import { useState } from 'react';
import { KeyRound, Lock, Snowflake, PlayCircle } from 'lucide-react';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import { useToast } from '../../common/Toast.jsx';
import * as userService from '../../../services/userService';

export default function SecurityTab({ user, onRefetch }) {
  const [confirmType, setConfirmType] = useState(null); // 'reset' | 'suspend' | 'freeze' | 'activate'
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const copy = {
    reset: {
      title: 'Send a password reset code?',
      message: "A 6-digit code will be emailed to the user. They'll enter it themselves to set a new password — you won't see or set it.",
      confirmLabel: 'Send Code',
      variant: 'primary',
    },
    suspend: {
      title: 'Suspend login access?',
      message: 'The user will be unable to log in until reactivated.',
      confirmLabel: 'Suspend Login',
      variant: 'danger',
    },
    freeze: {
      title: 'Freeze this account?',
      message: 'All trading, deposits, and withdrawals will be blocked immediately.',
      confirmLabel: 'Freeze Account',
      variant: 'danger',
    },
    activate: {
      title: 'Reactivate this account?',
      message: 'Full access will be restored for this user.',
      confirmLabel: 'Activate Account',
      variant: 'primary',
    },
  };

  async function handleConfirm() {
    setLoading(true);
    try {
      if (confirmType === 'reset') await userService.resetUserPassword(user.id, user.email);
      if (confirmType === 'suspend') await userService.suspendUserLogin(user.id);
      if (confirmType === 'freeze') await userService.freezeUserAccount(user.id);
      if (confirmType === 'activate') await userService.activateUserAccount(user.id);
      addToast('Action completed successfully', 'success');
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
      <h3 className="text-sm font-semibold text-slate-200 mb-5">Security</h3>

      <div className="mb-6">
        <p className="text-xs text-slate-500 mb-1">Email</p>
        <p className="text-sm font-medium text-slate-200">{user.email}</p>
        <p className="text-xs text-slate-600 mt-2">
          Passwords are never displayed. Use the actions below to manage account access.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setConfirmType('reset')}
          className="flex items-center gap-2 justify-center btn-secondary py-2.5"
        >
          <KeyRound className="w-4 h-4" />
          Reset Password
        </button>
        <button
          onClick={() => setConfirmType('suspend')}
          className="flex items-center gap-2 justify-center py-2.5 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
        >
          <Lock className="w-4 h-4" />
          Suspend Login
        </button>
        <button
          onClick={() => setConfirmType('freeze')}
          className="flex items-center gap-2 justify-center py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <Snowflake className="w-4 h-4" />
          Freeze Account
        </button>
        <button
          onClick={() => setConfirmType('activate')}
          className="flex items-center gap-2 justify-center py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
        >
          <PlayCircle className="w-4 h-4" />
          Activate Account
        </button>
      </div>

      <ConfirmDialog
        open={Boolean(confirmType)}
        onClose={() => setConfirmType(null)}
        onConfirm={handleConfirm}
        loading={loading}
        {...(confirmType ? copy[confirmType] : {})}
      />
    </div>
  );
}
