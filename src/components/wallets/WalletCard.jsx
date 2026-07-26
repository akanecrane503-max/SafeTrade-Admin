import { Wallet, Pencil, Power, QrCode } from 'lucide-react';
import { formatCurrency, formatCrypto } from '../../utils/formatters';
import { cn } from '../../utils/helpers';

export default function WalletCard({ wallet, onEdit, onToggle, onViewQr }) {
  const isEnabled = wallet.enabled;

  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">{wallet.coin}</p>
            <p className="text-xs text-slate-500">{wallet.network}</p>
          </div>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
            isEnabled
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
          )}
        >
          <span
            className={cn('w-1.5 h-1.5 rounded-full', isEnabled ? 'bg-emerald-400' : 'bg-slate-400')}
          />
          {isEnabled ? 'Active' : 'Disabled'}
        </span>
      </div>

      <div className="space-y-3 mb-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-1">Hot wallet address</p>
            <p className="text-xs font-mono text-slate-300 break-all">{wallet.address}</p>
          </div>
          <button
            onClick={() => onViewQr(wallet)}
            className="shrink-0 w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center hover:bg-slate-800 transition-colors"
            title="View QR code"
          >
            <QrCode className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Balance</p>
            <p className="text-sm font-semibold text-slate-200">
              {formatCrypto(wallet.balance)} {wallet.coin}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">USD Value</p>
            <p className="text-sm font-semibold text-slate-200">
              {formatCurrency(wallet.usdValue)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Min withdrawal</p>
            <p className="text-sm text-slate-300">
              {formatCrypto(wallet.minWithdrawal)} {wallet.coin}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Withdrawal fee</p>
            <p className="text-sm text-slate-300">
              {formatCrypto(wallet.withdrawalFee)} {wallet.coin}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
        <button
          onClick={() => onEdit(wallet)}
          className="flex-1 flex items-center justify-center gap-2 btn-secondary py-2"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onToggle(wallet)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors',
            isEnabled
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          )}
        >
          <Power className="w-4 h-4" />
          {isEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  );
}
