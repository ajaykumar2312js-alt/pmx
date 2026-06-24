import { useState, FormEvent } from 'react';
import { Input, Select, Button } from '../common/ui';
import { Role } from '../../common/enums';
import { UserListParams } from '../../services/userService';

interface UserFilterProps {
  onFilter: (params: Partial<UserListParams>) => void;
  loading?: boolean;
}

export const UserFilter = ({ onFilter, loading }: UserFilterProps) => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onFilter({
      search: search || undefined,
      role: role || undefined,
      status: status || undefined,
    });
  };

  const handleClear = () => {
    setSearch('');
    setRole('');
    setStatus('');
    onFilter({ search: undefined, role: undefined, status: undefined });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <Input
          label="Search"
          placeholder="Name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div style={{ width: '150px' }}>
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { label: 'All Roles', value: '' },
            { label: 'Admin', value: Role.ADMIN },
            { label: 'Product Owner', value: Role.PO },
            { label: 'Developer', value: Role.DEVELOPER },
            { label: 'Viewer', value: Role.VIEWER },
          ]}
        />
      </div>
      <div style={{ width: '150px' }}>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: 'All Statuses', value: '' },
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
            { label: 'Invited', value: 'Invited' },
          ]}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: '0.25rem' }}>
        <Button type="submit" variant="primary" loading={loading}>
          Filter
        </Button>
        <Button type="button" variant="secondary" onClick={handleClear} disabled={loading}>
          Clear
        </Button>
      </div>
    </form>
  );
};
