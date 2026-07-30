import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../AuthContext';

export default function CreativeProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState('');
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');

  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/portfolios/creative/${id}`);
      setData(res);
    } catch (err) {
      setError(err.message);
      setData({
        creative: {
          id,
          name: 'Creative Name',
          speciality: 'Creative work',
          bio: 'This creative is available for new projects and collaborations.',
        },
        portfolios: [
          { id: 'mock-1', title: 'Sample project', description: 'A short sample project description.', image_url: '' },
        ],
        reviews: [],
        avgRating: null,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function submitBooking(e) {
    e.preventDefault();
    setBookingMsg('');
    try {
      await api.post('/bookings', { creativeId: id, details: bookingDetails, startDate: bookingStart, endDate: bookingEnd });
      setBookingMsg('Booking request sent. You can track it from your Bookings page.');
      setBookingDetails(''); setBookingStart(''); setBookingEnd('');
    } catch (err) {
      setBookingMsg(err.message);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setReviewMsg('');
    try {
      await api.post('/reviews', { creativeId: id, rating: Number(rating), comment });
      setReviewMsg('Review submitted, thank you.');
      setComment('');
      load();
    } catch (err) {
      setReviewMsg(err.message);
    }
  }

  function goMessage() {
    if (!user) return navigate('/login', { state: { from: `/creatives/${id}` } });
    navigate(`/messages?with=${id}`);
  }

  if (loading) return <div className="container section"><div className="spinner" /></div>;
  if (error) return <div className="container section"><div className="error-banner">{error}</div></div>;
  if (!data) return null;

  const { creative, portfolios, reviews, avgRating } = data;

  return (
    <div className="container section">
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <div className="avatar-circle" style={{ width: 64, height: 64, fontSize: '1.4rem' }}>
          {creative.name.charAt(0)}
        </div>
        <div>
          <h2>{creative.name}</h2>
          <span className="eyebrow">{creative.speciality || 'Creative'}</span>
          {avgRating && <span className="text-muted" style={{ marginLeft: 10 }}>★ {avgRating} ({reviews.length} reviews)</span>}
        </div>
      </div>
      {creative.bio && <p className="text-muted" style={{ maxWidth: 640, marginBottom: 24 }}>{creative.bio}</p>}

      {user?.role === 'client' && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setBookingOpen(o => !o)}>Book this creative</button>
          <button className="btn btn-outline" onClick={goMessage}>Send a message</button>
          <button className="btn btn-outline" onClick={() => setReviewOpen(o => !o)}>Leave a review</button>
        </div>
      )}
      {!user && (
        <div style={{ marginBottom: 36 }}>
          <Link to="/login" className="btn btn-outline">Log in to book or message this creative</Link>
        </div>
      )}

      {bookingOpen && (
        <form onSubmit={submitBooking} className="card" style={{ maxWidth: 520, marginBottom: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Send a booking request</h3>
          {bookingMsg && <div className="error-banner" style={{ background: 'rgba(36,166,123,0.12)', borderColor: 'var(--emerald)', color: '#bdf0dc' }}>{bookingMsg}</div>}
          <div className="field">
            <label>Project details</label>
            <textarea required value={bookingDetails} onChange={e => setBookingDetails(e.target.value)} placeholder="What do you need help with?" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Start date</label>
              <input type="date" value={bookingStart} onChange={e => setBookingStart(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>End date</label>
              <input type="date" value={bookingEnd} onChange={e => setBookingEnd(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">Send request</button>
        </form>
      )}

      {reviewOpen && (
        <form onSubmit={submitReview} className="card" style={{ maxWidth: 520, marginBottom: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Leave a review</h3>
          {reviewMsg && <div className="error-banner" style={{ background: 'rgba(36,166,123,0.12)', borderColor: 'var(--emerald)', color: '#bdf0dc' }}>{reviewMsg}</div>}
          <div className="field">
            <label>Rating</label>
            <select value={rating} onChange={e => setRating(e.target.value)}>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Comment</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="How was the collaboration?" />
          </div>
          <button className="btn btn-primary" type="submit">Submit review</button>
        </form>
      )}

      <h3 style={{ marginBottom: 16 }}>Portfolio</h3>
      {portfolios.length === 0 ? (
        <div className="empty-state">This creative hasn't published any work yet.</div>
      ) : (
        <div className="portfolio-grid" style={{ marginBottom: 40 }}>
          {portfolios.map(p => (
            <div key={p.id} className="card">
              <div className="portfolio-thumb" style={p.image_url ? { backgroundImage: `url(${p.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
              <h3 style={{ fontSize: '1rem' }}>{p.title}</h3>
              {p.description && <p className="text-muted" style={{ fontSize: '0.88rem', marginTop: 6 }}>{p.description}</p>}
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginBottom: 16 }}>Reviews</h3>
      {reviews.length === 0 ? (
        <div className="empty-state">No reviews yet.</div>
      ) : (
        <div>
          {reviews.map(r => (
            <div key={r.id} className="list-row">
              <div>
                <div style={{ fontWeight: 600 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                {r.comment && <div className="text-muted" style={{ fontSize: '0.88rem', marginTop: 4 }}>{r.comment}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
