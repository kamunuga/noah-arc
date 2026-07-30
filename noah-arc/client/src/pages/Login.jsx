import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      const dest = location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="card form-card">
        <span className="eyebrow">Welcome back</span>
        <h2 style={{ marginTop: 8, marginBottom: 20 }}>Log in to Noah Arc</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <div style={{ marginTop: 14, textAlign: 'right' }}>
          <Link to="/forgot-password" style={{ color: 'var(--gold-soft)', fontSize: '0.92rem' }}>Forgot password?</Link>
        </div>
        <p className="text-muted" style={{ marginTop: 18, fontSize: '0.88rem' }}>
          New to Noah Arc? <Link to="/signup" style={{ color: 'var(--gold-soft)' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
