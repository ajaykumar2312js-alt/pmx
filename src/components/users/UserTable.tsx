import { Table, Column } from '../common/ui/Table/Table';
import { Button } from '../common/ui';
import { UserProfile } from '../../redux/slices/authSlice';
import { Role } from '../../common/enums';

interface UserTableProps {
  users: UserProfile[];
  loading?: boolean;
  onAssignRoles: (user: UserProfile) => void;
  onDeactivate: (user: UserProfile) => void;
}

export const UserTable = ({ users, loading, onAssignRoles, onDeactivate }: UserTableProps) => {
  const columns: Column<UserProfile>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (u) => <strong>{u.firstName} {u.lastName}</strong>,
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => {
        let color = 'var(--color-neutral-500)';
        if (u.status === 'Active') color = 'var(--color-success)';
        if (u.status === 'Invited') color = 'var(--color-warning)';
        return <span style={{ color, fontWeight: 600 }}>{u.status}</span>;
      },
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (u) => {
        // Assume u.roles is passed correctly. If missing, it's just user domain type mapping.
        // authSlice UserProfile doesn't strictly have roles[] on it inside the interface, but the API returns it.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roles = (u as any).roles || [];
        return (
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {roles.map((r: string) => (
              <span key={r} style={{
                backgroundColor: r === Role.ADMIN ? 'var(--color-primary-100)' : 'var(--color-neutral-100)',
                color: r === Role.ADMIN ? 'var(--color-primary-800)' : 'var(--color-neutral-800)',
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {r}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" variant="secondary" onClick={() => onAssignRoles(u)}>
            Roles
          </Button>
          {u.status !== 'Inactive' && (
            <Button size="sm" variant="danger" onClick={() => onDeactivate(u)}>
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={users} keyExtractor={(u) => u.id} loading={loading} />;
};
