import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('creative');
  const [form, setForm] = useState({ name: '', email: '', password: '', speciality: '', companyName: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await register({ ...form, role });
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="card form-card">
        <span className="eyebrow">Join Noah Arc</span>
        <h2 style={{ marginTop: 8, marginBottom: 20 }}>Create your account</h2>

        <div className="role-toggle">
          <button type="button" className={role === 'creative' ? 'active' : ''} onClick={() => setRole('creative')}>
            I'm a creative
          </button>
          <button type="button" className={role === 'client' ? 'active' : ''} onClick={() => setRole('client')}>
            I'm hiring
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={e => update('name', e.target.value)} placeholder="Amara Kone" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={6} value={form.password} onChange={e => update('password', e.target.value)} placeholder="At least 6 characters" />
          </div>

          {role === 'creative' ? (
            <div className="field">
              <label htmlFor="speciality">Speciality</label>
              <input id="speciality" value={form.speciality} onChange={e => update('speciality', e.target.value)} placeholder="Photography, videography, design…" />
            </div>
          ) : (
            <div className="field">
              <label htmlFor="companyName">Company or brand name (optional)</label>
              <input id="companyName" value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Sahel Studios" />
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-muted" style={{ marginTop: 18, fontSize: '0.88rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--gold-soft)' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
