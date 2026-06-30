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
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [role,      setRole]      = useState<Role>(Role.ADMIN);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const reset = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setRole(Role.ADMIN);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await dispatch(createUser({ firstName, lastName, email, password, role })).unwrap();
      dispatch(enqueueToast({ severity: 'success', message: `${firstName} ${lastName} added successfully` }));
      reset();
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
      onClose={handleClose}
      title="Add New User"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} onClick={handleSubmit}>
            Create User
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <Alert severity="error" message={error} onClose={() => setError(null)} />}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Initial Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          required
        />

        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          required
          options={[
            { label: 'Admin',          value: Role.ADMIN },
            { label: 'Product Owner',  value: Role.PO },
            { label: 'Scrum Master',   value: Role.SCRUM_MASTER },
            { label: 'Developer',      value: Role.DEVELOPER },
            { label: 'Tester',         value: Role.TESTER },
            { label: 'DevOps',         value: Role.DEVOPS },
            { label: 'Viewer',         value: Role.VIEWER },
          ]}
        />
      </form>
    </Modal>
  );
};
