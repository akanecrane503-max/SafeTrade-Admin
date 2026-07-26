import StatusBadge from '../../common/StatusBadge.jsx';
import { formatDateTime } from '../../../utils/formatters';

export default function ProfileTab({ user }) {
  const fields = [
    { label: 'UID', value: user.id },
    { label: 'Username', value: user.username },
    { label: 'Email', value: user.email },
    { label: 'Registration Date', value: formatDateTime(user.createdAt) },
    { label: 'Last Login', value: formatDateTime(user.lastLoginAt) },
    { label: 'Country', value: user.country },
    { label: 'Device', value: user.device },
    { label: 'IP Address', value: user.ipAddress },
  ];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-200">Profile</h3>
        <StatusBadge status={user.status} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-xs text-slate-500 mb-1">{f.label}</p>
            <p className="text-sm font-medium text-slate-200 break-all">{f.value || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
