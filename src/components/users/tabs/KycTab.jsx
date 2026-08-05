import { useState, useEffect } from 'react';
import { BadgeCheck, X } from 'lucide-react';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import { useToast } from '../../common/Toast.jsx';
import { supabase } from '../../../lib/supabase';

export default function KycTab({ user, onRefetch }) {
  const [confirmType, setConfirmType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    let active = true;

    async function loadSubmission() {
      setLoadingSubmission(true);
      const { data } = await supabase
        .from('kyc_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;
      setSubmission(data);
      setLoadingSubmission(false);
    }

    loadSubmission();
    return () => {
      active = false;
    };
  }, [user.id]);

  const status = submission?.status || 'not_submitted';

  async function handleConfirm() {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .update({
          status: confirmType === 'approve' ? 'approved' : 'denied',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      if (error) throw new Error(error.message);

      addToast(`KYC ${confirmType === 'approve' ? 'approved' : 'denied'}`, 'success');
      setConfirmType(null);
      setSubmission((prev) => ({ ...prev, status: confirmType === 'approve' ? 'approved' : 'denied' }));
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loadingSubmission) {
    return (
      <div className="card p-5">
        <p className="text-sm text-slate-500">Loading KYC submission...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-200">KYC Verification</h3>
          <StatusBadge status="not_submitted" />
        </div>
        <p className="text-sm text-slate-500">This user hasn't submitted KYC documents yet.</p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-200">KYC Verification</h3>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Full Name</label>
          <p className="text-slate-200">{submission.full_name}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Document Type</label>
          <p className="text-slate-200 capitalize">{submission.document_type}</p>
        </div>
        {submission.id_number && (
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-500 block mb-1">ID / Passport Number</label>
            <p className="text-slate-200 font-mono">{submission.id_number}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <PhotoCard 
          label="ID Front" 
          url={submission.id_front_url}
        />
        <PhotoCard 
          label="ID Back" 
          url={submission.id_back_url}
        />
        <PhotoCard 
          label="Handheld" 
          url={submission.handheld_photo_url}
        />
      </div>

      {status === 'pending' ? (
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmType('approve')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <BadgeCheck className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => setConfirmType('deny')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <X className="w-4 h-4" />
            Deny
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          This user's KYC has already been {status}.
        </p>
      )}

      <ConfirmDialog
        open={Boolean(confirmType)}
        onClose={() => setConfirmType(null)}
        onConfirm={handleConfirm}
        loading={loading}
        title={confirmType === 'approve' ? 'Approve this KYC?' : 'Deny this KYC?'}
        message={
          confirmType === 'approve'
            ? 'The user will be marked as verified.'
            : 'The user will need to resubmit their KYC documents.'
        }
        confirmLabel={confirmType === 'approve' ? 'Approve' : 'Deny'}
        variant={confirmType === 'approve' ? 'primary' : 'danger'}
      />
    </div>
  );
}

// ─── PHOTO CARD COMPONENT ───
function PhotoCard({ label, url }) {
  const [imgError, setImgError] = useState(false);
  const [finalUrl, setFinalUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      setFinalUrl(null);
      return;
    }

    async function getImageUrl() {
      try {
        // If URL is already a full URL, use it
        if (url.startsWith('http')) {
          setFinalUrl(url);
          return;
        }

        // If it's a file path, construct the public URL
        const bucketName = 'kyc-documents';
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(url);
        
        setFinalUrl(data?.publicUrl || url);
      } catch (err) {
        console.error('Error getting image URL:', err);
        setFinalUrl(url);
      }
    }

    getImageUrl();
  }, [url]);

  // Reset states when URL changes
  useEffect(() => {
    setImgError(false);
    setIsLoading(true);
  }, [finalUrl]);

  if (!finalUrl) {
    return (
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1.5">{label}</label>
        <div className="w-full aspect-[4/3] rounded-lg border border-slate-800 bg-slate-900 flex flex-col items-center justify-center text-xs text-slate-600 gap-2">
          <span className="text-2xl">📷</span>
          <span>No image</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-medium text-slate-500 block mb-1.5">{label}</label>
      <div className="w-full aspect-[4/3] rounded-lg border border-slate-800 bg-slate-900 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-600 gap-2 bg-slate-900/80">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        )}
        
        {!imgError ? (
          <img
            src={finalUrl}
            alt={label}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setImgError(true);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-600 gap-2 bg-slate-900">
            <span className="text-2xl">⚠️</span>
            <span>Failed to load</span>
            <a 
              href={finalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs underline"
            >
              Open directly
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
