import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BadgeCheck, ChevronLeft, ChevronRight, Clock, Heart, MessageSquare,
  Package, ShieldCheck, Star, CheckCircle2, Share2, FileText, X, Zap,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Avatar from '../components/Avatar.jsx';
import RatingStars from '../components/RatingStars.jsx';
import Spinner from '../components/Spinner.jsx';
import GigCard from '../components/GigCard.jsx';
import { formatPrice, timeAgo, formatDate } from '../utils/format.js';

const PACKAGES = [
  { key: 'basic', label: 'Basic', dot: 'bg-emerald-500' },
  { key: 'standard', label: 'Standard', dot: 'bg-brand-600' },
  { key: 'premium', label: 'Premium', dot: 'bg-purple-500' },
];

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const favorites = useSelector((s) => s.ui.favorites);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageIdx, setImageIdx] = useState(0);
  const [packageKey, setPackageKey] = useState('basic');
  const [orderOpen, setOrderOpen] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMsg, setContactMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/gigs/${id}`)
      .then(({ data }) => {
        setData(data);
        setPackageKey('basic');
        setImageIdx(0);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size={34} /></div>;
  if (!data) return <div className="py-32 text-center text-gray-500">Gig not found.</div>;

  const { gig, reviews, ratingBreakdown, related, sellerMonthlyDeliveries } = data;
  const isOwner = user && gig.seller && gig.seller._id === user.id;
  const pkg = gig.packages[packageKey];
  const isFavorite = user ? favorites.includes(gig._id) : false;
  const avg = gig.rating;
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratingBreakdown?.find((r) => r._id === star)?.count || 0,
  }));
  const maxCount = Math.max(1, ...breakdown.map((b) => b.count));

  const toggleFavorite = async () => {
    if (!user) return toast.info('Please sign in to save gigs');
    try {
      const { data } = await api.post('/users/favorites/toggle', { gigId: gig._id });
      toast.success(data.isFavorite ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (err) { toast.error(err.message); }
  };

  const openOrder = () => {
    if (!user) return navigate('/login', { state: { from: `/gig/${gig._id}` } });
    if (!user.isSeller && user.role !== 'seller') setOrderOpen(true);
    else setOrderOpen(true);
  };

  const placeOrder = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders', { gigId: gig._id, packageName: packageKey, requirements });
      toast.success('Order created! Proceed to checkout.');
      navigate(`/checkout/${data.order._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally { setSubmitting(false); }
  };

  const startContact = () => {
    if (!user) return navigate('/login', { state: { from: `/gig/${gig._id}` } });
    setContactOpen(true);
  };

  const sendContact = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/chat/conversations', { sellerId: gig.seller._id, gigId: gig._id });
      if (contactMsg.trim()) {
        await api.post(`/chat/conversations/${data.conversation._id}/messages`, { text: contactMsg.trim() });
      }
      toast.success('Conversation started');
      navigate(`/dashboard/messages/${data.conversation._id}`);
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-600">Home</Link> /
        <Link to={`/category/${gig.category?.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="hover:text-brand-600 truncate">{gig.category}</Link> /
        <span className="truncate text-gray-700">{gig.subCategory || 'Services'}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
        <div className="min-w-0">
          <h1 className="h1 text-gray-900">{gig.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <RatingStars rating={avg} count={gig.ratingCount} />
            <span className="text-sm text-gray-500">{gig.sales} orders in queue</span>
            <span className="hidden text-gray-300 sm:inline">|</span>
            <span className="text-sm text-gray-500">{formatPrice(pkg?.price ?? gig.packages.basic.price)} starting price</span>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="relative aspect-[16/9] bg-gray-900">
              <img src={gig.images?.[imageIdx] || 'https://placehold.co/1200x675?text=SkillForge'} alt={gig.title} className="h-full w-full object-cover" />
              {gig.images?.length > 1 && (
                <>
                  <button onClick={() => setImageIdx((idx) => (idx - 1 + gig.images.length) % gig.images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow transition hover:scale-105" aria-label="Previous image">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImageIdx((idx) => (idx + 1) % gig.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow transition hover:scale-105" aria-label="Next image">
                    <ChevronRight size={18} />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                    {imageIdx + 1} / {gig.images.length}
                  </span>
                </>
              )}
            </div>
            {gig.images?.length > 1 && (
              <div className="flex gap-2 p-3">
                {gig.images.map((img, i) => (
                  <button key={i} onClick={() => setImageIdx(i)} className={`h-16 w-24 overflow-hidden rounded-lg border-2 transition ${i === imageIdx ? 'border-brand-600' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Link to={`/seller/${gig.seller._id}`}>
              <Avatar user={gig.seller} size={56} />
            </Link>
            <div className="min-w-0">
              <Link to={`/seller/${gig.seller._id}`} className="flex items-center gap-1.5 text-lg font-bold text-gray-900 hover:underline">
                {gig.seller.name}
                {gig.seller.verifiedSeller && <BadgeCheck size={18} className="text-brand-500" />}
              </Link>
              <p className="truncate text-sm text-gray-500">{gig.seller.tagline}</p>
            </div>
            <div className="ml-auto hidden text-right sm:block">
              <p className="text-sm font-bold text-gray-700">{sellerMonthlyDeliveries} deliveries</p>
              <p className="text-xs text-gray-400">in the last 30 days</p>
            </div>
          </div>

          <Section title="About this service">
            <div className="space-y-3 whitespace-pre-line text-[15px] leading-relaxed text-gray-700">{gig.description}</div>
            {gig.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {gig.tags.map((t) => (
                  <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-brand-50 hover:text-brand-700">
                    {t}
                  </Link>
                ))}
              </div>
            )}
          </Section>

          {gig.requirements?.length > 0 && (
            <Section title="What you'll need to provide">
              <ul className="space-y-2.5">
                {gig.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] text-gray-700">
                    <FileText size={17} className="mt-0.5 shrink-0 text-gray-400" /> {r}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {gig.faqs?.length > 0 && (
            <Section title="FAQs">
              <div className="space-y-3">
                {gig.faqs.map((f, i) => (
                  <details key={i} className="group rounded-xl border border-gray-200 bg-white p-5 open:shadow-card">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-gray-800">
                      {f.question}
                      <span className="text-gray-400 transition group-open:rotate-45">＋</span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{f.answer}</p>
                  </details>
                ))}
              </div>
            </Section>
          )}

          <Section title={`Reviews (${gig.ratingCount})`}>
            <div className="grid gap-8 md:grid-cols-[240px_1fr]">
              <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
                <p className="text-4xl font-extrabold text-gray-900">{avg ? avg.toFixed(1) : '—'}</p>
                <div className="mt-1 flex justify-center"><RatingStars rating={avg} /></div>
                <p className="mt-1 text-xs text-gray-400">{gig.ratingCount} ratings</p>
                <div className="mt-4 space-y-1.5 text-left">
                  {breakdown.map((b) => (
                    <div key={b.star} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-8 shrink-0">{b.star}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${(b.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="w-6 text-right">{b.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {reviews?.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No reviews yet — be the first to order!</p>}
                {reviews?.map((r) => (
                  <div key={r._id} className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <Avatar user={r.reviewer} size={38} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-800">{r.reviewer?.name}</p>
                        <p className="text-xs text-gray-400">{r.country || ''} · {timeAgo(r.createdAt)}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                        <Star size={12} className="fill-amber-400 text-amber-400" /> {r.rating}.0
                      </div>
                    </div>
                    {r.text && <p className="mt-3 text-sm leading-relaxed text-gray-600">{r.text}</p>}
                    {r.communication && (
                      <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-semibold text-gray-400">
                        <span>Communication <span className="text-gray-600">★★★★★</span></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        <aside className="mt-10 lg:mt-0">
          <div className="lg:sticky lg:top-24">
            <div className="card overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Compare packages</h3>
              </div>

              <div className="space-y-3 p-5">
                {PACKAGES.map((p) => {
                  const pkgData = gig.packages[p.key];
                  const selected = packageKey === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setPackageKey(p.key)}
                      className={`w-full rounded-xl border-2 p-4 text-left transition ${selected ? 'border-brand-600 bg-brand-50/40' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
                          <span className={`h-2.5 w-2.5 rounded-full ${p.dot}`} /> {pkgData.title || p.label}
                        </span>
                        <span className="text-lg font-extrabold text-gray-900">{formatPrice(pkgData.price)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{pkgData.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-gray-500">
                        <span className="inline-flex items-center gap-1"><Clock size={13} /> {pkgData.deliveryDays} day{pkgData.deliveryDays > 1 ? 's' : ''}</span>
                        <span className="inline-flex items-center gap-1"><Package size={13} /> {pkgData.revisions} revision{pkgData.revisions !== 1 ? 's' : ''}</span>
                      </div>
                    </button>
                  );
                })}

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">What's included</p>
                  <ul className="mt-3 space-y-2">
                    {(pkg.features || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <button onClick={openOrder} className="btn-primary w-full !py-3">
                  Continue <Zap size={15} />
                </button>

                <div className="flex gap-2">
                  <button onClick={toggleFavorite} className={`btn-secondary flex-1 ${isFavorite ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : ''}`}>
                    <Heart size={15} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} /> {isFavorite ? 'Saved' : 'Save'}
                  </button>
                  <button onClick={startContact} className="btn-secondary flex-1">
                    <MessageSquare size={15} /> Contact
                  </button>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 px-5 py-4 text-xs text-gray-500">
                <p className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-500" /> Payment secured — funds held until you approve the work</p>
                <p className="flex items-center gap-2"><Clock size={15} className="text-gray-400" /> Average response time: {gig.seller.stats?.responseTime ?? 12}h</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {related?.length > 0 && (
        <div className="mt-16">
          <h2 className="h2 text-gray-900">Related services</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((g) => <GigCard key={g._id} gig={g} />)}
          </div>
        </div>
      )}

      {orderOpen && (
        <Modal title="Order this service" onClose={() => setOrderOpen(false)}>
          <p className="text-sm text-gray-600">{gig.title}</p>
          <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
            <span className="font-bold text-gray-800">{pkg.title}</span>
            <span className="float-right font-extrabold text-gray-900">{formatPrice(pkg.price)}</span>
          </div>
          <label className="label mt-4">Project requirements</label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={4}
            placeholder="Describe your project, goals and anything the seller should know…"
            className="input resize-none"
          />
          <button onClick={placeOrder} disabled={submitting} className="btn-primary mt-4 w-full !py-3">
            {submitting ? <Spinner size={17} className="text-white" /> : 'Continue to checkout'}
          </button>
        </Modal>
      )}

      {contactOpen && (
        <Modal title={`Message ${gig.seller.name}`} onClose={() => setContactOpen(false)}>
          <label className="label">Your message</label>
          <textarea value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} rows={4} placeholder={`Hi ${gig.seller.name.split(' ')[0]}, I'm interested in your gig "${gig.title.slice(0, 50)}…"`} className="input resize-none" />
          <button onClick={sendContact} disabled={submitting} className="btn-primary mt-4 w-full !py-3">
            {submitting ? <Spinner size={17} className="text-white" /> : 'Start conversation'}
          </button>
        </Modal>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-10 border-t border-gray-200 pt-8 first:border-t-0 first:pt-0">
      <h2 className="h2 text-lg text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-lift sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}