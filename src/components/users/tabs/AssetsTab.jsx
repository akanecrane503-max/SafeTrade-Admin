import { useState, useEffect } from 'react';
import { Pencil, Coins } from 'lucide-react';
import Modal from '../../common/Modal.jsx';
import EmptyState from '../../common/EmptyState.jsx';
import { useToast } from '../../common/Toast.jsx';
import * as userService from '../../../services/userService';
import { formatCrypto, formatCurrency } from '../../../utils/formatters';

// The static list of coins the platform supports
const SUPPORTED_ASSETS = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'USDT', 'USDC'];

export default function AssetsTab({ user, onRefetch }) {
  const [editingAsset, setEditingAsset] = useState(null);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // --- FETCH REAL BALANCES (Triggered whenever the user object changes) ---
  useEffect(() => {
    async function fetchRealBalances() {
      if (!user?.id) return;
      setLoading(true);
      
      try {
        // Fetch the absolute latest data directly from the database
        const freshUserData = await userService.getUserById(user.id);

        if (freshUserData) {
          // Map the data to match your UI
          const realAssets = SUPPORTED_ASSETS.map((coin) => {
            const balance = Number(freshUserData[coin] || 0);
            return {
              coin: coin,
              balance: balance,
              usdValue: 0, 
            };
          });
          setAssets(realAssets);
        }
      } catch (err) {
        console.error("Failed to fetch assets:", err);
        // Do NOT show an error toast here to avoid spamming the admin
      } finally {
        setLoading(false);
      }
    }

    fetchRealBalances();
  }, [user?.id]); // Triggers whenever the user ID changes or is re-fetched

  function openEdit(asset) {
    setEditingAsset(asset);
    setValue(String(asset.balance ?? 0));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateUserAsset(user.id, editingAsset.coin, Number(value));
      addToast(`${editingAsset.coin} balance updated`, 'success');
      setEditingAsset(null);
      
      // Force the Admin Panel to instantly refresh the table
      if (onRefetch) {
        await onRefetch();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update balance', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-5">Assets</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-slate-800/40 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-5">Assets</h3>

      {!assets.length ? (
        <EmptyState icon={Coins} title="No assets" description="This user holds no balances yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-3 py-2 font-medium text-slate-500">Asset</th>
                <th className="px-3 py-2 font-medium text-slate-500">Balance</th>
                <th className="px-3 py-2 font-medium text-slate-500">USD Value</th>
                <th className="px-3 py-2 font-medium text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assets.map((asset) => (
                <tr key={asset.coin}>
                  <td className="px-3 py-2.5 font-medium text-slate-200">{asset.coin}</td>
                  <td className="px-3 py-2.5 text-slate-300">
                    {formatCrypto(asset.balance)} {asset.coin}
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">
                    {formatCurrency(asset.usdValue || 0)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => openEdit(asset)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(editingAsset)}
        onClose={() => setEditingAsset(null)}
        title={`Edit ${editingAsset?.coin} Balance`}
        size="sm"
        footer={
          <>
            <button onClick={() => setEditingAsset(null)} className="btn-secondary" disabled={saving}>
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
            {editingAsset?.coin} Balance
          </label>
          <input
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-base w-full"
            autoFocus
          />
          <p className="text-xs text-slate-500 mt-2">
            This directly updates the user's balance on their Assets page.
          </p>
        </form>
      </Modal>
    </div>
  );
}
