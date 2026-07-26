import { useState } from 'react';
import { Power } from 'lucide-react';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import { useToast } from '../../common/Toast.jsx';
import * as tradingService from '../../../services/tradingService';
import { cn } from '../../../utils/helpers';

export default function TradingTab({ user, onRefetch }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const enabled = Boolean(user.tradingEnabled);

  async function handleToggle() {
    setLoading(true);
    try {
      await tradingService.toggleUserTrading(user.id, !enabled);
      addToast(`Trading ${!enabled ? 'enabled' : 'disabled'} for this user`, 'success');
      setConfirmOpen(false);
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Failed to update trading status', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-5">Trading Status</h3>

      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              enabled ? 'bg-emerald-500/10' : 'bg-red-500/10'
            )}
          >
            <Power className={cn('w-5 h-5', enabled ? 'text-emerald-400' : 'text-red-400')} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              Trading is currently {enabled ? 'ON' : 'OFF'}
            </p>
            <p className="text-xs text-slate-500">
              {enabled
                ? 'This user can open and manage trades.'
                : 'This user is blocked from opening new trades.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setConfirmOpen(true)}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            enabled
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          )}
        >
          {enabled ? 'Disable Trading' : 'Enable Trading'}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleToggle}
        loading={loading}
        title={`${enabled ? 'Disable' : 'Enable'} trading for this user?`}
        message={
          enabled
            ? 'They will be unable to open new trades until re-enabled.'
            : 'They will regain the ability to open new trades.'
        }
        confirmLabel={enabled ? 'Disable' : 'Enable'}
        variant={enabled ? 'danger' : 'primary'}
      />
    </div>
  );
}
