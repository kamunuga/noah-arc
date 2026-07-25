import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container section">
      <span className="eyebrow">Dashboard</span>
      <h2 style={{ marginTop: 8, marginBottom: 6 }}>Welcome back, {user.name.split(' ')[0]}</h2>
      <p className="text-muted" style={{ marginBottom: 32 }}>
        {user.role === 'creative'
          ? 'Manage your portfolio, track applications, and stay on top of bookings.'
          : 'Post jobs, book creatives, and manage your active collaborations.'}
      </p>

      <div className="feature-grid">
        {user.role === 'creative' && (
          <>
            <Link to="/my-portfolio" className="feature-card">
              <span className="eyebrow">Portfolio</span>
              <h3>Manage your work</h3>
              <p>Upload new pieces or update what's published.</p>
            </Link>
            <Link to="/my-applications" className="feature-card">
              <span className="eyebrow">Jobs</span>
              <h3>My applications</h3>
              <p>Track the status of jobs you've applied to.</p>
            </Link>
          </>
        )}
        {user.role === 'client' && (
          <>
            <Link to="/post-job" className="feature-card">
              <span className="eyebrow">Hiring</span>
              <h3>Post a job</h3>
              <p>Describe what you need and start receiving applications.</p>
            </Link>
            <Link to="/my-jobs" className="feature-card">
              <span className="eyebrow">Hiring</span>
              <h3>My job posts</h3>
              <p>Review applicants and manage open roles.</p>
            </Link>
            <Link to="/browse" className="feature-card">
              <span className="eyebrow">Discover</span>
              <h3>Browse creatives</h3>
              <p>Find and book a creative directly for your project.</p>
            </Link>
          </>
        )}
        <Link to="/bookings" className="feature-card">
          <span className="eyebrow">Bookings</span>
          <h3>Your bookings</h3>
          <p>Accept, track, and manage collaboration bookings.</p>
        </Link>
        <Link to="/messages" className="feature-card">
          <span className="eyebrow">Inbox</span>
          <h3>Messages</h3>
          <p>Continue conversations with clients and creatives.</p>
        </Link>
      </div>
    </div>
  );
}
