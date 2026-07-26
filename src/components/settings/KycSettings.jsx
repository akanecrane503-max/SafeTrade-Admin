import { ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '../common/Toast.jsx';
import Dropdown from '../common/Dropdown.jsx';
import * as systemService from '../../services/systemService';

const LEVEL_OPTIONS = [
  { label: 'Basic (email + phone)', value: 'basic' },
  { label: 'Standard (ID document)', value: 'standard' },
  { label: 'Full (ID + proof of address)', value: 'full' },
];

export default function KycSettings({ settings, onRefetch }) {
  const [form, setForm] = useState({
    kycRequired: false,
    kycLevel: 'standard',
    autoApproveBelow: '',
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (settings) {
      setForm({
        kycRequired: Boolean(settings.kycRequired),
        kycLevel: settings.kycLevel || 'standard',
        autoApproveBelow: settings.autoApproveBelow ?? '',
      });
    }
  }, [settings]);

  async function handleSave() {
    setSaving(true);
    try {
      await systemService.updateSystemSettings({
        ...settings,
        kycRequired: form.kycRequired,
        kycLevel: form.kycLevel,
        autoApproveBelow: form.autoApproveBelow === '' ? null : Number(form.autoApproveBelow),
      });
      addToast('KYC settings updated successfully', 'success');
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Failed to update KYC settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">KYC Verification</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control identity verification requirements for users.
            </p>
          </div>
        </div>
        <button
          onClick={() => setForm((f) => ({ ...f, kycRequired: !f.kycRequired }))}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            form.kycRequired ? 'bg-blue-600' : 'bg-slate-700'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              form.kycRequired ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Required verification level
          </label>
          <div className="w-full sm:w-64">
            <Dropdown
              options={LEVEL_OPTIONS}
              value={form.kycLevel}
              onChange={(value) => setForm((f) => ({ ...f, kycLevel: value }))}
              disabled={!form.kycRequired}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Auto-approve withdrawals below (USDT)
          </label>
          <input
            type="number"
            min="0"
            value={form.autoApproveBelow}
            onChange={(e) => setForm((f) => ({ ...f, autoApproveBelow: e.target.value }))}
            placeholder="e.g. 100 — leave blank to disable"
            className="input-base w-full sm:w-64"
            disabled={!form.kycRequired}
          />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary mt-4">
        {saving ? 'Saving...' : 'Save KYC Settings'}
      </button>
    </div>
  );
}
