import { useState, useEffect } from 'react';
import { useToast } from '../common/Toast.jsx';
import * as systemService from '../../services/systemService';

export default function BannerEditor({ banner, onRefetch }) {
  const [form, setForm] = useState({ text: '', enabled: false });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (banner) {
      setForm({ text: banner.text || '', enabled: Boolean(banner.enabled) });
    }
  }, [banner]);

  async function handleSave() {
    setSaving(true);
    try {
      await systemService.updateBanner(form);
      addToast('Banner updated successfully', 'success');
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Failed to update banner', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Website Banner</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            A dismissible strip shown at the top of the user-facing site.
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
        rows={2}
        placeholder="e.g. Scheduled maintenance on Aug 3rd, 02:00–04:00 UTC"
        className="input-base w-full resize-none mb-4"
      />

      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : 'Save Banner'}
      </button>
    </div>
  );
}
