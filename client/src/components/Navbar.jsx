import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ChevronDown, LayoutDashboard, LogOut, Megaphone, MessageSquare,
  Settings, ShoppingBag, Heart, Search, X, Menu,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { logoutUser } from '../store/slices/authSlice.js';
import Avatar from './Avatar.jsx';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    setOpen(false);
  };

  const goTo = (path) => {
    setOpen(false);
    setMobileMenu(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate('/');
      toast.success('Logged out');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6" ref={ref}>
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img src="/favicon.svg" alt="SkillForge" className="h-8 w-8" />
          <span className="text-xl font-extrabold tracking-tight text-brand-600">SkillForge</span>
        </Link>

        <button
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle menu"
        >
          {mobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>

        <form onSubmit={onSearch} className="hidden flex-1 max-w-xl lg:flex">
          <div className="relative w-full">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search "web design"…'
              className="input !rounded-r-none !pr-9"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <button type="submit" className="btn-primary -ml-px !rounded-l-none">Search</button>
          </div>
        </form>

        <nav className="ml-auto hidden items-center gap-5 lg:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-full p-1 transition hover:bg-gray-100"
              >
                <Avatar user={user} size={34} />
                <ChevronDown size={15} className="text-gray-500" />
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lift">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm font-bold text-gray-800">{user.name}</p>
                    <p className="truncate text-xs text-gray-400">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <MenuItem icon={<LayoutDashboard size={16} />} label="Dashboard" onClick={() => goTo('/dashboard')} />
                    <MenuItem icon={<ShoppingBag size={16} />} label="My Orders" onClick={() => goTo('/dashboard/orders')} />
                    <MenuItem icon={<Megaphone size={16} />} label="My Gigs" onClick={() => goTo('/dashboard/gigs')} />
                    <MenuItem icon={<MessageSquare size={16} />} label="Messages" onClick={() => goTo('/dashboard/messages')} />
                    <MenuItem icon={<Heart size={16} />} label="Wishlist" onClick={() => goTo('/dashboard/wishlist')} />
                    <MenuItem icon={<Settings size={16} />} label="Settings" onClick={() => goTo('/dashboard/settings')} />
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-brand-600">Sign in</Link>
              <Link to="/register" className="btn-secondary !py-2">Register</Link>
            </>
          )}
        </nav>
      </div>

      {mobileMenu && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
          <form onSubmit={onSearch} className="mb-4 flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="input"
            />
            <button type="submit" className="btn-primary shrink-0"><Search size={16} /></button>
          </form>
          {user ? (
            <div className="grid gap-1">
              <button onClick={() => goTo('/dashboard')} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100">Dashboard</button>
              <button onClick={() => goTo('/dashboard/orders')} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100">My Orders</button>
              <button onClick={() => goTo('/dashboard/gigs')} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100">My Gigs</button>
              <button onClick={() => goTo('/dashboard/messages')} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100">Messages</button>
              <button onClick={() => goTo('/dashboard/settings')} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100">Settings</button>
              <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50">Sign Out</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-secondary flex-1 justify-center">Sign in</Link>
              <Link to="/register" className="btn-primary flex-1 justify-center">Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
    >
      <span className="text-gray-500">{icon}</span>
      {label}
    </button>
  );
}
