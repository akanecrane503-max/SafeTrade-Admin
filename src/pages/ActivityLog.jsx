import { useState, useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { usePagination } from '../hooks/usePagination';
import SearchBar from '../components/common/SearchBar.jsx';
import Dropdown from '../components/common/Dropdown.jsx';
import Pagination from '../components/common/Pagination.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import * as adminService from '../services/adminService';
import { searchFilter } from '../utils/helpers';
import { formatDateTime } from '../utils/formatters';
import { ADMIN_ACTION_TYPES } from '../utils/constants';

const ACTION_OPTIONS = [
  { label: 'All actions', value: 'all' },
  ...Object.values(ADMIN_ACTION_TYPES).map((a) => ({
    label: a.replace(/_/g, ' '),
    value: a,
  })),
];

export default function ActivityLog() {
  const [search, setSearch] = useState('');
  const [actionType, setActionType] = useState('all');

  const { data, loading } = useApi(() => adminService.getActivityLog(), []);
  const allLogs = data?.items || [];

  const filteredLogs = useMemo(() => {
    let result = searchFilter(allLogs, search, ['adminName', 'target', 'action']);
    if (actionType !== 'all') result = result.filter((l) => l.actionType === actionType);
    return result;
  }, [allLogs, search, actionType]);

  const { paginatedItems, currentPage, totalPages, totalItems, pageSize, goToPage } =
    usePagination(filteredLogs, 25);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Activity Log</h1>
        <p className="text-sm text-slate-500 mt-1">
          A complete record of every administrator action on the platform.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by admin, action, or target..."
          className="flex-1"
        />
        <Dropdown
          options={ACTION_OPTIONS}
          value={actionType}
          onChange={setActionType}
          className="w-full sm:w-56"
        />
      </div>

      {loading ? (
        <div className="card py-16">
          <LoadingSpinner />
        </div>
      ) : !paginatedItems.length ? (
        <div className="card">
          <EmptyState
            icon={ShieldCheck}
            title="No activity found"
            description="Try adjusting your search or filters."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-4 py-3 font-medium text-slate-500">Administrator</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Action</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Target</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedItems.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {log.adminName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-200">{log.adminName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 capitalize">
                      {log.action?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{log.target}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}
