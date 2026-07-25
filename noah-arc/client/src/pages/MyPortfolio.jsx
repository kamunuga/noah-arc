import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function MyPortfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '' });

  async function load() {
    setLoading(true);
    try {
      const { portfolios } = await api.get('/portfolios/mine');
      setItems(portfolios);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/portfolios', form);
      setForm({ title: '', description: '', imageUrl: '' });
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleStatus(item) {
    const status = item.status === 'published' ? 'hidden' : 'published';
    await api.put(`/portfolios/${item.id}`, { status });
    load();
  }

  async function remove(item) {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    await api.del(`/portfolios/${item.id}`);
    load();
  }

  return (
    <div className="container section">
      <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="eyebrow">Your work</span>
          <h2>My portfolio</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setFormOpen(o => !o)}>
          {formOpen ? 'Close' : 'Add portfolio item'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {formOpen && (
        <form onSubmit={onCreate} className="card form-wide" style={{ marginBottom: 32 }}>
          <div className="field">
            <label>Title</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Wedding photography — Lagos" />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What was this project about?" />
          </div>
          <div className="field">
            <label>Image URL (optional)</label>
            <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
          </div>
          <button className="btn btn-primary" type="submit">Publish item</button>
        </form>
      )}

      {loading ? <div className="spinner" /> : items.length === 0 ? (
        <div className="empty-state">You haven't added any work yet. Add your first portfolio item above.</div>
      ) : (
        <div className="portfolio-grid">
          {items.map(item => (
            <div key={item.id} className="card">
              <div className="portfolio-thumb" style={item.image_url ? { backgroundImage: `url(${item.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
              <span className={`badge badge-${item.status}`}>{item.status}</span>
              <h3 style={{ fontSize: '1rem', marginTop: 8 }}>{item.title}</h3>
              {item.description && <p className="text-muted" style={{ fontSize: '0.88rem', marginTop: 6 }}>{item.description}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(item)}>
                  {item.status === 'published' ? 'Hide' : 'Publish'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(item)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
