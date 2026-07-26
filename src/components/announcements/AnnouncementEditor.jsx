import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import Dropdown from '../common/Dropdown.jsx';

const PRIORITY_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Important', value: 'important' },
  { label: 'Critical', value: 'critical' },
];

const AUDIENCE_OPTIONS = [
  { label: 'All users', value: 'all_users' },
  { label: 'Verified users', value: 'verified_users' },
  { label: 'Admins only', value: 'admins_only' },
];

const emptyForm = {
  title: '',
  body: '',
  priority: 'normal',
  audience: 'all_users',
  published: false,
};

export default function AnnouncementEditor({ open, onClose, announcement, onSave, saving }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (announcement) {
      setForm({
        title: announcement.title || '',
        body: announcement.body || '',
        priority: announcement.priority || 'normal',
        audience: announcement.audience || 'all_users',
        published: Boolean(announcement.published),
      });
    } else {
      setForm(emptyForm);
    }
  }, [announcement, open]);

  function handleSubmit() {
    onSave(announcement?.id, form);
  }

  return (
    <Modal open={open} onClose={onClose} title={announcement ? 'Edit Announcement' : 'New Announcement'}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Announcement title"
            className="input-base w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Body</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={4}
            placeholder="Write the announcement content..."
            className="input-base w-full resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Priority</label>
            <Dropdown
              options={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={(value) => setForm((f) => ({ ...f, priority: value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Audience</label>
            <Dropdown
              options={AUDIENCE_OPTIONS}
              value={form.audience}
              onChange={(value) => setForm((f) => ({ ...f, audience: value }))}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
          <span className="text-sm text-slate-300">Publish immediately</span>
          <button
            onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
              form.published ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                form.published ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Announcement'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
