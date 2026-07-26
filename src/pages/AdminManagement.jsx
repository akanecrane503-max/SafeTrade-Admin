import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
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

// NOTE: gate this page/route behind a "current admin is main_admin" check
// once real auth roles are wired up — creation should be Main Admin only.
export default function AdminManagement() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [confirmAdmin, setConfirmAdmin] = useState(null);
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();
  const { data, loading, refetch } = useApi(() => adminService.getAdmins(), []);
  const allAdmins = data?.items || [];

  const filteredAdmins = useMemo(() => {
    let result = searchFilter(allAdmins, search, ['name', 'username', 'email']);
    if (role !== 'all') result = result.filter((a) => a.role === role);
    return result;
  }, [allAdmins, search, role]);

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
    </div>
  );
}
