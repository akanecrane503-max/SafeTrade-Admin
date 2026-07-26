import { useState } from 'react';
import { Pencil } from 'lucide-react';
import Modal from '../../common/Modal.jsx';
import { useToast } from '../../common/Toast.jsx';
import * as userService from '../../../services/userService';
import { truncateAddress } from '../../../utils/formatters';
import { NETWORKS } from '../../../utils/constants';

export default function WalletsTab({ user, onRefetch }) {
  const [editingNetwork, setEditingNetwork] = useState(null);
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const wallets = user.wallets || {};

  function openEdit(networkValue) {
    setEditingNetwork(networkValue);
    setAddress(wallets[networkValue] || '');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateUserWalletAddress(user.id, editingNetwork, address);
      addToast('Wallet address updated', 'success');
      setEditingNetwork(null);
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Failed to update wallet address', 'error');
    } finally {
      setSaving(false);
    }
  }

  const editingLabel = NETWORKS.find((n) => n.value === editingNetwork)?.label;

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-5">Wallet Addresses</h3>

      <div className="space-y-2">
        {NETWORKS.map((network) => (
          <div
            key={network.value}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200">{network.label}</p>
              <p className="text-xs font-mono text-slate-500 truncate">
                {truncateAddress(wallets[network.value]) || 'Not set'}
              </p>
            </div>
            <button
              onClick={() => openEdit(network.value)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors shrink-0"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(editingNetwork)}
        onClose={() => setEditingNetwork(null)}
        title={`Edit ${editingLabel} Address`}
        footer={
          <>
            <button onClick={() => setEditingNetwork(null)} className="btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {editingLabel} Wallet Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input-base w-full font-mono text-sm"
            autoFocus
          />
        </form>
      </Modal>
    </div>
  );
}
