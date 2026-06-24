import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-restricted-imports
import { Button } from '../components/common/ui';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', textAlign: 'center' }}>
      <ShieldAlert size={64} color="var(--color-danger)" />
      <h1 style={{ margin: 0 }}>403 - Forbidden</h1>
      <p style={{ color: 'var(--color-neutral-600)', maxWidth: '400px' }}>
        You do not have the required permissions to view this page or perform this action.
      </p>
      <Button variant="primary" onClick={() => navigate('/')}>
        Return to Dashboard
      </Button>
    </div>
  );
}
