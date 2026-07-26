import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import Dropdown from '../common/Dropdown.jsx';

const AUDIENCE_OPTIONS = [
  { label: 'All users', value: 'all' },
  { label: 'Active traders', value: 'traders' },
  { label: 'New users', value: 'new_users' },
];

const PRIORITY_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Important', value: 'important' },
  { label: 'Critical', value: 'critical' },
];

const emptyForm = {
  title: '',
  body: '',
  audience: 'all',
  priority: 'normal',
};

// Handles both create and edit — pass `announcement` for edit mode,
// leave it null/undefined to create a new one.
export default function AnnouncementEditor({ open, onClose, announcement, onSave, saving }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (announcement) {
      setForm({
        title: announcement.title || '',
        body: announcement.body || '',
        audience: announcement.audience || 'all',
        priority: announcement.priority || 'normal',
      });
    } else {
      setForm(emptyForm);
    }
  }, [announcement, open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(announcement?.id, form);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={announcement ? 'Edit Announcement' : 'New Announcement'}
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary" disabled={saving}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : announcement ? 'Save changes' : 'Publish'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g. Scheduled maintenance on Aug 3rd"
            className="input-base w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
          <textarea
            required
            value={form.body}
            onChange={(e) => handleChange('body', e.target.value)}
            rows={6}
            placeholder="Write the announcement content..."
            className="input-base w-full resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Audience</label>
            <Dropdown
              options={AUDIENCE_OPTIONS}
              value={form.audience}
              onChange={(value) => handleChange('audience', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
            <Dropdown
              options={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={(value) => handleChange('priority', value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
