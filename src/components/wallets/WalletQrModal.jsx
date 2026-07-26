import { useState } from 'react';
import { Upload, QrCode as QrCodeIcon } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import { useToast } from '../common/Toast.jsx';
import * as walletService from '../../services/walletService';

export default function WalletQrModal({ open, onClose, wallet, onRefetch }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleUpload() {
    if (!file || !wallet) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('qrCode', file);
      await walletService.uploadWalletQr(wallet.id, formData);
      addToast('QR code uploaded successfully', 'success');
      setFile(null);
      setPreview(null);
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Failed to upload QR code', 'error');
    } finally {
      setUploading(false);
    }
  }

  if (!wallet) return null;

  const displayQr = preview || wallet.qrCodeUrl;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${wallet.coin} QR Code`}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          {file && (
            <button onClick={handleUpload} disabled={uploading} className="btn-primary">
              {uploading ? 'Uploading...' : 'Save QR Code'}
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-col items-center">
        <div className="w-48 h-48 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-center overflow-hidden mb-4">
          {displayQr ? (
            <img src={displayQr} alt={`${wallet.coin} QR code`} className="w-full h-full object-contain" />
          ) : (
            <QrCodeIcon className="w-12 h-12 text-slate-600" />
          )}
        </div>

        <label className="btn-secondary flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" />
          {wallet.qrCodeUrl ? 'Replace QR Code' : 'Upload QR Code'}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
    </Modal>
  );
}
