import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Browse() {
  const [portfolios, setPortfolios] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(query = '') {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/portfolios${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      setPortfolios(data.portfolios);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function onSearch(e) {
    e.preventDefault();
    load(q);
  }

  return (
    <div className="container section">
      <div className="section-head">
        <span className="eyebrow">Discover talent</span>
        <h2>Browse African creatives</h2>
        <p>Search by name, project title, or speciality — photography, design, film, music and more.</p>
      </div>

      <form onSubmit={onSearch} style={{ display: 'flex', gap: 10, marginBottom: 32, maxWidth: 480 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search creatives or work…"
          style={{ flex: 1, background: 'var(--surface-raised)', border: '1px solid var(--line)', color: 'var(--text)', padding: '11px 14px', borderRadius: 8 }}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <div className="spinner" />
      ) : portfolios.length === 0 ? (
        <div className="empty-state">No portfolios match your search yet. Try a different term.</div>
      ) : (
        <div className="portfolio-grid">
          {portfolios.map(p => (
            <Link to={`/creatives/${p.creative_id}`} key={p.id} className="card">
              <div className="portfolio-thumb" style={p.image_url ? { backgroundImage: `url(${p.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
              <span className="eyebrow">{p.creative_speciality || 'Creative'}</span>
              <h3 style={{ fontSize: '1.05rem', marginTop: 6 }}>{p.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.88rem', marginTop: 6 }}>{p.creative_name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
