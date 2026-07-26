import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';

export default function WalletEditorModal({ open, onClose, wallet, onSave, saving }) {
  const [form, setForm] = useState({
    address: '',
    minWithdrawal: '',
    withdrawalFee: '',
    network: '',
  });

  useEffect(() => {
    if (wallet) {
      setForm({
        address: wallet.address || '',
        minWithdrawal: wallet.minWithdrawal ?? '',
        withdrawalFee: wallet.withdrawalFee ?? '',
        network: wallet.network || '',
      });
    }
  }, [wallet]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(wallet.id, {
      ...form,
      minWithdrawal: Number(form.minWithdrawal),
      withdrawalFee: Number(form.withdrawalFee),
    });
  }

  if (!wallet) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit ${wallet.coin} Wallet`}
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
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Hot wallet address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="input-base w-full font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Network</label>
          <input
            type="text"
            value={form.network}
            onChange={(e) => handleChange('network', e.target.value)}
            className="input-base w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Min withdrawal
            </label>
            <input
              type="number"
              step="any"
              value={form.minWithdrawal}
              onChange={(e) => handleChange('minWithdrawal', e.target.value)}
              className="input-base w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Withdrawal fee
            </label>
            <input
              type="number"
              step="any"
              value={form.withdrawalFee}
              onChange={(e) => handleChange('withdrawalFee', e.target.value)}
              className="input-base w-full"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
