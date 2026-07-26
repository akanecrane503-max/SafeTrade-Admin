import { Navigate, Outlet } from 'react-router-dom';
import { AUTH_TOKEN_KEY, ROUTES } from '../utils/constants';

// Wraps protected route groups. Redirects to /login when no token is present.
// Swap the token check for a real auth hook (useAuth) once auth.js is wired up.
export default function ProtectedRoute() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
