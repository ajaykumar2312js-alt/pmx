import { useState } from 'react';
import { Button, Alert } from '../common/ui';
import { msalInstance } from './msalConfig';

export const MicrosoftButton = () => {
  const [error, setError] = useState<string | null>(null);
  const isConfigured = !!import.meta.env.VITE_MSAL_CLIENT_ID;

  const handleLogin = async () => {
    if (!isConfigured || !msalInstance) {
      setError('Microsoft SSO is not configured or unavailable in this environment.');
      return;
    }

    try {
      await msalInstance.initialize();
      // Trigger the redirect flow. Response is handled on the callback page.
      await msalInstance.loginRedirect({
        scopes: ['user.read'],
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to initialize Microsoft login');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {error && <Alert severity="error" message={error} onClose={() => setError(null)} />}
      <Button 
        variant="secondary" 
        onClick={handleLogin} 
        style={{ width: '100%' }}
      >
        Sign in with Microsoft
      </Button>
    </div>
  );
};
