import { STATUS_COLORS } from '../../utils/constants';
import { cn } from '../../utils/helpers';

const VARIANT_CLASSES = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function StatusBadge({ status, label }) {
  const variant = STATUS_COLORS[status] || 'neutral';
  const displayLabel = label || status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize',
        VARIANT_CLASSES[variant]
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-emerald-400',
          variant === 'warning' && 'bg-amber-400',
          variant === 'danger' && 'bg-red-400',
          variant === 'neutral' && 'bg-slate-400',
          variant === 'info' && 'bg-blue-400'
        )}
      />
      {displayLabel}
    </span>
  );
}
