import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code, Palette, Megaphone, PenLine, Film, Music, Briefcase, Bot,
  ArrowRight, Search, ShieldCheck, Headphones, Star, Zap, TrendingUp, Award,
} from 'lucide-react';
import api from '../api/client.js';
import GigCard from '../components/GigCard.jsx';
import Spinner from '../components/Spinner.jsx';

const CATEGORY_ICONS = { code: Code, palette: Palette, megaphone: Megaphone, pen: PenLine, video: Film, music: Music, briefcase: Briefcase, bot: Bot };

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [popularGigs, setPopularGigs] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/gigs/search?sort=bestSellers&limit=12'),
      api.get('/gigs/search?sort=topRated&limit=8'),
    ])
      .then(([cats, pop, top]) => {
        setCategories(cats.data.categories || []);
        setPopularGigs(pop.data.gigs || []);
        setTopRated(top.data.gigs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>
      <Hero onSearch={onSearch} query={query} setQuery={setQuery} />

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="h2 text-gray-900">Popular services</h2>
            <p className="mt-1 text-sm text-gray-500">Browse what freelance clients are ordering right now</p>
          </div>
          <Link to="/search" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:underline sm:inline-flex">
            See all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {CATEGORY_ICONS && Object.keys(CATEGORY_ICONS).length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-4">
              {categories.filter((c) => c.popular).slice(0, 8).map((c) => {
                const Icon = CATEGORY_ICONS[c.icon] || Code;
                return (
                  <Link
                    key={c._id}
                    to={`/category/${c.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-card transition hover:border-brand-300 hover:shadow-lift"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                      <Icon size={19} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-800">{c.name}</p>
                      <p className="truncate text-xs text-gray-400">{c.subCategories?.slice(0, 3).join(' · ')}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={32} /></div>
      ) : (
        <>
          <Section title="Trending gigs" subtitle="Hand-picked by our editors for quality and speed">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {popularGigs.slice(0, 8).map((gig) => <GigCard key={gig._id} gig={gig} />)}
            </div>
          </Section>

          <Section title="Top rated freelancers" subtitle="Proven sellers with outstanding reviews">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {topRated.map((gig) => <GigCard key={gig._id} gig={gig} />)}
            </div>
          </Section>
        </>
      )}

      <HowItWorks />

      <CTASection />
    </div>
  );
}

function Hero({ onSearch, query, setQuery }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800">
      <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-100">
            <Zap size={13} /> 700+ categories · 50k+ freelancers · 2M+ deliveries
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Find the perfect freelance service for your next big idea
          </h1>
          <p className="mt-4 max-w-xl text-lg text-brand-100">
            From logo design to full-stack development — hire verified freelancers or sell your own services. Delivered fast, protected by our payment guarantee.
          </p>

          <form onSubmit={onSearch} className="mt-8 flex max-w-xl overflow-hidden rounded-xl bg-white shadow-lift">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search "logo design" or "React developer"…'
                className="w-full bg-transparent py-4 pl-11 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <button type="submit" className="bg-brand-600 px-7 text-sm font-bold text-white transition hover:bg-brand-700">
              Search
            </button>
          </form>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-6">
            {[
              ['2M+', 'Orders delivered'],
              ['700+', 'Service categories'],
              ['4.9/5', 'Average rating'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-extrabold text-white">{v}</p>
                <p className="mt-0.5 text-xs font-medium text-brand-200">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
      <h2 className="h2 text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Search, title: 'Find the right service', text: 'Search hundreds of categories, compare prices and reviews, and pick the freelancer that fits.' },
    { icon: ShieldCheck, title: 'Pay securely, order instantly', text: 'Your payment is held in escrow until you are happy with the delivered work.' },
    { icon: Headphones, title: 'Chat, collaborate, deliver', text: 'Work directly with your freelancer in our built-in messenger until delivery.' },
    { icon: Star, title: 'Rate & review', text: 'Approve the work, rate the experience and help the community grow.' },
  ];
  return (
    <section className="mt-20 border-t border-gray-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="h2 text-center text-gray-900">How SkillForge works</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-500">
          A safe, simple way to scale your business with freelance talent — or grow your own freelance career.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
              <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
                {i + 1}
              </span>
              <s.icon size={22} className="text-brand-600" />
              <h3 className="mt-3 text-base font-bold text-gray-800">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-14 text-center sm:px-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-200">
            <Award size={13} /> For freelancers
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Turn your skills into a thriving freelance business
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-300">
            Create a gig in minutes, reach millions of buyers, and get paid securely on time — every time.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn-primary !px-7 !py-3 !text-base bg-brand-500 hover:bg-brand-400">
              Become a seller <ArrowRight size={17} />
            </Link>
            <Link to="/dashboard/gigs" className="btn-secondary !px-7 !py-3 !text-base border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/30">
              Explore seller tools
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1.5"><TrendingUp size={14} className="text-emerald-400" /> Earn on your own terms</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Escrow-protected payouts</span>
            <span className="inline-flex items-center gap-1.5"><Star size={14} className="text-amber-400" /> Rank by quality, not seniority</span>
          </div>
        </div>
      </div>
    </section>
  );
}