import { useApi } from '../hooks/useApi';
import { useToast } from '../components/common/Toast.jsx';
import SystemToggles from '../components/settings/SystemToggles.jsx';
import BannerEditor from '../components/settings/BannerEditor.jsx';
import AnnouncementEditorPanel from '../components/settings/AnnouncementEditorPanel.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import * as systemService from '../services/systemService';

export default function SystemControl() {
  const { addToast } = useToast();

  const { data: settings, loading: settingsLoading, refetch: refetchSettings } = useApi(
    () => systemService.getSystemSettings(),
    []
  );
  const { data: banner, loading: bannerLoading, refetch: refetchBanner } = useApi(
    () => systemService.getBanner(),
    []
  );
  const { data: announcement, loading: announcementLoading, refetch: refetchAnnouncement } = useApi(
    () => systemService.getSystemAnnouncement(),
    []
  );

  async function handleToggle(key, value) {
    try {
      await systemService.updateSystemSettings({ [key]: value });
      addToast(`${key.replace(/([A-Z])/g, ' $1')} updated`, 'success');
      refetchSettings();
    } catch (err) {
      addToast(err.message || 'Failed to update setting', 'error');
    }
  }

  const loading = settingsLoading || bannerLoading || announcementLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Control</h1>
        <p className="text-sm text-slate-500 mt-1">
          Platform-wide switches, maintenance mode, and site messaging.
        </p>
      </div>

      {loading ? (
        <div className="card py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <SystemToggles settings={settings} onToggle={handleToggle} />
          <BannerEditor banner={banner} onRefetch={refetchBanner} />
          <AnnouncementEditorPanel announcement={announcement} onRefetch={refetchAnnouncement} />
        </>
      )}
    </div>
  );
}
