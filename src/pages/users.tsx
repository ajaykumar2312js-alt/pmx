import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchUsers, selectUsers, selectUsersMeta, selectUsersStatus } from '../redux/slices/userSlice';
import { UserProfile } from '../redux/slices/authSlice';
import { UserTable, UserFilter, UserForm, RoleAssignModal, DeactivateUserModal } from '../components/users';
// eslint-disable-next-line no-restricted-imports
import { Pagination, Button } from '../components/common/ui';
import { UserListParams } from '../services/userService';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const meta = useAppSelector(selectUsersMeta);
  const status = useAppSelector(selectUsersStatus);

  const [params, setParams] = useState<UserListParams>({ limit: 10 });
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<UserProfile | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<UserProfile | null>(null);

  const loadUsers = useCallback((currentParams: UserListParams) => {
    dispatch(fetchUsers(currentParams));
  }, [dispatch]);

  useEffect(() => {
    loadUsers(params);
  }, [params, loadUsers]);

  const handleFilter = (filterParams: Partial<UserListParams>) => {
    setParams(prev => ({ ...prev, ...filterParams, cursor: undefined, direction: undefined }));
  };

  const handleNextPage = () => {
    if (meta?.nextCursor) {
      setParams(prev => ({ ...prev, cursor: meta.nextCursor || undefined, direction: 'next' }));
    }
  };

  const handlePrevPage = () => {
    if (meta?.prevCursor) {
      setParams(prev => ({ ...prev, cursor: meta.prevCursor || undefined, direction: 'prev' }));
    }
  };

  const isLoading = status === 'loading' || status === 'idle';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>User Management</h1>
        <Button variant="primary" onClick={() => setIsInviteOpen(true)}>
          <Plus size={16} />
          Invite User
        </Button>
      </div>

      <UserFilter onFilter={handleFilter} loading={isLoading} />

      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', padding: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <UserTable
          users={users}
          loading={isLoading}
          onAssignRoles={setRoleModalUser}
          onDeactivate={setDeactivateUser}
        />
        
        {meta && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              meta={meta}
              onNext={handleNextPage}
              onPrev={handlePrevPage}
            />
          </div>
        )}
      </div>

      <UserForm
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => {
          setIsInviteOpen(false);
          loadUsers(params); // refetch
        }}
      />

      <RoleAssignModal
        user={roleModalUser}
        onClose={() => setRoleModalUser(null)}
      />

      <DeactivateUserModal
        user={deactivateUser}
        onClose={() => setDeactivateUser(null)}
      />
    </div>
  );
}
