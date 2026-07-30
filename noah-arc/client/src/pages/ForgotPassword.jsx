import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setStatus('');
    setBusy(true);
    try {
      const data = await api.post('/auth/forgot-password', { email });
      setStatus(data.message || 'If that email exists, password reset instructions have been sent.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="card form-card">
        <span className="eyebrow">Forgot password</span>
        <h2 style={{ marginTop: 8, marginBottom: 20 }}>Reset your account password</h2>
        {status && <div className="success-banner">{status}</div>}
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p className="text-muted" style={{ marginTop: 18, fontSize: '0.88rem' }}>
          Remembered your password? <Link to="/login" style={{ color: 'var(--gold-soft)' }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}
