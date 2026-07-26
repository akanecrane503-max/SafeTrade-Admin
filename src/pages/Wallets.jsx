import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/common/Toast.jsx';
import WalletCard from '../components/wallets/WalletCard.jsx';
import WalletEditorModal from '../components/wallets/WalletEditorModal.jsx';
import WalletQrModal from '../components/wallets/WalletQrModal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import * as walletService from '../services/walletService';

export default function Wallets() {
  const [editWallet, setEditWallet] = useState(null);
  const [qrWallet, setQrWallet] = useState(null);
  const [confirmWallet, setConfirmWallet] = useState(null);
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();
  const { data, loading, refetch } = useApi(() => walletService.getWallets(), []);
  const wallets = data?.items || [];

  async function handleSaveWallet(id, payload) {
    setSaving(true);
    try {
      await walletService.updateWallet(id, payload);
      addToast('Wallet updated successfully', 'success');
      setEditWallet(null);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to update wallet', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmToggle() {
    if (!confirmWallet) return;
    setSaving(true);
    try {
      await walletService.toggleWalletStatus(confirmWallet.id, !confirmWallet.enabled);
      addToast(
        `Wallet ${confirmWallet.enabled ? 'disabled' : 'enabled'} successfully`,
        'success'
      );
      setConfirmWallet(null);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to update wallet status', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Wallet Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure hot wallets, withdrawal limits, network fees, and QR codes.
        </p>
      </div>

      {loading ? (
        <div className="card py-16">
          <LoadingSpinner />
        </div>
      ) : !wallets.length ? (
        <div className="card">
          <EmptyState title="No wallets configured" description="Add a wallet to get started." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onEdit={setEditWallet}
              onToggle={setConfirmWallet}
              onViewQr={setQrWallet}
            />
          ))}
        </div>
      )}

      <WalletEditorModal
        open={Boolean(editWallet)}
        onClose={() => setEditWallet(null)}
        wallet={editWallet}
        onSave={handleSaveWallet}
        saving={saving}
      />

      <WalletQrModal
        open={Boolean(qrWallet)}
        onClose={() => setQrWallet(null)}
        wallet={qrWallet}
        onRefetch={refetch}
      />

      <ConfirmDialog
        open={Boolean(confirmWallet)}
        onClose={() => setConfirmWallet(null)}
        onConfirm={handleConfirmToggle}
        loading={saving}
        title={`${confirmWallet?.enabled ? 'Disable' : 'Enable'} this wallet?`}
        message={
          confirmWallet?.enabled
            ? 'Users will no longer be able to deposit or withdraw via this wallet.'
            : 'This wallet will become available for deposits and withdrawals.'
        }
        confirmLabel={confirmWallet?.enabled ? 'Disable' : 'Enable'}
        variant={confirmWallet?.enabled ? 'danger' : 'primary'}
      />
    </div>
  );
}
