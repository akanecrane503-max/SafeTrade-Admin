import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import Dropdown from '../common/Dropdown.jsx';
import { USER_ROLES, USER_STATUS } from '../../utils/constants';
import { updateUserTradeMode, updateUserAsset } from '../../services/userService';

const ROLE_OPTIONS = Object.values(USER_ROLES).map((r) => ({
  label: r.replace('_', ' '),
  value: r,
}));

const STATUS_OPTIONS = Object.values(USER_STATUS).map((s) => ({
  label: s,
  value: s,
}));

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
    tradeMode: 'neutral',
    usdtBalance: 0, // New state for USDT
  });

  const [savingTradeMode, setSavingTradeMode] = useState(false);
  const [savingBalance, setSavingBalance] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'admin',
        status: user.status || 'active',
        tradeMode: user.tradeMode || 'neutral',
        usdtBalance: user.usdt || 0, // Load existing USDT
      });
    }
  }, [user]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // --- UPDATE TRADE MODE (Auto-Win / Lose) ---
  async function handleTradeModeChange(value) {
    handleChange('tradeMode', value);
    setSavingTradeMode(true);
    try {
      if (user && user.id) {
        await updateUserTradeMode(user.id, value);
        if (onSave) onSave(user.id, { ...form, tradeMode: value });
      }
    } catch (error) {
      console.error("Failed to update trade mode:", error);
      handleChange('tradeMode', user.tradeMode || 'neutral');
    } finally {
      setSavingTradeMode(false);
    }
  }

  // --- UPDATE USDT BALANCE (Instant connection to Safetradex) ---
  async function handleBalanceUpdate() {
    if (!user || !user.id) return;
    setSavingBalance(true);
    try {
      // Update the USDT balance in Supabase using your existing service
      await updateUserAsset(user.id, 'USDT', Number(form.usdtBalance));
      
      // If the parent needs to know
      if (onSave) onSave(user.id, { ...form, usdtBalance: form.usdtBalance });

    } catch (error) {
      console.error("Failed to update balance:", error);
    } finally {
      setSavingBalance(false);
    }
  }

  // --- SAVE ALL CHANGES ---
  function handleSubmit(e) {
    e.preventDefault();
    // Save standard profile info (Name, Email, Role, Status)
    onSave(user.id, form);
  }

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit User Profile & Balances"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary" disabled={saving || savingTradeMode || savingBalance}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary" disabled={saving || savingTradeMode || savingBalance}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* --- BASIC INFO --- */}
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

        {/* --- CONNECTED SAFETRADEX WALLET & TRADE MODE --- */}
        <div className="pt-4 mt-2 border-t border-slate-700/50 space-y-4">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Safetradex Wallet & Trading</h4>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              USDT Balance <span className="text-xs text-slate-500 font-normal">(Live Sync)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                value={form.usdtBalance}
                onChange={(e) => handleChange('usdtBalance', parseFloat(e.target.value) || 0)}
                className="input-base w-full"
              />
              <button 
                type="button"
                onClick={handleBalanceUpdate}
                disabled={savingBalance}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {savingBalance ? 'Syncing...' : 'Sync Wallet'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Click "Sync Wallet" to instantly update this user's USDT balance on the Safetradex mobile app.
            </p>
          </div>

          <div>
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
              {form.tradeMode === 'neutral' && 'Trades will settle based on market price.'}
              {form.tradeMode === 'win' && '⚠️ This user will WIN every trade on Safetradex.'}
              {form.tradeMode === 'lose' && '⚠️ This user will LOSE every trade on Safetradex.'}
            </p>
          </div>
        </div>

      </form>
    </Modal>
  );
}
