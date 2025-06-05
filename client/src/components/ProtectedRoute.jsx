import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('skillforge_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
