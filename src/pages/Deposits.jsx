import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { usePagination } from '../hooks/usePagination';
import { useToast } from '../components/common/Toast.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import Dropdown from '../components/common/Dropdown.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import DepositTable from '../components/deposits/DepositTable.jsx';
import DepositDetailsModal from '../components/deposits/DepositDetailsModal.jsx';
import * as depositService from '../services/depositService';
import { searchFilter, filterByStatus, exportToCsv } from '../utils/helpers';
import { TRANSACTION_STATUS } from '../utils/constants';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  ...Object.values(TRANSACTION_STATUS).map((s) => ({ label: s, value: s })),
];

export default function Deposits() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [detailsDeposit, setDetailsDeposit] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'approve'|'reject', deposit }
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();

  const { data, loading, refetch } = useApi(() => depositService.getDeposits(), []);
  const allDeposits = data?.items || [];

  const filteredDeposits = useMemo(() => {
    let result = searchFilter(allDeposits, search, ['userName', 'userEmail', 'id', 'txHash']);
    result = filterByStatus(result, status);
    return result;
  }, [allDeposits, search, status]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredDeposits);

  async function handleConfirmedAction() {
    if (!confirmAction) return;
    const { type, deposit } = confirmAction;
    setSaving(true);
    try {
      if (type === 'approve') await depositService.approveDeposit(deposit.id);
      if (type === 'reject') await depositService.rejectDeposit(deposit.id);
      addToast(`Deposit ${type}d successfully`, 'success');
      setConfirmAction(null);
      refetch();
    } catch (err) {
      addToast(err.message || `Failed to ${type} deposit`, 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    exportToCsv('deposits.csv', filteredDeposits);
  }

  const confirmCopy = {
    approve: {
      title: 'Approve this deposit?',
      message: 'Funds will be credited to the user\u2019s balance.',
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
