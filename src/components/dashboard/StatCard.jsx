import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../utils/helpers';

export default function StatCard({
  icon: Icon,
  label,
  value,
  change,          // e.g. 12.4 or -3.2
  changeLabel = 'vs last period',
  iconColor = 'text-blue-400',
  iconBg = 'bg-blue-500/10',
  loading = false,
}) {
  const isPositive = change >= 0;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        {typeof change === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full',
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>

      <p className="text-sm text-slate-500 mb-1">{label}</p>
      {loading ? (
        <div className="h-7 w-24 bg-slate-800 rounded-lg animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-slate-100 tracking-tight">{value}</p>
      )}
      {typeof change === 'number' && (
        <p className="text-xs text-slate-600 mt-1">{changeLabel}</p>
      )}
    </div>
  );
}
