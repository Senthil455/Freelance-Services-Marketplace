import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BadgeCheck, MapPin, MessageSquare, Globe, GraduationCap, Briefcase, Clock, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Avatar from '../components/Avatar.jsx';
import GigCard from '../components/GigCard.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate } from '../utils/format.js';

export default function SellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [profile, setProfile] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/gigs/search?sellerId=${id}&sort=bestSellers&limit=12`),
    ])
      .then(([p, g]) => {
        setProfile(p.data.profile);
        setGigs(g.data.gigs || []);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size={34} /></div>;
  if (!profile) return <div className="py-32 text-center text-gray-500">Seller not found.</div>;

  const startConversation = async () => {
    if (!user) return navigate('/login', { state: { from: `/seller/${id}` } });
    try {
      const { data } = await api.post('/chat/conversations', { sellerId: id });
      if (message.trim()) await api.post(`/chat/conversations/${data.conversation._id}/messages`, { text: message.trim() });
      toast.success('Conversation started');
      navigate(`/dashboard/messages/${data.conversation._id}`);
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar user={profile} size={96} className="ring-4 ring-white/20" />
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-white">
              {profile.name}
              {profile.verifiedSeller && <BadgeCheck size={22} className="text-brand-400" />}
            </h1>
            <p className="mt-1 text-sm text-gray-300">{profile.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-300">
              {profile.location && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {profile.location}</span>}
              <span className="inline-flex items-center gap-1"><Clock size={13} /> Member since {formatDate(profile.createdAt)}</span>
              <span className="inline-flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /> {(profile.rating || 0).toFixed(1)} rating</span>
              <span className="capitalize inline-flex items-center gap-1"><Globe size={13} /> {profile.isSeller ? 'Seller' : 'Buyer'}</span>
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6 sm:text-center">
            <Stat value={profile.stats?.ordersCompleted ?? 0} label="Orders done" />
            <Stat value={formatCompact(profile.stats?.totalEarnings ?? 0)} label="Earned" />
            <Stat value={`${profile.stats?.onTimeDelivery ?? 0}%`} label="On-time" />
            <Stat value={`${profile.stats?.responseTime ?? 12}h`} label="Response" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <h2 className="h2 text-gray-900">About me</h2>
          <div className="mt-4 whitespace-pre-line rounded-xl border border-gray-200 bg-white p-6 text-[15px] leading-relaxed text-gray-700">
            {profile.bio || 'This seller has not added a bio yet.'}
          </div>

          {profile.skills?.length > 0 && (
            <div className="mt-8">
              <h2 className="h2 text-gray-900">Skills</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100">
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="h2 text-gray-900">Services by {profile.name.split(' ')[0]}</h2>
            {gigs.length === 0 ? (
              <div className="mt-4"><EmptyState title="No active services" subtitle="Check back soon — this seller is adding new services." /></div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {gigs.map((gig) => <GigCard key={gig._id} gig={gig} />)}
              </div>
            )}
          </div>
        </div>

        <aside>
          <div className="card sticky top-24 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Contact seller</h3>
            <label className="label mt-4">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder={`Ask ${profile.name.split(' ')[0]} about their services…`} className="input resize-none" />
            <button onClick={startConversation} className="btn-primary mt-3 w-full">
              <MessageSquare size={15} /> Send message
            </button>
            <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-xs text-gray-500">
              {profile.languages?.length > 0 && (
                <p className="flex items-center gap-2"><Globe size={14} /> Speaks {profile.languages.map((l) => l.name).join(', ')}</p>
              )}
              {profile.stats?.ordersCompleted > 0 && (
                <p className="flex items-center gap-2"><Star size={14} className="text-amber-400" /> {profile.stats.ordersCompleted} orders completed</p>
              )}
            </div>
          </div>

          {(profile.education?.length > 0 || profile.employment?.length > 0) && (
            <div className="card mt-6 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Background</h3>
              {profile.education?.map((e, i) => (
                <div key={i} className="mt-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-gray-800"><GraduationCap size={15} className="text-brand-600" /> {e.school}</p>
                  <p className="ml-6 text-xs text-gray-500">{e.degree} · {e.startYear}–{e.endYear || 'Present'}</p>
                </div>
              ))}
              {profile.employment?.map((j, i) => (
                <div key={`j${i}`} className="mt-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-gray-800"><Briefcase size={15} className="text-brand-600" /> {j.title} @ {j.company}</p>
                  <p className="ml-6 text-xs text-gray-500">{j.startDate}–{j.endDate || 'Present'}</p>
                  {j.description && <p className="mt-1 text-xs leading-relaxed text-gray-600">{j.description}</p>}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-xl font-extrabold text-white">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-gray-400">{label}</p>
    </div>
  );
}

function formatCompact(n) {
  if (!n) return '$0';
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n}`;
}