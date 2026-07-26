import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import Dropdown from '../common/Dropdown.jsx';
import { ADMIN_ROLES } from '../../utils/constants';

const ROLE_OPTIONS = Object.values(ADMIN_ROLES).map((r) => ({
  label: r.replace('_', ' '),
  value: r,
}));

const emptyForm = {
  name: '',
  username: '',
  email: '',
  role: 'support_admin',
  password: '',
};

// Handles both create (admin = null) and edit (admin passed in) modes.
export default function AdminFormModal({ open, onClose, admin, onSave, saving }) {
  const [form, setForm] = useState(emptyForm);
  const isEdit = Boolean(admin);

  useEffect(() => {
    if (admin) {
      setForm({
        name: admin.name || '',
        username: admin.username || '',
        email: admin.email || '',
        role: admin.role || 'support_admin',
        password: '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [admin, open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    onSave(admin?.id, payload);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Administrator' : 'Create Administrator'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary" disabled={saving}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create Admin'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input-base w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="input-base w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
            <Dropdown
              options={ROLE_OPTIONS}
              value={form.role}
              onChange={(value) => handleChange('role', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="input-base w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {isEdit ? 'New password (leave blank to keep current)' : 'Password'}
          </label>
          <input
            type="password"
            required={!isEdit}
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="input-base w-full"
            placeholder={isEdit ? '••••••••' : ''}
          />
        </div>
      </form>
    </Modal>
  );
}
