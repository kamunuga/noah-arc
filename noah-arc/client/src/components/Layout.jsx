import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../AuthContext';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
    >
      {children}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="nav-header">
        <div className="container nav-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark" aria-hidden="true" />
            Noah Arc
          </NavLink>

          <button className="nav-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            ☰
          </button>

          <nav className={`nav-links${menuOpen ? ' nav-links-open' : ''}`}>
            <NavItem to="/browse">Browse creatives</NavItem>
            <NavItem to="/jobs">Job board</NavItem>
            {user?.role === 'creative' && <NavItem to="/my-portfolio">My portfolio</NavItem>}
            {user?.role === 'creative' && <NavItem to="/my-applications">My applications</NavItem>}
            {user?.role === 'client' && <NavItem to="/post-job">Post a job</NavItem>}
            {user?.role === 'client' && <NavItem to="/my-jobs">My job posts</NavItem>}
            {user && <NavItem to="/bookings">Bookings</NavItem>}
            {user && <NavItem to="/messages">Messages</NavItem>}
            {user?.role === 'admin' && <NavItem to="/admin">Admin</NavItem>}

            {!user && <NavItem to="/login">Log in</NavItem>}
            {!user && (
              <NavLink to="/signup" className="btn btn-primary btn-sm">Sign up</NavLink>
            )}
            {user && (
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Log out</button>
            )}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span>Noah Arc — putting African creatives under a bigger microscope.</span>
          <span className="text-muted">Student project · SRS-driven build</span>
        </div>
      </footer>
    </div>
  );
}
