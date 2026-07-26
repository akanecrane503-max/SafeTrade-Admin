import { Link } from 'react-router-dom';
import {
  UserPlus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Megaphone,
  ShieldAlert,
  Settings,
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const ACTIONS = [
  { label: 'Review Deposits', icon: ArrowDownToLine, to: ROUTES.DEPOSITS, color: 'text-emerald-400 bg-emerald-500/10' },
  { label: 'Review Withdrawals', icon: ArrowUpFromLine, to: ROUTES.WITHDRAWALS, color: 'text-amber-400 bg-amber-500/10' },
  { label: 'Manage Users', icon: UserPlus, to: ROUTES.USERS, color: 'text-blue-400 bg-blue-500/10' },
  { label: 'New Announcement', icon: Megaphone, to: ROUTES.ANNOUNCEMENTS, color: 'text-violet-400 bg-violet-500/10' },
  { label: 'Admin Management', icon: ShieldAlert, to: ROUTES.ADMIN_MANAGEMENT, color: 'text-red-400 bg-red-500/10' },
  { label: 'System Control', icon: Settings, to: ROUTES.SYSTEM_CONTROL, color: 'text-slate-300 bg-slate-500/10' },
];

export default function QuickActions() {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ACTIONS.map(({ label, icon: Icon, to, color }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-colors text-center"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-300">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
