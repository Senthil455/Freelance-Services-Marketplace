import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code, Palette, Megaphone, PenLine, Film, Music, Briefcase, Bot, Search, Zap, Star, ShieldCheck, Headphones } from 'lucide-react';
import api from '../api/client.js';
import GigCard from '../components/GigCard.jsx';
import Spinner from '../components/Spinner.jsx';
import { imgUrl } from '../utils/format.js';

const CATEGORY_ICONS = { Code, Palette, Megaphone, PenLine, Film, Music, Briefcase, Bot };

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [popularGigs, setPopularGigs] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/gigs/search', { params: { sort: 'bestSellers', limit: 12 } }),
      api.get('/gigs/search', { params: { sort: 'topRated', limit: 8 } }),
    ])
      .then(([cat, best, rated]) => {
        setCategories(cat.data);
        setPopularGigs(best.data.gigs);
        setTopRated(rated.data.gigs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-32"><Spinner size={34} /></div>;
  }

  return (
    <main>
      <section className="bg-gradient-to-b from-brand-50 to-white py-20 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight text-gray-900">
          Your next big idea starts with a great service.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          Find the right talent for design, development, writing, video and more on SkillForge.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/search" className="btn-primary">
            <Search size={16} /> Explore services
          </Link>
          <Link to="/register" className="btn-secondary">Become a seller</Link>
        </div>
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-500" /> Escrow protected</span>
          <span className="inline-flex items-center gap-1.5"><Headphones size={15} className="text-brand-500" /> 24/7 support</span>
          <span className="inline-flex items-center gap-1.5"><Zap size={15} className="text-amber-500" /> Fast delivery</span>
          <span className="inline-flex items-center gap-1.5"><Star size={15} className="text-amber-400" /> Top rated sellers</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900">Browse by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug] || Briefcase;
            return (
              <Link to={`/category/${c.slug}`} key={c._id} className="card group flex items-center gap-3 p-4 transition hover:shadow-lift">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{c.name}</p>
                  <p className="line-clamp-1 text-xs text-gray-500">{c.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Popular services</h2>
            <p className="mt-1 text-sm text-gray-500">Handpicked gigs our buyers love.</p>
          </div>
          <Link to="/search" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {popularGigs.map((gig) => <GigCard key={gig._id} gig={gig} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Star size={22} className="text-amber-400" /> Top rated gigs
            </h2>
            <p className="mt-1 text-sm text-gray-500">The highest quality services.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {topRated.map((gig) => <GigCard key={gig._id} gig={gig} />)}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">How SkillForge works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Step number="1" title="Browse services" desc="Explore services by category or search for exactly what you need." />
            <Step number="2" title="Order in minutes" desc="Pick a package that fits and place your order securely." />
            <Step number="3" title="Approve your delivery" desc="Review the work and release payment once you are happy." />
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{number}</div>
      <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}
