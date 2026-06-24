import { useState, FormEvent } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { createUser } from '../../redux/slices/userSlice';
import { Modal, Input, Select, Button, Alert } from '../common/ui';
import { Role } from '../../common/enums';
import { enqueueToast } from '../../redux/slices/uiSlice';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserForm = ({ isOpen, onClose, onSuccess }: UserFormProps) => {
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.VIEWER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await dispatch(createUser({ firstName, lastName, email, role })).unwrap();
      dispatch(enqueueToast({ severity: 'success', message: 'User invited successfully' }));
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole(Role.VIEWER);
      onSuccess();
    } catch (err: unknown) {
      const errorResponse = err as { statusCode?: number; message?: string };
      if (errorResponse.statusCode === 409) {
        setError('A user with this email already exists.');
      } else {
        setError(errorResponse.message || 'Failed to create user.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite New User"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} onClick={handleSubmit}>
            Send Invite
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <Alert severity="error" message={error} onClose={() => setError(null)} />}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Select
          label="Initial Role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          required
          options={[
            { label: 'Admin', value: Role.ADMIN },
            { label: 'Product Owner', value: Role.PO },
            { label: 'Developer', value: Role.DEVELOPER },
            { label: 'Viewer', value: Role.VIEWER },
          ]}
        />
      </form>
    </Modal>
  );
};
