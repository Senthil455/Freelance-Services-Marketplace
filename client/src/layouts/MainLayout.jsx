import { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchMe } from '../store/slices/authSlice.js';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import Navbar from '../components/Navbar.jsx';
import { ShieldCheck } from 'lucide-react';

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const { initialized } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!initialized) dispatch(fetchMe());
  }, [dispatch, initialized]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.svg" alt="SkillForge" className="h-8 w-8" />
              <span className="text-xl font-extrabold tracking-tight text-brand-600">SkillForge</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
              The freelance services marketplace where businesses hire top talent and
              freelancers grow their careers.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <ShieldCheck size={15} className="text-emerald-500" />
              Payments protected on every order
            </div>
          </div>

          <FooterCol
            title="Categories"
            links={[
              'Programming & Tech',
              'Graphic Design',
              'Digital Marketing',
              'Writing & Translation',
              'Video & Animation',
              'AI Services',
            ]}
          />
          <FooterCol
            title="For Freelancers"
            links={['How it works', 'Become a seller', 'Seller resources', 'Community forum', 'Pricing guide']}
          />
          <FooterCol
            title="Company"
            links={['About us', 'Careers', 'Press', 'Trust & safety', 'Contact support']}
          />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} SkillForge. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-medium text-gray-500">
            <Link to="/" className="hover:text-brand-600">Terms of Service</Link>
            <Link to="/" className="hover:text-brand-600">Privacy Policy</Link>
            <Link to="/" className="hover:text-brand-600">Cookie Policy</Link>
            <Link to="/" className="hover:text-brand-600">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-bold uppercase tracking-wide text-gray-800">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l}>
            <Link to={`/search?q=${encodeURIComponent(l)}`} className="text-sm text-gray-500 transition hover:text-brand-600">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}