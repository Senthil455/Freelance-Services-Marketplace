import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Compass size={36} />
      </div>
      <h1 className="mt-6 text-6xl font-extrabold tracking-tight text-gray-900">404</h1>
      <p className="mt-2 text-xl font-bold text-gray-800">Page not found</p>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-primary">Back to home</Link>
        <Link to="/search" className="btn-secondary">Browse services</Link>
      </div>
    </div>
  );
}