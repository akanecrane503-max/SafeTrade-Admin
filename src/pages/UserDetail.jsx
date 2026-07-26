import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/common/Toast.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import * as userService from '../services/userService';
import { cn } from '../utils/helpers';
import { ROUTES } from '../utils/constants';

import ProfileTab from '../components/users/tabs/ProfileTab.jsx';
import SecurityTab from '../components/users/tabs/SecurityTab.jsx';
import AssetsTab from '../components/users/tabs/AssetsTab.jsx';
import TradingTab from '../components/users/tabs/TradingTab.jsx';
import WalletsTab from '../components/users/tabs/WalletsTab.jsx';
import WithdrawalsTab from '../components/users/tabs/WithdrawalsTab.jsx';
import DepositsTab from '../components/users/tabs/DepositsTab.jsx';
import KycTab from '../components/users/tabs/KycTab.jsx';
import BindingTab from '../components/users/tabs/BindingTab.jsx';
import AdminNotesTab from '../components/users/tabs/AdminNotesTab.jsx';
import ActivityTab from '../components/users/tabs/ActivityTab.jsx';

const TABS = [
  { key: 'profile', label: 'Profile', Component: ProfileTab },
  { key: 'security', label: 'Security', Component: SecurityTab },
  { key: 'assets', label: 'Assets', Component: AssetsTab },
  { key: 'trading', label: 'Trading', Component: TradingTab },
  { key: 'wallets', label: 'Wallets', Component: WalletsTab },
  { key: 'withdrawals', label: 'Withdrawals', Component: WithdrawalsTab },
  { key: 'deposits', label: 'Deposits', Component: DepositsTab },
  { key: 'kyc', label: 'KYC', Component: KycTab },
  { key: 'binding', label: 'Binding', Component: BindingTab },
  { key: 'notes', label: 'Admin Notes', Component: AdminNotesTab },
  { key: 'activity', label: 'Activity', Component: ActivityTab },
];

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: user, loading, refetch } = useApi(() => userService.getUserDetail(id), [id]);

  function handleRefetch() {
    refetch().catch(() => addToast('Failed to refresh user data', 'error'));
  }

  if (loading) {
    return (
      <div className="card py-24">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card">
        <EmptyState title="User not found" description="This user may have been removed." />
      </div>
    );
  }

  const ActiveComponent = TABS.find((t) => t.key === activeTab)?.Component || ProfileTab;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(ROUTES.USERS)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold shrink-0">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'shrink-0 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.key
                ? 'text-blue-400 border-blue-500'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ActiveComponent user={user} onRefetch={handleRefetch} />
    </div>
  );
}
