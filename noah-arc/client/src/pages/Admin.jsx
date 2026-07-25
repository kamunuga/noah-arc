import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Admin() {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  async function loadAll() {
    try {
      const [s, u, p, j] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/portfolios'),
        api.get('/admin/jobs'),
      ]);
      setStats(s);
      setUsers(u.users);
      setPortfolios(p.portfolios);
      setJobs(j.jobs);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function toggleUserStatus(u) {
    const status = u.status === 'active' ? 'suspended' : 'active';
    await api.put(`/admin/users/${u.id}/status`, { status });
    loadAll();
  }

  async function togglePortfolioStatus(p) {
    const status = p.status === 'published' ? 'hidden' : 'published';
    await api.put(`/admin/portfolios/${p.id}/status`, { status });
    loadAll();
  }

  async function toggleJobStatus(j) {
    const status = j.status === 'open' ? 'closed' : 'open';
    await api.put(`/admin/jobs/${j.id}/status`, { status });
    loadAll();
  }

  return (
    <div className="container section">
      <div className="section-head">
        <span className="eyebrow">Platform control</span>
        <h2>Admin panel</h2>
      </div>
      {error && <div className="error-banner">{error}</div>}

      {stats && (
        <div className="stat-tiles">
          <div className="stat-tile"><div className="num">{stats.users}</div><div className="label">Total users</div></div>
          <div className="stat-tile"><div className="num">{stats.creatives}</div><div className="label">Creatives</div></div>
          <div className="stat-tile"><div className="num">{stats.clients}</div><div className="label">Clients</div></div>
          <div className="stat-tile"><div className="num">{stats.jobs}</div><div className="label">Jobs posted</div></div>
          <div className="stat-tile"><div className="num">{stats.portfolios}</div><div className="label">Portfolio items</div></div>
          <div className="stat-tile"><div className="num">{stats.bookings}</div><div className="label">Bookings</div></div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab-btn${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')}>Users</button>
        <button className={`tab-btn${tab === 'portfolios' ? ' active' : ''}`} onClick={() => setTab('portfolios')}>Portfolios</button>
        <button className={`tab-btn${tab === 'jobs' ? ' active' : ''}`} onClick={() => setTab('jobs')}>Jobs</button>
      </div>

      {tab === 'users' && (
        <div className="card">
          {users.map(u => (
            <div key={u.id} className="list-row">
              <div>
                <div style={{ fontWeight: 600 }}>{u.name} <span className="text-muted" style={{ fontWeight: 400 }}>· {u.role}</span></div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>{u.email}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className={`badge badge-${u.status}`}>{u.status}</span>
                {u.role !== 'admin' && (
                  <button className={u.status === 'active' ? 'btn btn-danger btn-sm' : 'btn btn-emerald btn-sm'} onClick={() => toggleUserStatus(u)}>
                    {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'portfolios' && (
        <div className="card">
          {portfolios.map(p => (
            <div key={p.id} className="list-row">
              <div>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>by {p.creative_name}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className={`badge badge-${p.status}`}>{p.status}</span>
                <button className="btn btn-outline btn-sm" onClick={() => togglePortfolioStatus(p)}>
                  {p.status === 'published' ? 'Hide' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'jobs' && (
        <div className="card">
          {jobs.map(j => (
            <div key={j.id} className="list-row">
              <div>
                <div style={{ fontWeight: 600 }}>{j.title}</div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>by {j.client_name}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className={`badge badge-${j.status}`}>{j.status}</span>
                <button className="btn btn-outline btn-sm" onClick={() => toggleJobStatus(j)}>
                  {j.status === 'open' ? 'Close' : 'Reopen'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
