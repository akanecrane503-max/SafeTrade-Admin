import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { usePagination } from '../hooks/usePagination';
import { useToast } from '../components/common/Toast.jsx';
import UserFilters from '../components/users/UserFilters.jsx';
import UserTable from '../components/users/UserTable.jsx';
import UserDetailsModal from '../components/users/UserDetailsModal.jsx';
import EditUserModal from '../components/users/EditUserModal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import Pagination from '../components/common/Pagination.jsx';
import * as userService from '../services/userService';
import { searchFilter, filterByStatus, exportToCsv } from '../utils/helpers';

export default function Users() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [role, setRole] = useState('all');

  const [detailsUser, setDetailsUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'suspend'|'activate'|'delete', user }
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();

  const { data, loading, refetch } = useApi(() => userService.getUsers(), []);
  const allUsers = data?.items || [];

  const filteredUsers = useMemo(() => {
    let result = searchFilter(allUsers, search, ['name', 'email', 'id']);
    result = filterByStatus(result, status);
    if (role !== 'all') {
      result = result.filter((u) => u.role === role);
    }
    return result;
  }, [allUsers, search, status, role]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredUsers);

  async function handleSaveUser(id, payload) {
    setSaving(true);
    try {
      await userService.updateUser(id, payload);
      addToast('User updated successfully', 'success');
      setEditUser(null);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to update user', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmedAction() {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    setSaving(true);
    try {
      if (type === 'suspend') await userService.suspendUser(user.id);
      if (type === 'activate') await userService.activateUser(user.id);
      if (type === 'delete') await userService.deleteUser(user.id);
      addToast(`User ${type}d successfully`, 'success');
      setConfirmAction(null);
      refetch();
    } catch (err) {
      addToast(err.message || `Failed to ${type} user`, 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    exportToCsv('users.csv', filteredUsers);
  }

  const confirmCopy = {
    suspend: {
      title: 'Suspend this user?',
      message: 'They will lose access to their account until reactivated.',
      confirmLabel: 'Suspend',
      variant: 'danger',
    },
    activate: {
      title: 'Activate this user?',
      message: 'They will regain full access to their account.',
      confirmLabel: 'Activate',
      variant: 'primary',
    },
    delete: {
      title: 'Delete this user?',
      message: 'This action is permanent and cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage platform users, roles, and account status.
          </p>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <UserFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        role={role}
        onRoleChange={setRole}
      />

      <UserTable
        users={paginatedItems}
        loading={loading}
        onView={setDetailsUser}
        onEdit={setEditUser}
        onSuspend={(user) => setConfirmAction({ type: 'suspend', user })}
        onActivate={(user) => setConfirmAction({ type: 'activate', user })}
        onDelete={(user) => setConfirmAction({ type: 'delete', user })}
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

      <UserDetailsModal
        open={Boolean(detailsUser)}
        onClose={() => setDetailsUser(null)}
        user={detailsUser}
      />

      <EditUserModal
        open={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        user={editUser}
        onSave={handleSaveUser}
        saving={saving}
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
