import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, ROUTES } from '../utils/constants';

export default function Header({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || '{}');
  const displayName = storedUser?.name || 'Admin User';
  const displayEmail = storedUser?.email || 'admin@example.com';

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search — desktop only */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/60 border border-slate-800 rounded-xl px-3 py-2 w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search users, trades, transactions..."
            className="bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm font-semibold text-slate-200">Notifications</p>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                <div className="px-4 py-3 text-sm text-slate-400 text-center">
                  No new notifications
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-200 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm font-semibold text-slate-200 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(ROUTES.SETTINGS);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(ROUTES.SETTINGS);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
              <div className="py-1 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
