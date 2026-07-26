import { useState } from 'react';
import { Plus, Megaphone, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/common/Toast.jsx';
import AnnouncementEditor from '../components/announcements/AnnouncementEditor.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import * as announcementService from '../services/announcementService';
import { formatRelativeTime } from '../utils/formatters';
import { cn } from '../utils/helpers';

const PRIORITY_CLASSES = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  important: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  normal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function Announcements() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();
  const { data, loading, refetch } = useApi(() => announcementService.getAnnouncements(), []);
  const announcements = data?.items || [];

  function openCreate() {
    setEditingAnnouncement(null);
    setEditorOpen(true);
  }

  function openEdit(announcement) {
    setEditingAnnouncement(announcement);
    setEditorOpen(true);
  }

  async function handleSave(id, payload) {
    setSaving(true);
    try {
      if (id) {
        await announcementService.updateAnnouncement(id, payload);
        addToast('Announcement updated successfully', 'success');
      } else {
        await announcementService.createAnnouncement(payload);
        addToast('Announcement published successfully', 'success');
      }
      setEditorOpen(false);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to save announcement', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(announcement) {
    try {
      await announcementService.togglePublish(announcement.id, !announcement.published);
      addToast(
        `Announcement ${announcement.published ? 'unpublished' : 'published'}`,
        'success'
      );
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to update announcement', 'error');
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await announcementService.deleteAnnouncement(deleteTarget.id);
      addToast('Announcement deleted', 'success');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to delete announcement', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">
            Broadcast messages and updates to your platform users.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {loading ? (
        <div className="card py-16">
          <LoadingSpinner />
        </div>
      ) : !announcements.length ? (
        <div className="card">
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            description="Create your first announcement to notify users."
            action={
              <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Announcement
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Megaphone className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-slate-100">
                        {announcement.title}
                      </h3>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full border capitalize',
                          PRIORITY_CLASSES[announcement.priority] || PRIORITY_CLASSES.normal
                        )}
                      >
                        {announcement.priority}
                      </span>
                      {!announcement.published && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{announcement.body}</p>
                    <p className="text-xs text-slate-600 mt-2">
                      {announcement.audience?.replace('_', ' ')} ·{' '}
                      {formatRelativeTime(announcement.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(announcement)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    title={announcement.published ? 'Unpublish' : 'Publish'}
                  >
                    {announcement.published ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(announcement)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(announcement)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnnouncementEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        announcement={editingAnnouncement}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={saving}
        title="Delete this announcement?"
        message="This will permanently remove it and it will no longer be visible to users."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
