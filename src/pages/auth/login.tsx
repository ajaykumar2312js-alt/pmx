import { LoginForm, MicrosoftButton } from '../../components/auth';
import { Card } from '../../components/common/ui';

export default function LoginPage() { 
  return (
    <div style={{ maxWidth: '400px', width: '100%' }}>
      <Card>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Welcome to PMX</h1>
            <p style={{ color: 'var(--color-neutral-500)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Sign in to your account
            </p>
          </div>

          <LoginForm />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>OR</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
          </div>

          <MicrosoftButton />
        </div>
      </Card>
    </div>
  ); 
}
