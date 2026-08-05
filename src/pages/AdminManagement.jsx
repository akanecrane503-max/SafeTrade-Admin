import { useState, useMemo } from 'react';
import { Plus, UserPlus, Check, X, Clock } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { usePagination } from '../hooks/usePagination';
import { useToast } from '../components/common/Toast.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import Dropdown from '../components/common/Dropdown.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import AdminTable from '../components/admin/AdminTable.jsx';
import AdminFormModal from '../components/admin/AdminFormModal.jsx';
import * as adminService from '../services/adminService';
import { searchFilter } from '../utils/helpers';
import { ADMIN_ROLES } from '../utils/constants';

const ROLE_OPTIONS = [
  { label: 'All roles', value: 'all' },
  ...Object.values(ADMIN_ROLES).map((r) => ({ label: r.replace('_', ' '), value: r })),
];

function PendingAccessRequests({ requests, onApprove, onReject }) {
  if (requests.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <UserPlus className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">
            Pending Access Requests
            <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
              {requests.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Approving grants immediate dashboard access. Rejecting blocks sign-in.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/60 border border-slate-700 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{req.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{req.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 mr-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(req.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => onApprove(req.id)}
                className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors"
                title="Approve"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReject(req.id)}
                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
                title="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminManagement() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [confirmAdmin, setConfirmAdmin] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();
  const { data, loading, refetch } = useApi(() => adminService.getAdmins(), []);
  const allAdmins = data?.items || [];

  const pendingRequests = useMemo(
    () =>
      allAdmins
        .filter((a) => a.status === 'pending')
        .map((a) => ({ id: a.id, fullName: a.name, email: a.email, createdAt: a.createdAt })),
    [allAdmins]
  );

  const rosterAdmins = useMemo(() => allAdmins.filter((a) => a.status !== 'pending'), [allAdmins]);

  const filteredAdmins = useMemo(() => {
    let result = searchFilter(rosterAdmins, search, ['name', 'username', 'email']);
    if (role !== 'all') result = result.filter((a) => a.role === role);
    return result;
  }, [rosterAdmins, search, role]);

  const { paginatedItems, currentPage, totalPages, totalItems, pageSize, goToPage } =
    usePagination(filteredAdmins);

  function openCreate() {
    setEditingAdmin(null);
    setFormOpen(true);
  }

  function openEdit(admin) {
    setEditingAdmin(admin);
    setFormOpen(true);
  }

  async function handleSave(id, payload) {
    setSaving(true);
    try {
      if (id) {
        await adminService.updateAdmin(id, payload);
        addToast('Administrator updated successfully', 'success');
      } else {
        await adminService.createAdmin(payload);
        addToast('Administrator created successfully', 'success');
      }
      setFormOpen(false);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to save administrator', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmToggle() {
    if (!confirmAdmin) return;
    setSaving(true);
    try {
      await adminService.toggleAdminStatus(confirmAdmin.id, confirmAdmin.status !== 'active');
      addToast(
        `Administrator ${confirmAdmin.status === 'active' ? 'suspended' : 'activated'}`,
        'success'
      );
      setConfirmAdmin(null);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to update administrator', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await adminService.deleteAdmin(deleteTarget.id);
      addToast('Administrator removed', 'success');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to remove administrator', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleApproveRequest(id) {
    try {
      await adminService.approvePendingAdmin(id);
      addToast('Administrator approved', 'success');
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to approve administrator', 'error');
    }
  }

  async function handleRejectRequest(id) {
    try {
      await adminService.rejectPendingAdmin(id);
      addToast('Administrator request rejected', 'success');
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to reject administrator', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage administrator accounts, roles, and access.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Administrator
        </button>
      </div>

      <PendingAccessRequests
        requests={pendingRequests}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, username, or email..."
          className="flex-1"
        />
        <Dropdown
          options={ROLE_OPTIONS}
          value={role}
          onChange={setRole}
          className="w-full sm:w-48"
        />
      </div>

      <AdminTable
        admins={paginatedItems}
        loading={loading}
        onEdit={openEdit}
        onToggle={setConfirmAdmin}
        onDelete={setDeleteTarget}
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

      <AdminFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        admin={editingAdmin}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={Boolean(confirmAdmin)}
        onClose={() => setConfirmAdmin(null)}
        onConfirm={handleConfirmToggle}
        loading={saving}
        title={`${confirmAdmin?.status === 'active' ? 'Suspend' : 'Activate'} this administrator?`}
        message={
          confirmAdmin?.status === 'active'
            ? 'They will immediately lose access to the admin panel.'
            : 'They will regain access to the admin panel.'
        }
        confirmLabel={confirmAdmin?.status === 'active' ? 'Suspend' : 'Activate'}
        variant={confirmAdmin?.status === 'active' ? 'danger' : 'primary'}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={saving}
        title="Remove this administrator?"
        message="This permanently deletes their admin account. They will need to request access again to regain entry."
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}
