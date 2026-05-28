import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props { onSwitch: () => void; }

export default function RegisterScreen({ onSwitch }: Props) {
  const { register, isLoading } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    try {
      await register(email, password, name || undefined);
    } catch (err: any) {
      setError(err.message ?? 'Registration failed');
    }
  };

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>ر</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t)' }}>Create your account</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="cc-iw">
          <input className="cc-in" type="text" placeholder="Display name (optional)"
            value={name} onChange={e => setName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div className="cc-iw">
          <input className="cc-in" type="email" placeholder="Email address"
            value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div className="cc-iw">
          <input className="cc-in" type="password" placeholder="Password (min 8 chars)"
            value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%' }} />
        </div>

        {error && (
          <div style={{ background: 'var(--redl)', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: 'var(--red)' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-p" disabled={isLoading} style={{ marginTop: 4, opacity: isLoading ? 0.6 : 1 }}>
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--t3)', marginTop: 8 }}>
        Already have an account?{' '}
        <span style={{ color: 'var(--cg)', fontWeight: 600, cursor: 'pointer' }} onClick={onSwitch}>
          Sign in
        </span>
      </div>
    </div>
  );
}
