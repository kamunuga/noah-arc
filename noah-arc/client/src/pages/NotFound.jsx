import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <span className="eyebrow">404</span>
      <h2 style={{ marginTop: 10, marginBottom: 14 }}>This page doesn't exist</h2>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </div>
  );
}
