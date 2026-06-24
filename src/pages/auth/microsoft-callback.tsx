import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { authService } from '../../services/authService';
import { fetchCurrentUser } from '../../redux/slices/authSlice';
import { PageLoader, Alert, Button } from '../../components/common/ui';
import { msalInstance } from '../../components/auth/msalConfig';

export default function MicrosoftCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isProcessing = useRef(false);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const processRedirect = async () => {
      try {
        if (!msalInstance) {
          throw new Error('Microsoft SSO is unavailable in this environment.');
        }
        await msalInstance.initialize();
        const response = await msalInstance.handleRedirectPromise();

        if (response && response.accessToken) {
          // Send to backend
          await authService.microsoft(response.accessToken);
          await dispatch(fetchCurrentUser()).unwrap();
          navigate(from, { replace: true });
        } else {
          // If response is null, user might have navigated directly or cancelled
          setError('Authentication was cancelled or failed.');
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || 'An error occurred during Microsoft sign-in.');
      }
    };

    processRedirect();
  }, [dispatch, navigate, from]);

  if (error) {
    return (
      <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <Alert severity="error" title="Sign In Failed" message={error} />
        <Button onClick={() => navigate('/login')} style={{ marginTop: '1rem' }}>
          Return to Login
        </Button>
      </div>
    );
  }

  return <PageLoader />;
}
