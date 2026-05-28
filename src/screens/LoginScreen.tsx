import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props { onSwitch: () => void; }

export default function LoginScreen({ onSwitch }: Props) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    }
  };

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>ر</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t)' }}>Sign in to Reddli</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>ردلي</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="cc-iw">
          <input
            className="cc-in"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div className="cc-iw">
          <input
            className="cc-in"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        {error && (
          <div style={{ background: 'var(--redl)', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: 'var(--red)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-p"
          disabled={isLoading}
          style={{ marginTop: 4, opacity: isLoading ? 0.6 : 1 }}
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--t3)', marginTop: 8 }}>
        Don't have an account?{' '}
        <span
          style={{ color: 'var(--cg)', fontWeight: 600, cursor: 'pointer' }}
          onClick={onSwitch}
        >
          Register
        </span>
      </div>
    </div>
  );
}
