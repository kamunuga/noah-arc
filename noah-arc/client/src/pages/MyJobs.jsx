import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [applications, setApplications] = useState({});

  async function load() {
    setLoading(true);
    try {
      const { jobs } = await api.get('/jobs/mine');
      setJobs(jobs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleExpand(job) {
    if (expanded === job.id) { setExpanded(null); return; }
    setExpanded(job.id);
    if (!applications[job.id]) {
      const { applications: apps } = await api.get(`/jobs/${job.id}/applications`);
      setApplications(a => ({ ...a, [job.id]: apps }));
    }
  }

  async function closeJob(job) {
    await api.put(`/jobs/${job.id}`, { status: job.status === 'open' ? 'closed' : 'open' });
    load();
  }

  async function decide(jobId, appId, status) {
    await api.put(`/jobs/applications/${appId}`, { status });
    const { applications: apps } = await api.get(`/jobs/${jobId}/applications`);
    setApplications(a => ({ ...a, [jobId]: apps }));
  }

  return (
    <div className="container section">
      <div className="section-head">
        <span className="eyebrow">Hiring</span>
        <h2>My job posts</h2>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {loading ? <div className="spinner" /> : jobs.length === 0 ? (
        <div className="empty-state">You haven't posted any jobs yet. <Link to="/post-job" style={{ color: 'var(--gold-soft)' }}>Post your first one</Link>.</div>
      ) : (
        <div>
          {jobs.map(job => (
            <div key={job.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span className={`badge badge-${job.status}`}>{job.status}</span>
                  <h3 style={{ marginTop: 8 }}>{job.title}</h3>
                  {job.category && <p className="text-muted" style={{ fontSize: '0.85rem' }}>{job.category}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => toggleExpand(job)}>
                    {expanded === job.id ? 'Hide applicants' : 'View applicants'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => closeJob(job)}>
                    {job.status === 'open' ? 'Close job' : 'Reopen job'}
                  </button>
                </div>
              </div>

              {expanded === job.id && (
                <div style={{ marginTop: 18, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                  {!applications[job.id] ? (
                    <div className="spinner" />
                  ) : applications[job.id].length === 0 ? (
                    <p className="text-muted" style={{ fontSize: '0.88rem' }}>No applications yet.</p>
                  ) : (
                    applications[job.id].map(app => (
                      <div key={app.id} className="list-row">
                        <div>
                          <div style={{ fontWeight: 600 }}>{app.creative_name} <span className="text-muted" style={{ fontWeight: 400 }}>· {app.speciality}</span></div>
                          {app.proposal && <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>{app.proposal}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className={`badge badge-${app.status}`}>{app.status}</span>
                          {app.status === 'pending' && (
                            <>
                              <button className="btn btn-emerald btn-sm" onClick={() => decide(job.id, app.id, 'accepted')}>Accept</button>
                              <button className="btn btn-danger btn-sm" onClick={() => decide(job.id, app.id, 'rejected')}>Reject</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
