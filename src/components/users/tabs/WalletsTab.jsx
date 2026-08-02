import { useState } from "react";
import { Pencil } from "lucide-react";
import Modal from "../../common/Modal.jsx";
import { useToast } from "../../common/Toast.jsx";
import * as userService from "../../../services/userService";
import { truncateAddress } from "../../../utils/formatters";

const NETWORKS = [
  { coin: "BTC", network: "bitcoin", label: "Bitcoin" },
  { coin: "ETH", network: "erc20", label: "Ethereum (ERC20)" },
  { coin: "USDT", network: "trc20", label: "USDT (TRC20)" },
  { coin: "USDT", network: "bep20", label: "USDT (BEP20)" },
  { coin: "USDT", network: "erc20-usdt", label: "USDT (ERC20)" },
  { coin: "SOL", network: "solana", label: "Solana" },
  { coin: "XRP", network: "xrpl", label: "Ripple (XRP)" },
  { coin: "DOGE", network: "dogecoin", label: "Dogecoin" },
  { coin: "ADA", network: "cardano", label: "Cardano" },
  { coin: "TRX", network: "tron", label: "TRON" },
];

export default function WalletsTab({ user, onRefetch }) {
  const { addToast } = useToast();
  const [editingWallet, setEditingWallet] = useState(null);
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  function openEdit(wallet) {
    setEditingWallet(wallet);
    setAddress(user.wallets?.[wallet.network] || "");
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!editingWallet) return;
    setSaving(true);
    try {
      await userService.updateUserWalletAddress(
        user.id,
        editingWallet.network,
        address
      );
      addToast(`${editingWallet.label} updated`, "success");
      setEditingWallet(null);
      
      // CRITICAL FIX: Force the parent to reload the user data so the wallet list updates
      if (onRefetch) {
        await onRefetch();
      }
    } catch (err) {
      addToast(err.message || "Unable to save wallet", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <h3 className="mb-5 text-sm font-semibold text-slate-200">
        User Deposit Wallets
      </h3>

      <div className="space-y-3">
        {NETWORKS.map((wallet) => {
          // This pulls the real address from the fresh user data
          const value = user.wallets?.[wallet.network] || "";
          return (
            <div
              key={wallet.network}
              className="flex items-center justify-between rounded-xl bg-slate-800/40 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200">
                  {wallet.label}
                </p>
                <p className="truncate font-mono text-xs text-slate-500">
                  {value ? truncateAddress(value) : "Not assigned"}
                </p>
              </div>
              <button
                onClick={() => openEdit(wallet)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <Modal
        open={Boolean(editingWallet)}
        onClose={() => setEditingWallet(null)}
        title={editingWallet ? `Edit ${editingWallet.label}` : "Edit Wallet"}
        footer={
          <>
            <button
              onClick={() => setEditingWallet(null)}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Wallet Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-base w-full font-mono text-sm"
              placeholder="Enter wallet address"
              autoFocus
            />
          </div>

          {editingWallet?.coin === "XRP" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Destination Tag / Memo
              </label>
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-3 text-xs text-slate-400">
                XRP Memo support will be connected in the next upgrade.
              </div>
            </div>
          )}

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
            <p className="text-xs leading-6 text-slate-400">
              This wallet belongs only to{" "}
              <span className="font-semibold text-white">{user.name}</span>.
              <br />
              After saving, SafeTradeX will automatically display this
              address on this user's Deposit page.
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
