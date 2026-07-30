import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../AuthContext';
import { defaultJobs } from '../mocks/sampleData';

const RWF_RATE = 27; // Approximate NGN to RWF rate

function parseBudget(raw) {
  if (!raw) return null;
  const digits = raw.replace(/[^\d.]/g, '');
  const normalized = digits.replace(/,/g, '');
  const amount = parseFloat(normalized);
  if (Number.isNaN(amount)) return null;
  return amount;
}

function formatBudget(raw, currency) {
  const amount = parseBudget(raw);
  if (amount === null) return raw;
  const value = currency === 'RWF' ? Math.round(amount * RWF_RATE) : Math.round(amount / RWF_RATE);
  const symbol = currency === 'RWF' ? 'RWF' : 'N';
  return `${symbol}${value.toLocaleString()}`;
}

export default function JobBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(defaultJobs);
  const [currency, setCurrency] = useState('NGN');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openJobId, setOpenJobId] = useState(null);
  const [proposal, setProposal] = useState('');
  const [applyMsg, setApplyMsg] = useState({});

  async function load(query = '') {
    setLoading(true);
    try {
      const data = await api.get(`/jobs${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      if (!query && Array.isArray(data.jobs) && data.jobs.length === 0) {
        setJobs(defaultJobs);
      } else {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      setError(err.message);
      setJobs(defaultJobs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function onSearch(e) {
    e.preventDefault();
    load(q);
  }

  async function apply(jobId) {
    if (!user) return navigate('/login', { state: { from: '/jobs' } });
    setApplyMsg(m => ({ ...m, [jobId]: '' }));
    try {
      await api.post(`/jobs/${jobId}/apply`, { proposal });
      setApplyMsg(m => ({ ...m, [jobId]: 'Application submitted.' }));
      setProposal('');
    } catch (err) {
      setApplyMsg(m => ({ ...m, [jobId]: err.message }));
    }
  }

  return (
    <div className="container section">
      <div className="section-head">
        <span className="eyebrow">Open work</span>
        <h2>Job board</h2>
        <p>Clients across Africa are posting creative work — apply directly with a proposal.</p>
      </div>

      <form onSubmit={onSearch} style={{ display: 'flex', gap: 10, marginBottom: 16, maxWidth: 480, flexWrap: 'wrap' }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search jobs by title or category…"
          style={{ flex: 1, minWidth: 220, background: 'var(--surface-raised)', border: '1px solid var(--line)', color: 'var(--text)', padding: '11px 14px', borderRadius: 8 }}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 24 }}>
        <span className="eyebrow" style={{ margin: 0 }}>Currency:</span>
        <button
          type="button"
          className={currency === 'NGN' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          onClick={() => setCurrency('NGN')}
        >
          NGN
        </button>
        <button
          type="button"
          className={currency === 'RWF' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          onClick={() => setCurrency('RWF')}
        >
          RWF
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading ? <div className="spinner" /> : jobs.length === 0 ? (
        <div className="empty-state">No open jobs right now — check back soon.</div>
      ) : (
        <div className="job-grid">
          {jobs.map(job => (
            <div key={job.id} className="card">
              <span className="badge badge-open">{job.status}</span>
              <h3 style={{ marginTop: 10, fontSize: '1.05rem' }}>{job.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.88rem', margin: '6px 0' }}>
                {job.client_name}{job.company_name ? ` · ${job.company_name}` : ''}
              </p>
              {job.category && <span className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>{job.category}</span>}
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{job.description}</p>
              {job.budget && <p style={{ marginTop: 8, fontWeight: 600 }}>Budget: {formatBudget(job.budget, currency)}</p>}

              {user?.role === 'creative' ? (
                openJobId === job.id ? (
                  <div style={{ marginTop: 14 }}>
                    <textarea
                      value={proposal}
                      onChange={e => setProposal(e.target.value)}
                      placeholder="Briefly explain why you're a fit…"
                      style={{ width: '100%', background: 'var(--surface-raised)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 8, padding: 10, minHeight: 70, marginBottom: 10 }}
                    />
                    {applyMsg[job.id] && <div className="text-muted" style={{ fontSize: '0.82rem', marginBottom: 8 }}>{applyMsg[job.id]}</div>}
                    <button className="btn btn-primary btn-sm" onClick={() => apply(job.id)}>Submit application</button>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => setOpenJobId(job.id)}>Apply</button>
                )
              ) : !user ? (
                <button className="btn btn-outline btn-sm" style={{ marginTop: 14 }} onClick={() => navigate('/login')}>Log in to apply</button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
