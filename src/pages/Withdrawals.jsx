import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { usePagination } from '../hooks/usePagination';
import { useToast } from '../components/common/Toast.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import Dropdown from '../components/common/Dropdown.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import WithdrawalTable from '../components/withdrawals/WithdrawalTable.jsx';
import WithdrawalDetailsModal from '../components/withdrawals/WithdrawalDetailsModal.jsx';
import * as withdrawalService from '../services/withdrawalService';
import { searchFilter, filterByStatus, exportToCsv } from '../utils/helpers';
import { TRANSACTION_STATUS } from '../utils/constants';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  ...Object.values(TRANSACTION_STATUS).map((s) => ({ label: s, value: s })),
];

export default function Withdrawals() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [detailsWithdrawal, setDetailsWithdrawal] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'approve'|'reject', withdrawal }
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();

  const { data, loading, refetch } = useApi(() => withdrawalService.getWithdrawals(), []);
  const allWithdrawals = data?.items || [];

  const filteredWithdrawals = useMemo(() => {
    let result = searchFilter(allWithdrawals, search, [
      'userName',
      'userEmail',
      'id',
      'destinationWallet',
    ]);
    result = filterByStatus(result, status);
    return result;
  }, [allWithdrawals, search, status]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredWithdrawals);

  async function handleConfirmedAction() {
    if (!confirmAction) return;
    const { type, withdrawal } = confirmAction;
    setSaving(true);
    try {
      if (type === 'approve') await withdrawalService.approveWithdrawal(withdrawal.id);
      if (type === 'reject') await withdrawalService.rejectWithdrawal(withdrawal.id);
      addToast(`Withdrawal ${type}d successfully`, 'success');
      setConfirmAction(null);
      refetch();
    } catch (err) {
      addToast(err.message || `Failed to ${type} withdrawal`, 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    exportToCsv('withdrawals.csv', filteredWithdrawals);
  }

  const confirmCopy = {
    approve: {
      title: 'Approve this withdrawal?',
      message: 'Funds will be sent to the user\u2019s destination wallet.',
      confirmLabel: 'Approve',
      variant: 'primary',
    },
    reject: {
      title: 'Reject this withdrawal?',
      message: 'The user will be notified and funds will remain in their balance.',
      confirmLabel: 'Reject',
      variant: 'danger',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage outgoing user withdrawal requests.
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
          placeholder="Search by user, email, or wallet..."
          className="flex-1"
        />
        <Dropdown
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
          className="w-full sm:w-48"
        />
      </div>

      <WithdrawalTable
        withdrawals={paginatedItems}
        loading={loading}
        onView={setDetailsWithdrawal}
        onApprove={(withdrawal) => setConfirmAction({ type: 'approve', withdrawal })}
        onReject={(withdrawal) => setConfirmAction({ type: 'reject', withdrawal })}
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

      <WithdrawalDetailsModal
        open={Boolean(detailsWithdrawal)}
        onClose={() => setDetailsWithdrawal(null)}
        withdrawal={detailsWithdrawal}
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
