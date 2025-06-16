import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Menu } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  const onSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
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
              placeholder="Search services…"
              className="input !rounded-r-none !pr-9"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <button type="submit" className="btn-primary -ml-px !rounded-l-none">
              Search
            </button>
          </div>
        </form>

        <nav className="ml-auto hidden items-center gap-5 lg:flex">
          <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-brand-600">Sign in</Link>
          <Link to="/register" className="btn-secondary !py-2">Register</Link>
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
            <button type="submit" className="btn-primary shrink-0">
              <Search size={16} />
            </button>
          </form>
          <div className="flex gap-2">
            <Link to="/login" className="btn-secondary flex-1 justify-center">Sign in</Link>
            <Link to="/register" className="btn-primary flex-1 justify-center">Register</Link>
          </div>
        </div>
      )}
    </header>
  );
}
