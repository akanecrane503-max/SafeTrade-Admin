import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import Dropdown from '../common/Dropdown.jsx';
import { USER_ROLES, USER_STATUS } from '../../utils/constants';
import { updateUserTradeMode } from '../../services/userService';

const ROLE_OPTIONS = Object.values(USER_ROLES).map((r) => ({
  label: r.replace('_', ' '),
  value: r,
}));

const STATUS_OPTIONS = Object.values(USER_STATUS).map((s) => ({
  label: s,
  value: s,
}));

// New Dropdown Options for Trade Mode
const TRADE_MODE_OPTIONS = [
  { label: 'Neutral (Market / Auto)', value: 'neutral' },
  { label: 'Force Auto-Win', value: 'win' },
  { label: 'Force Auto-Lose', value: 'lose' },
];

export default function EditUserModal({ open, onClose, user, onSave, saving }) {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    role: '', 
    status: '',
    tradeMode: 'neutral' 
  });

  const [savingTradeMode, setSavingTradeMode] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'admin',
        status: user.status || 'active',
        tradeMode: user.tradeMode || 'neutral', // Default to neutral if missing
      });
    }
  }, [user]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleTradeModeChange(value) {
    // Optimistically update the UI
    handleChange('tradeMode', value);
    setSavingTradeMode(true);
    
    try {
      // Update the database immediately via the new service function
      if (user && user.id) {
        await updateUserTradeMode(user.id, value);
        
        // Optional: If your parent component needs to know about the update
        if (onSave) {
          // We don't need to trigger the full onSave here, just the trade mode
          onSave(user.id, { ...form, tradeMode: value });
        }
      }
    } catch (error) {
      console.error("Failed to update trade mode:", error);
      // Revert the dropdown on error
      handleChange('tradeMode', user.tradeMode || 'neutral');
    } finally {
      setSavingTradeMode(false);
    }
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
          <button onClick={onClose} className="btn-secondary" disabled={saving || savingTradeMode}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary" disabled={saving || savingTradeMode}>
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

        {/* --- NEW AUTO WIN / LOSE SECTION --- */}
        <div className="pt-4 mt-2 border-t border-slate-700/50">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Trade Settlement Mode
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Dropdown
                options={TRADE_MODE_OPTIONS}
                value={form.tradeMode}
                onChange={handleTradeModeChange}
                disabled={savingTradeMode}
              />
            </div>
            {savingTradeMode && (
              <span className="text-xs text-blue-400 animate-pulse">Updating...</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            {form.tradeMode === 'neutral' && 'Trades will settle normally based on market price.'}
            {form.tradeMode === 'win' && '⚠️ All trades placed by this user will automatically WIN.'}
            {form.tradeMode === 'lose' && '⚠️ All trades placed by this user will automatically LOSE.'}
          </p>
        </div>
      </form>
    </Modal>
  );
}
