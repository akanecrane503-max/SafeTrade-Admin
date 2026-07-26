import { useState, useEffect } from 'react';
import { useToast } from '../common/Toast.jsx';
import Dropdown from '../common/Dropdown.jsx';
import * as systemService from '../../services/systemService';

const PRIORITY_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Important', value: 'important' },
  { label: 'Critical', value: 'critical' },
];

export default function AnnouncementEditorPanel({ announcement, onRefetch }) {
  const [form, setForm] = useState({ text: '', priority: 'normal', enabled: false });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (announcement) {
      setForm({
        text: announcement.text || '',
        priority: announcement.priority || 'normal',
        enabled: Boolean(announcement.enabled),
      });
    }
  }, [announcement]);

  async function handleSave() {
    setSaving(true);
    try {
      await systemService.updateSystemAnnouncement(form);
      addToast('Site announcement updated successfully', 'success');
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Failed to update announcement', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Site-wide Announcement</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Shown to all users across the platform until dismissed or disabled.
          </p>
        </div>
        <button
          onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            form.enabled ? 'bg-blue-600' : 'bg-slate-700'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              form.enabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      <textarea
        value={form.text}
        onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
        rows={3}
        placeholder="Write the site-wide announcement..."
        className="input-base w-full resize-none mb-4"
      />

      <div className="flex items-center gap-3">
        <div className="w-44">
          <Dropdown
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(value) => setForm((f) => ({ ...f, priority: value }))}
          />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Announcement'}
        </button>
      </div>
    </div>
  );
}
