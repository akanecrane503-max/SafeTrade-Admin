import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { usePagination } from '../hooks/usePagination';
import { useToast } from '../components/common/Toast.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import Dropdown from '../components/common/Dropdown.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import TradesTable from '../components/trades/TradesTable.jsx';
import TradeDetailsModal from '../components/trades/TradeDetailsModal.jsx';
import * as tradeService from '../services/tradeService';
import { searchFilter, filterByStatus, exportToCsv } from '../utils/helpers';
import { TRADE_STATUS } from '../utils/constants';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  ...Object.values(TRADE_STATUS).map((s) => ({ label: s, value: s })),
];

export default function Trades() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [detailsTrade, setDetailsTrade] = useState(null);
  const [confirmTrade, setConfirmTrade] = useState(null);
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();

  const { data, loading, refetch } = useApi(() => tradeService.getTrades(), []);
  const allTrades = data?.items || [];

  const filteredTrades = useMemo(() => {
    let result = searchFilter(allTrades, search, ['userName', 'userEmail', 'id', 'pair']);
    result = filterByStatus(result, status);
    return result;
  }, [allTrades, search, status]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredTrades);

  async function handleConfirmClose() {
    if (!confirmTrade) return;
    setSaving(true);
    try {
      await tradeService.closeTrade(confirmTrade.id);
      addToast('Trade closed successfully', 'success');
      setConfirmTrade(null);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to close trade', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    exportToCsv('trades.csv', filteredTrades);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Trades</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor open and closed positions across the platform.
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
          placeholder="Search by user, email, or pair..."
          className="flex-1"
        />
        <Dropdown
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
          className="w-full sm:w-48"
        />
      </div>

      <TradesTable
        trades={paginatedItems}
        loading={loading}
        onView={setDetailsTrade}
        onClose={setConfirmTrade}
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

      <TradeDetailsModal
        open={Boolean(detailsTrade)}
        onClose={() => setDetailsTrade(null)}
        trade={detailsTrade}
      />

      <ConfirmDialog
        open={Boolean(confirmTrade)}
        onClose={() => setConfirmTrade(null)}
        onConfirm={handleConfirmClose}
        loading={saving}
        title="Force close this trade?"
        message="The position will be closed immediately at the current market price."
        confirmLabel="Close Trade"
        variant="danger"
      />
    </div>
  );
}
