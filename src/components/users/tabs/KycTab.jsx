import { useState, useEffect } from 'react';
import { BadgeCheck, X } from 'lucide-react';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import { useToast } from '../../common/Toast.jsx';
import { supabase } from '../../../lib/supabase';

// ─── BUCKET NAME ───
const BUCKET_NAME = 'kyc-documents';

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

      // ─── GENERATE SIGNED URLS ───
      if (data) {
        const urls = {};
        
        const fields = {
          idFront: data.id_front_url,
          idBack: data.id_back_url,
          handheld: data.handheld_photo_url
        };

        for (const [key, value] of Object.entries(fields)) {
          if (value) {
            try {
              // If it's already a full URL, use it
              if (value.startsWith('http')) {
                urls[key] = value;
              } else {
                // Create a signed URL (works for private buckets too)
                const { data: signedData, error } = await supabase.storage
                  .from(BUCKET_NAME)
                  .createSignedUrl(value, 3600); // 1 hour expiry
                
                if (error) {
                  console.error(`Error creating signed URL for ${key}:`, error);
                  // Fallback to public URL
                  const { data: publicData } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(value);
                  urls[key] = publicData?.publicUrl || null;
                } else {
                  urls[key] = signedData?.signedUrl || null;
                }
              }
            } catch (err) {
              console.error(`Failed to get URL for ${key}:`, err);
              urls[key] = null;
            }
          } else {
            urls[key] = null;
          }
        }
        
        setPhotoUrls(urls);
      }
      
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
  const [displayUrl, setDisplayUrl] = useState(null);

  useEffect(() => {
    async function getImageUrl() {
      // If we have a URL, use it
      if (url) {
        setDisplayUrl(url);
        return;
      }

      // If we have a filePath but no URL, try signed URL
      if (filePath) {
        try {
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(filePath, 3600);
          
          if (error) {
            console.error('Signed URL error:', error);
            // Fallback to public URL
            const { data: publicData } = supabase.storage
              .from(BUCKET_NAME)
              .getPublicUrl(filePath);
            setDisplayUrl(publicData?.publicUrl || null);
          } else {
            setDisplayUrl(data?.signedUrl || null);
          }
        } catch (err) {
          console.error('Error getting image URL:', err);
          setDisplayUrl(null);
        }
      } else {
        setDisplayUrl(null);
      }
    }

    getImageUrl();
  }, [url, filePath]);

  // Reset states when URL changes
  useEffect(() => {
    setImgError(false);
    setIsLoading(true);
  }, [displayUrl]);

  // Show no image state
  if (!displayUrl && !filePath) {
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

  // Show loading state
  if (!displayUrl && filePath) {
    return (
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1.5">{label}</label>
        <div className="w-full aspect-[4/3] rounded-lg border border-slate-800 bg-slate-900 flex flex-col items-center justify-center text-xs text-slate-600 gap-2">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span>Loading image...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-medium text-slate-500 block mb-1.5">{label}</label>
      <div className="w-full aspect-[4/3] rounded-lg border border-slate-800 bg-slate-900 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-600 gap-2 bg-slate-900/80 z-10">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        )}
        
        {!imgError ? (
          <img
            src={displayUrl}
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
            {displayUrl && (
              <a 
                href={displayUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs underline"
              >
                Open directly
              </a>
            )}
            {filePath && (
              <span className="text-[10px] text-slate-700 break-all max-w-[90%] mt-1">
                File: {filePath.split('/').pop()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
