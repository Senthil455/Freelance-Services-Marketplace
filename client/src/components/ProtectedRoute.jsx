import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchMe } from '../store/slices/authSlice.js';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import { FullPageLoader } from './Spinner.jsx';

export default function ProtectedRoute({ adminOnly = false }) {
  const dispatch = useAppDispatch();
  const { user, initialized } = useSelector((s) => s.auth);
  const location = useLocation();

  useEffect(() => {
    if (!initialized) dispatch(fetchMe());
  }, [dispatch, initialized]);

  if (!initialized) return <FullPageLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}