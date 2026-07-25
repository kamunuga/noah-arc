import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { applications } = await api.get('/jobs/applications/mine');
        setApps(applications);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container section">
      <div className="section-head">
        <span className="eyebrow">Jobs</span>
        <h2>My applications</h2>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {loading ? <div className="spinner" /> : apps.length === 0 ? (
        <div className="empty-state">You haven't applied to any jobs yet. <Link to="/jobs" style={{ color: 'var(--gold-soft)' }}>Browse the job board</Link>.</div>
      ) : (
        <div className="card">
          {apps.map(app => (
            <div key={app.id} className="list-row">
              <div>
                <div style={{ fontWeight: 600 }}>{app.job_title}</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Client: {app.client_name}</div>
              </div>
              <span className={`badge badge-${app.status}`}>{app.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
