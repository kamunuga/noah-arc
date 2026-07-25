import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">African creative networking</span>
            <h1>Every African creative deserves a bigger microscope.</h1>
            <p className="lead">
              Noah Arc is where designers, photographers, videographers, artists and
              musicians build a portfolio, get discovered by clients, and turn craft
              into income — built for the African creative ecosystem, not bolted onto one.
            </p>
            <div className="hero-actions">
              {!user && <Link to="/signup" className="btn btn-primary">Join as a creative or client</Link>}
              <Link to="/browse" className="btn btn-outline">Browse creatives</Link>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-num">6</div>
                <div className="hero-stat-label">core tools, one platform</div>
              </div>
              <div>
                <div className="hero-stat-num">Web + Mobile</div>
                <div className="hero-stat-label">access anywhere</div>
              </div>
              <div>
                <div className="hero-stat-num">Local-first</div>
                <div className="hero-stat-label">built for African markets</div>
              </div>
            </div>
          </div>

          <div className="showcase-stack">
            <div className="showcase-card">
              <div className="showcase-avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>Amara K. — Photographer</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Booked for 3 shoots this month</div>
              </div>
            </div>
            <div className="showcase-card">
              <div className="showcase-avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>Chidi O. — Motion designer</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>4.9★ across 21 reviews</div>
              </div>
            </div>
            <div className="showcase-card">
              <div className="showcase-avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>Naledi M. — Musician</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>2 open collaboration requests</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <span className="eyebrow">What's inside</span>
          <h2>Everything a creative career needs, in one place</h2>
          <p>Six connected tools cover the full journey from portfolio to paid work.</p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="eyebrow">Portfolios</span>
            <h3>Showcase your work</h3>
            <p>Upload projects, organize a public portfolio, and control what's visible to clients.</p>
          </div>
          <div className="feature-card">
            <span className="eyebrow">Job board</span>
            <h3>Find real opportunities</h3>
            <p>Clients post jobs by category and budget; creatives apply with a proposal.</p>
          </div>
          <div className="feature-card">
            <span className="eyebrow">Bookings</span>
            <h3>Get hired directly</h3>
            <p>Clients can book a creative straight from their profile, with accept/reject flows.</p>
          </div>
          <div className="feature-card">
            <span className="eyebrow">Messaging</span>
            <h3>Talk it through</h3>
            <p>Direct messaging between clients and creatives to align on scope before work starts.</p>
          </div>
          <div className="feature-card">
            <span className="eyebrow">Reviews</span>
            <h3>Build your reputation</h3>
            <p>Clients rate completed work, and ratings roll up onto every creative's public profile.</p>
          </div>
          <div className="feature-card">
            <span className="eyebrow">Moderation</span>
            <h3>A trusted marketplace</h3>
            <p>Admins can manage accounts and moderate portfolios and job posts platform-wide.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
