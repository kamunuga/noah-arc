import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', budget: '', category: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/jobs', form);
      navigate('/my-jobs');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container section">
      <div className="card form-wide">
        <span className="eyebrow">Hiring</span>
        <h2 style={{ marginTop: 8, marginBottom: 20 }}>Post a job</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Title</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Need a videographer for a product launch" />
          </div>
          <div className="field">
            <label>Category</label>
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Videography, design, photography…" />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the scope, timeline, and deliverables." />
          </div>
          <div className="field">
            <label>Budget (optional)</label>
            <input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="e.g. $300–$500" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Posting…' : 'Post job'}</button>
        </form>
      </div>
    </div>
  );
}
