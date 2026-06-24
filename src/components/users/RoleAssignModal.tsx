import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { updateUserRoles } from '../../redux/slices/userSlice';
import { Modal, Button, Checkbox, Alert } from '../common/ui';
import { UserProfile } from '../../redux/slices/authSlice';
import { Role } from '../../common/enums';
import { enqueueToast } from '../../redux/slices/uiSlice';

interface RoleAssignModalProps {
  user: UserProfile | null;
  onClose: () => void;
}

export const RoleAssignModal = ({ user, onClose }: RoleAssignModalProps) => {
  const dispatch = useAppDispatch();
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Assuming user.roles exists or we fallback to an empty array
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userRoles = (user as any).roles || [];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRoles(userRoles);
    } else {
      setSelectedRoles([]);
    }
  }, [user]);

  const handleToggleRole = (role: Role, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (selectedRoles.length === 0) {
      setError('User must have at least one role.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await dispatch(updateUserRoles({ id: user.id, roles: selectedRoles })).unwrap();
      dispatch(enqueueToast({ severity: 'success', message: 'Roles updated successfully' }));
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || 'Failed to update roles');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title={`Manage Roles: ${user.firstName} ${user.lastName}`}
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={loading}>
            Save Roles
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <Alert severity="error" message={error} onClose={() => setError(null)} />}
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '0.875rem' }}>
          Select the roles to assign to this user. They must have at least one active role.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Object.values(Role).map((role) => (
            <Checkbox
              key={role}
              label={role}
              checked={selectedRoles.includes(role as Role)}
              onChange={(e) => handleToggleRole(role as Role, e.target.checked)}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};
