import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import Dropdown from '../common/Dropdown.jsx';
import { USER_ROLES, USER_STATUS } from '../../utils/constants';

const ROLE_OPTIONS = Object.values(USER_ROLES).map((r) => ({
  label: r.replace('_', ' '),
  value: r,
}));

const STATUS_OPTIONS = Object.values(USER_STATUS).map((s) => ({
  label: s,
  value: s,
}));

export default function EditUserModal({ open, onClose, user, onSave, saving }) {
  const [form, setForm] = useState({ name: '', email: '', role: '', status: '' });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'admin',
        status: user.status || 'active',
      });
    }
  }, [user]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(user.id, form);
  }

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit User"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary" disabled={saving}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input-base w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="input-base w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
            <Dropdown
              options={ROLE_OPTIONS}
              value={form.role}
              onChange={(value) => handleChange('role', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
            <Dropdown
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={(value) => handleChange('status', value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
