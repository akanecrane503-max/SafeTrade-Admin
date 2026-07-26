import SearchBar from '../common/SearchBar.jsx';
import Dropdown from '../common/Dropdown.jsx';
import { USER_STATUS, USER_ROLES } from '../../utils/constants';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  ...Object.values(USER_STATUS).map((s) => ({ label: s, value: s })),
];

const ROLE_OPTIONS = [
  { label: 'All roles', value: 'all' },
  ...Object.values(USER_ROLES).map((r) => ({ label: r.replace('_', ' '), value: r })),
];

export default function UserFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  role,
  onRoleChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name, email, or ID..."
        className="flex-1"
      />
      <div className="flex gap-3 shrink-0">
        <Dropdown
          options={STATUS_OPTIONS}
          value={status}
          onChange={onStatusChange}
          className="w-40"
        />
        <Dropdown
          options={ROLE_OPTIONS}
          value={role}
          onChange={onRoleChange}
          className="w-40"
        />
      </div>
    </div>
  );
}
