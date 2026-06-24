import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { authService } from '../../services/authService';
import { fetchCurrentUser } from '../../redux/slices/authSlice';
import { Input, Button, Alert } from '../common/ui';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.login({ email, password });
      await dispatch(fetchCurrentUser()).unwrap();
      // Redirect to the route the user originally requested, or the dashboard.
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      if (error.statusCode === 429) {
        setError('Too many failed attempts. Your account has been temporarily locked.');
      } else {
        setError(error.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && <Alert severity="error" message={error} />}
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@company.com"
      />
      <Input
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
        Sign in
      </Button>
    </form>
  );
};
