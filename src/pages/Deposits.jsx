import { useState, useMemo, useEffect } from 'react';
import { Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePagination } from '../hooks/usePagination';
import { useToast } from '../components/common/Toast.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import Dropdown from '../components/common/Dropdown.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import DepositTable from '../components/deposits/DepositTable.jsx';
import DepositDetailsModal from '../components/deposits/DepositDetailsModal.jsx';
import { searchFilter, filterByStatus, exportToCsv } from '../utils/helpers';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Failed', value: 'Failed' },
];

export default function Deposits() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsDeposit, setDetailsDeposit] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState({});

  const { addToast } = useToast();

  // Fetch deposits and users from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposit_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      // Fetch all users to get their details
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, username');

      if (usersError) throw usersError;

      // Create a map of user id -> user data
      const userMap = {};
      usersData.forEach(user => {
        userMap[user.id] = user;
      });
      setUsers(userMap);
      setDeposits(depositsData || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      addToast('Failed to load deposits', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscription for deposit updates
    const subscription = supabase
      .channel('admin_deposits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposit_history'
        },
        (payload) => {
          // Refresh when a deposit is added, updated, or deleted
          fetchData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredDeposits = useMemo(() => {
    let result = searchFilter(deposits, search, ['user_email', 'id', 'tx_hash', 'coin', 'network']);
    
    if (status !== 'all') {
      result = result.filter(d => d.status === status);
    }
    
    // Add user info to each deposit
    return result.map(deposit => ({
      ...deposit,
      userEmail: deposit.user_email || 'Unknown',
      userName: users[deposit.user_id]?.username || users[deposit.user_id]?.email || 'Unknown',
      txHash: deposit.tx_hash,
      depositAddress: deposit.deposit_address,
    }));
  }, [deposits, search, status, users]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredDeposits);

  // Approve deposit - updates status and user balance
  async function handleApproveDeposit(deposit) {
    setSaving(true);
    try {
      const coinField = deposit.coin.toLowerCase();
      
      // Get current user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', deposit.user_id)
        .single();

      if (profileError) throw new Error('Failed to fetch user profile');

      // Update user balance
      const currentBalance = profile[coinField] || 0;
      const newBalance = currentBalance + deposit.amount;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [coinField]: newBalance })
        .eq('id', deposit.user_id);

      if (updateError) throw new Error('Failed to update user balance');

      // Update deposit status
      const { error: depositError } = await supabase
        .from('deposit_history')
        .update({ 
          status: 'Completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', deposit.id);

      if (depositError) throw new Error('Failed to update deposit status');

      addToast(`Deposit approved successfully`, 'success');
      fetchData();
    } catch (error) {
      console.error('Error approving deposit:', error);
      addToast(error.message || 'Failed to approve deposit', 'error');
    } finally {
      setSaving(false);
      setConfirmAction(null);
    }
  }

  // Reject deposit
  async function handleRejectDeposit(deposit) {
    setSaving(true);
    try {
      const { error: depositError } = await supabase
        .from('deposit_history')
        .update({ 
          status: 'Failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', deposit.id);

      if (depositError) throw new Error('Failed to reject deposit');

      addToast(`Deposit rejected successfully`, 'success');
      fetchData();
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      addToast(error.message || 'Failed to reject deposit', 'error');
    } finally {
      setSaving(false);
      setConfirmAction(null);
    }
  }

  async function handleConfirmedAction() {
    if (!confirmAction) return;
    const { type, deposit } = confirmAction;
    
    if (type === 'approve') {
      await handleApproveDeposit(deposit);
    } else if (type === 'reject') {
      await handleRejectDeposit(deposit);
    }
  }

  function handleExport() {
    const exportData = filteredDeposits.map(d => ({
      'ID': d.id,
      'User': d.userEmail,
      'Coin': d.coin,
      'Network': d.network,
      'Amount': d.amount,
      'Status': d.status,
      'Date': new Date(d.created_at).toLocaleString(),
      'Tx Hash': d.tx_hash || 'N/A',
    }));
    exportToCsv('deposits.csv', exportData);
  }

  const confirmCopy = {
    approve: {
      title: 'Approve this deposit?',
      message: 'Funds will be credited to the user\'s balance.',
      confirmLabel: 'Approve',
      variant: 'primary',
    },
    reject: {
      title: 'Reject this deposit?',
      message: 'The user will be notified that their deposit was rejected.',
      confirmLabel: 'Reject',
      variant: 'danger',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Deposits</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage incoming user deposits.
          </p>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by user, email, or tx hash..."
          className="flex-1"
        />
        <Dropdown
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
          className="w-full sm:w-48"
        />
      </div>

      <DepositTable
        deposits={paginatedItems}
        loading={loading}
        onView={setDetailsDeposit}
        onApprove={(deposit) => setConfirmAction({ type: 'approve', deposit })}
        onReject={(deposit) => setConfirmAction({ type: 'reject', deposit })}
      />

      {!loading && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={goToPage}
        />
      )}

      <DepositDetailsModal
        open={Boolean(detailsDeposit)}
        onClose={() => setDetailsDeposit(null)}
        deposit={detailsDeposit}
      />

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmedAction}
        loading={saving}
        {...(confirmAction ? confirmCopy[confirmAction.type] : {})}
      />
    </div>
  );
}
