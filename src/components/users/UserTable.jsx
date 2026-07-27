import { useState } from 'react';
import { MoreVertical, Eye, Pencil, Ban, CheckCircle, Trash2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { formatDate, truncateText } from '../../utils/formatters';

export default function UserTable({
  users,
  loading,
  onView,
  onEdit,
  onSuspend,
  onActivate,
  onDelete,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  if (loading) {
    return (
      <div className="card py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div className="card">
        <EmptyState title="No users found" description="Try adjusting your search or filters." />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="px-4 py-3 font-medium text-slate-500">UID</th>
              <th className="px-4 py-3 font-medium text-slate-500">User</th>
              <th className="px-4 py-3 font-medium text-slate-500">Country</th>
              <th className="px-4 py-3 font-medium text-slate-500">Role</th>
              <th className="px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 font-medium text-slate-500">Joined</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-slate-400">{user.uid ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {truncateText(user.email, 30)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{user.country || '—'}</td>
                <td className="px-4 py-3 text-slate-400 capitalize">
                  {user.role?.replace('_', ' ') || '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3 text-slate-400">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="relative flex justify-end">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === user.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-8 z-20 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1">
                          <button
                            onClick={() => {
                              onView(user);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View details
                          </button>
                          <button
                            onClick={() => {
                              onEdit(user);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit user
                          </button>
                          {user.status === 'suspended' ? (
                            <button
                              onClick={() => {
                                onActivate(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-slate-800 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                onSuspend(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-400 hover:bg-slate-800 transition-colors"
                            >
                              <Ban className="w-4 h-4" />
                              Suspend
                            </button>
                          )}
                          <div className="border-t border-slate-800 my-1" />
                          <button
                            onClick={() => {
                              onDelete(user);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
