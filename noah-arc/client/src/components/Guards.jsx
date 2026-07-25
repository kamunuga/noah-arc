import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: 60 }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: 60 }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
