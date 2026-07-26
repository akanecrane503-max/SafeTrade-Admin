import { Pencil, Power } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { cn } from '../../utils/helpers';

export default function AdminTable({ admins, loading, onEdit, onToggle }) {
  if (loading) {
    return (
      <div className="card py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!admins?.length) {
    return (
      <div className="card">
        <EmptyState title="No administrators found" description="Create your first admin account." />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="px-4 py-3 font-medium text-slate-500">Admin</th>
              <th className="px-4 py-3 font-medium text-slate-500">Username</th>
              <th className="px-4 py-3 font-medium text-slate-500">Role</th>
              <th className="px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 font-medium text-slate-500">Last Login</th>
              <th className="px-4 py-3 font-medium text-slate-500">Created</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {admin.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200 truncate">{admin.name}</p>
                      <p className="text-xs text-slate-500 truncate">{admin.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{admin.username}</td>
                <td className="px-4 py-3 text-slate-400 capitalize">
                  {admin.role?.replace('_', ' ')}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={admin.status} />
                </td>
                <td className="px-4 py-3 text-slate-400">{formatRelativeTime(admin.lastLoginAt)}</td>
                <td className="px-4 py-3 text-slate-400">{formatDate(admin.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(admin)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggle(admin)}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        admin.status === 'active'
                          ? 'text-slate-500 hover:bg-red-500/10 hover:text-red-400'
                          : 'text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400'
                      )}
                      title={admin.status === 'active' ? 'Suspend' : 'Activate'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
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
