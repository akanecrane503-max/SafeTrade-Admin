import { UserPlus, LogIn, LineChart, ArrowDownToLine, ArrowUpFromLine, Wrench } from 'lucide-react';
import { cn } from '../../utils/helpers';

const TOGGLE_CONFIG = [
  { key: 'registration', label: 'Registration', description: 'Allow new users to sign up', icon: UserPlus },
  { key: 'login', label: 'Login', description: 'Allow users to log in', icon: LogIn },
  { key: 'trading', label: 'Trading', description: 'Allow users to open new trades', icon: LineChart },
  { key: 'deposits', label: 'Deposits', description: 'Allow users to submit deposits', icon: ArrowDownToLine },
  { key: 'withdrawals', label: 'Withdrawals', description: 'Allow users to request withdrawals', icon: ArrowUpFromLine },
  { key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Take the platform offline for users', icon: Wrench, danger: true },
];

export default function SystemToggles({ settings, onToggle }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-5">Platform Controls</h3>

      <div className="space-y-2">
        {TOGGLE_CONFIG.map(({ key, label, description, icon: Icon, danger }) => {
          const enabled = Boolean(settings?.[key]);
          return (
            <div
              key={key}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    danger && enabled ? 'bg-red-500/10' : enabled ? 'bg-emerald-500/10' : 'bg-slate-500/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4',
                      danger && enabled
                        ? 'text-red-400'
                        : enabled
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
              </div>

              <button
                onClick={() => onToggle(key, !enabled)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors shrink-0',
                  enabled ? (danger ? 'bg-red-500' : 'bg-blue-600') : 'bg-slate-700'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                    enabled && 'translate-x-5'
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
