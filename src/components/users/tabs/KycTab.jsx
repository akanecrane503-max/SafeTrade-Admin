import { useState, useEffect } from 'react';
import { BadgeCheck, X, Eye, Download } from 'lucide-react';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import { useToast } from '../../common/Toast.jsx';
import { supabase } from '../../../lib/supabase';

export default function KycTab({ user, onRefetch }) {
  const [confirmType, setConfirmType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [photoUrls, setPhotoUrls] = useState({});
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

      if (data) {
        // Get signed URLs for all photos
        const urls = await getSignedUrls(data);
        if (active) {
          setPhotoUrls(urls);
        }
      }
      setLoadingSubmission(false);
    }

    loadSubmission();
    return () => {
      active = false;
    };
  }, [user.id]);

  // ─── FUNCTION TO GET SIGNED URLS ───
  async function getSignedUrls(data) {
    const result = {
      idFront: null,
      idBack: null,
      handheld: null,
    };

    const filePaths = {
      idFront: data.id_front_url,
      idBack: data.id_back_url,
      handheld: data.handheld_photo_url,
    };

    for (const [key, value] of Object.entries(filePaths)) {
      if (!value) continue;
      
      try {
        // Extract the file path from the URL
        let filePath = value;
        
        // If it's a full URL, extract the path part
        if (value.includes('/kyc-documents/')) {
          const match = value.match(/\/kyc-documents\/([^?]+)/);
          if (match) {
            filePath = match[1];
          } else {
            // Try splitting by the bucket name
            const parts = value.split('/kyc-documents/');
            if (parts.length > 1) {
              filePath = parts[1].split('?')[0];
            }
          }
        }

        // If it's still a full URL, try to get the filename from the end
        if (filePath.includes('http')) {
          const fileName = filePath.split('/').pop().split('?')[0];
          if (fileName) {
            filePath = fileName;
          }
        }

        // Create signed URL
        const { data: signedData, error } = await supabase.storage
          .from('kyc-documents')
          .createSignedUrl(filePath, 3600);

        if (error) {
          console.error(`Error signing ${key}:`, error);
          // Try public URL as fallback
          const { data: publicData } = supabase.storage
            .from('kyc-documents')
            .getPublicUrl(filePath);
          result[key] = publicData?.publicUrl || value;
        } else {
          result[key] = signedData?.signedUrl || value;
        }
      } catch (err) {
        console.error(`Failed to get URL for ${key}:`, err);
        // Fallback: use the original URL
        result[key] = value;
      }
    }

    return result;
  }

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
          url={photoUrls.idFront} 
          filePath={submission.id_front_url}
        />
        <PhotoCard 
          label="ID Back" 
          url={photoUrls.idBack}
          filePath={submission.id_back_url}
        />
        <PhotoCard 
          label="Handheld" 
          url={photoUrls.handheld}
          filePath={submission.handheld_photo_url}
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
function PhotoCard({ label, url, filePath }) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when URL changes
  useEffect(() => {
    setImgError(false);
    setIsLoading(true);
  }, [url]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImgError(true);
  };

  // If no URL or filePath, show empty state
  if (!url && !filePath) {
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

  // Show loading or image
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 block mb-1.5">{label}</label>
      <div className="relative w-full aspect-[4/3] rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-600 gap-2">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        )}
        
        {!imgError && url ? (
          <img
            src={url}
            alt={label}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-600 gap-2">
            <span className="text-2xl">⚠️</span>
            <span>Failed to load</span>
            {filePath && (
              <a 
                href={filePath} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs underline"
              >
                Open directly
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
