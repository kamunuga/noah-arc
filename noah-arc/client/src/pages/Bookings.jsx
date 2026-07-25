import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../AuthContext';

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { bookings } = await api.get('/bookings/mine');
      setBookings(bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    try {
      await api.put(`/bookings/${id}`, { status });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container section">
      <div className="section-head">
        <span className="eyebrow">Collaborations</span>
        <h2>Bookings</h2>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {loading ? <div className="spinner" /> : bookings.length === 0 ? (
        <div className="empty-state">No bookings yet.</div>
      ) : (
        <div className="card">
          {bookings.map(b => (
            <div key={b.id} className="list-row">
              <div>
                <div style={{ fontWeight: 600 }}>
                  {user.role === 'creative' ? b.client_name : `${b.creative_name} · ${b.speciality || ''}`}
                </div>
                {b.details && <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>{b.details}</div>}
                {(b.start_date || b.end_date) && (
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 2 }}>
                    {b.start_date || '—'} → {b.end_date || '—'}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`badge badge-${b.status}`}>{b.status}</span>
                {user.role === 'creative' && b.status === 'pending' && (
                  <>
                    <button className="btn btn-emerald btn-sm" onClick={() => setStatus(b.id, 'accepted')}>Accept</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setStatus(b.id, 'rejected')}>Reject</button>
                  </>
                )}
                {b.status === 'accepted' && (
                  <button className="btn btn-outline btn-sm" onClick={() => setStatus(b.id, 'completed')}>Mark complete</button>
                )}
                {user.role === 'client' && b.status === 'pending' && (
                  <button className="btn btn-danger btn-sm" onClick={() => setStatus(b.id, 'cancelled')}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
