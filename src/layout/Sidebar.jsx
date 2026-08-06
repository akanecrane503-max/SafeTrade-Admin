import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  LineChart,
  Megaphone,
  MessageCircle,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  UserCog,
  ClipboardList,
  SlidersHorizontal,
} from 'lucide-react';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/helpers';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
  { label: 'Users', icon: Users, path: ROUTES.USERS },
  { label: 'Deposits', icon: ArrowDownToLine, path: ROUTES.DEPOSITS },
  { label: 'Withdrawals', icon: ArrowUpFromLine, path: ROUTES.WITHDRAWALS },
  { label: 'Wallets', icon: Wallet, path: ROUTES.WALLETS },
  { label: 'Trades', icon: LineChart, path: ROUTES.TRADES },
  { label: 'Announcements', icon: Megaphone, path: ROUTES.ANNOUNCEMENTS },
  { label: 'Customer Service', icon: MessageCircle, path: ROUTES.CUSTOMER_SERVICE },
  { label: 'Admin Management', icon: UserCog, path: ROUTES.ADMIN_MANAGEMENT, requireRole: 'main_admin' },
  { label: 'Activity Log', icon: ClipboardList, path: ROUTES.ACTIVITY_LOG, requireRole: 'main_admin' },
  { label: 'System Control', icon: SlidersHorizontal, path: ROUTES.SYSTEM_CONTROL, requireRole: 'main_admin' },
  { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS, requireRole: 'main_admin' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { adminUser } = useAdminAuth();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.requireRole || adminUser?.role === item.requireRole
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col',
          'bg-slate-900 border-r border-slate-800 transition-all duration-200 ease-in-out',
          collapsed ? 'lg:w-20' : 'lg:w-64',
          'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-16 flex items-center gap-2 px-4 border-b border-slate-800 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-white text-lg tracking-tight truncate">
              Admin<span className="text-blue-500">Panel</span>
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleNavItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === ROUTES.DASHBOARD}
              onClick={onMobileClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group relative',
                  isActive
                    ? 'bg-blue-600/15 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                )
              }
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-blue-500" />
                  )}
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 hidden lg:block">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm
              text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 transition-colors"
          >
            {collapsed ? (
              <ChevronsRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronsLeft className="w-5 h-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
