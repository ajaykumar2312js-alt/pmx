import { useState } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { deactivateUser } from '../../redux/slices/userSlice';
import { Modal, Button, Alert } from '../common/ui';
import { UserProfile } from '../../redux/slices/authSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';

interface DeactivateUserModalProps {
  user: UserProfile | null;
  onClose: () => void;
}

export const DeactivateUserModal = ({ user, onClose }: DeactivateUserModalProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await dispatch(deactivateUser(user.id)).unwrap();
      dispatch(enqueueToast({ severity: 'success', message: 'User deactivated successfully' }));
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { statusCode?: number; message?: string };
      // Handle block constraint (e.g. 422 Unprocessable Entity for active items)
      if (errorObj.statusCode === 422 || errorObj.statusCode === 400) {
        setError(errorObj.message || 'Cannot deactivate user with active assignments.');
      } else {
        setError(errorObj.message || 'Failed to deactivate user.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title="Deactivate User"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeactivate} loading={loading}>
            Deactivate
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <Alert severity="error" message={error} onClose={() => setError(null)} />}
        <p>
          Are you sure you want to deactivate <strong>{user.firstName} {user.lastName}</strong>?
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-danger)' }}>
          This will prevent the user from logging in. If the user has active tasks or projects, deactivation may be blocked.
        </p>
      </div>
    </Modal>
  );
};
