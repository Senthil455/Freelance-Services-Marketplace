import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<div className="px-4 py-16 text-center text-gray-500">Landing page coming soon.</div>} />
        <Route path="search" element={<div className="px-4 py-16 text-center text-gray-500">Search results coming here.</div>} />
        <Route path="gig/:id" element={<div className="px-4 py-16 text-center text-gray-500">Gig detail page soon.</div>} />
        <Route path="login" element={<div className="px-4 py-16 text-center text-gray-500">Sign in page soon.</div>} />
        <Route path="register" element={<div className="px-4 py-16 text-center text-gray-500">Create account page soon.</div>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
