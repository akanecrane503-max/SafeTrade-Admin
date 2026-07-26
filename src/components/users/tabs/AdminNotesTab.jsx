import { useState } from 'react';
import { StickyNote, Plus } from 'lucide-react';
import EmptyState from '../../common/EmptyState.jsx';
import { useToast } from '../../common/Toast.jsx';
import * as userService from '../../../services/userService';
import { formatDateTime } from '../../../utils/formatters';

export default function AdminNotesTab({ user, onRefetch }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const notes = user.adminNotes || [];

  async function handleAdd(e) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    try {
      await userService.addAdminNote(user.id, note.trim());
      setNote('');
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Failed to add note', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-1">Admin Notes</h3>
      <p className="text-xs text-slate-500 mb-4">
        Private notes visible only to administrators.
      </p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-5">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this user..."
          className="input-base flex-1"
        />
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {!notes.length ? (
        <EmptyState icon={StickyNote} title="No notes yet" description="Add the first internal note above." />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="p-3 rounded-xl bg-slate-800/40">
              <p className="text-sm text-slate-200">{n.text}</p>
              <p className="text-xs text-slate-500 mt-1.5">
                {n.adminName} · {formatDateTime(n.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
