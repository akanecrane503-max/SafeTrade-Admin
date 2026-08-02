import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, User, Shield, Wallet, History, Activity, FileText, Settings } from 'lucide-react';
import { useToast } from '../components/common/Toast.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import * as userService from '../services/userService';
import { cn } from '../utils/helpers';
import { formatDate } from '../utils/formatters';

// Tab Components (Assuming you have these in your project based on your tree)
import ProfileTab from '../components/users/tabs/ProfileTab';
import SecurityTab from '../components/users/tabs/SecurityTab';
import AssetsTab from '../components/users/tabs/AssetsTab';
import TradingTab from '../components/users/tabs/TradingTab';
import WalletsTab from '../components/users/tabs/WalletsTab';
import WithdrawalsTab from '../components/users/tabs/WithdrawalsTab';
import DepositsTab from '../components/users/tabs/DepositsTab';
import KycTab from '../components/users/tabs/KycTab';
import BindingTab from '../components/users/tabs/BindingTab';
import AdminNotesTab from '../components/users/tabs/AdminNotesTab';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'assets', label: 'Assets', icon: Wallet },
  { id: 'trading', label: 'Trading', icon: Activity },
  { id: 'wallets', label: 'Wallets', icon: Wallet },
  { id: 'withdrawals', label: 'Withdrawals', icon: History },
  { id: 'deposits', label: 'Deposits', icon: FileText },
  { id: 'kyc', label: 'KYC', icon: Shield },
  { id: 'binding', label: 'Binding', icon: Settings },
  { id: 'notes', label: 'Admin Notes', icon: FileText },
];

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  async function loadUser() {
    setLoading(true);
    try {
      const data = await userService.getUserById(id);
      setUser(data);
    } catch (err) {
      addToast(err.message || 'Failed to load user', 'error');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/users')} className="text-slate-400 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.name || 'Unknown User'}</h1>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800/60 overflow-x-auto no-scrollbar">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
              <h3 className="text-lg font-semibold text-white">Profile</h3>
              <div className="flex items-center gap-3">
                {/* --- NEW TRADE MODE BADGE ADDED HERE --- */}
                {user?.tradeMode && user.tradeMode !== 'neutral' && (
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold border',
                    user.tradeMode === 'win' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 
                    'border-rose-500 text-rose-400 bg-rose-500/10'
                  )}>
                    {user.tradeMode === 'win' ? '⚡ AUTO WIN' : '⛔ AUTO LOSE'}
                  </span>
                )}
                
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  {user?.status || 'active'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">UID</label>
                  <p className="text-sm font-mono text-slate-300 break-all">{user?.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Email</label>
                  <p className="text-sm font-medium text-white">{user?.email || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Last Login</label>
                  <p className="text-sm text-slate-300">{user?.lastLogin ? formatDate(user.lastLogin) : '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Device</label>
                  <p className="text-sm text-slate-300">—</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Username</label>
                  <p className="text-sm text-slate-300">—</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Registration Date</label>
                  <p className="text-sm text-slate-300">{user?.createdAt ? formatDate(user.createdAt) : '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Country</label>
                  <p className="text-sm text-slate-300">{user?.country || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">IP Address</label>
                  <p className="text-sm text-slate-300">—</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && <SecurityTab user={user} onRefetch={loadUser} />}
        {activeTab === 'assets' && <AssetsTab user={user} />}
        {activeTab === 'trading' && <TradingTab user={user} onRefetch={loadUser} />}
        {activeTab === 'wallets' && <WalletsTab user={user} />}
        {activeTab === 'withdrawals' && <WithdrawalsTab user={user} />}
        {activeTab === 'deposits' && <DepositsTab user={user} />}
        {activeTab === 'kyc' && <KycTab user={user} onRefetch={loadUser} />}
        {activeTab === 'binding' && <BindingTab user={user} onRefetch={loadUser} />}
        {activeTab === 'notes' && <AdminNotesTab user={user} onRefetch={loadUser} />}
      </div>
    </div>
  );
}
