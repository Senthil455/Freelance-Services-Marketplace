import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BadgeCheck, Check, Eye, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Avatar from '../components/Avatar.jsx';
import RatingStars from '../components/RatingStars.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatPrice } from '../utils/format.js';

const PACKAGE_ORDER = ['basic', 'standard', 'premium'];

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('basic');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/gigs/${id}`)
      .then(({ data }) => setGig(data.gig))
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', { gigId: gig._id, package: selected });
      const orderId = data.order?.orderId || data.order?._id;
      toast.success('Order placed');
      navigate(`/checkout/${orderId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size={34} /></div>;
  if (error) return <div className="mx-auto max-w-lg py-24 text-center"><p className="text-lg font-bold text-gray-800">Gig unavailable</p><p className="mt-2 text-sm text-gray-500">{error}</p></div>;
  if (!gig) return null;

  const basic = gig.packages?.basic;
  const reviews = gig.reviews || [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl bg-gray-100">
            <img src={gig.images?.[0]} alt={gig.title} className="aspect-video w-full object-cover" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">{gig.title}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
            <RatingStars rating={gig.rating} count={gig.ratingCount} />
            <span className="inline-flex items-center gap-1"><Eye size={13} /> {gig.views ?? 0} views</span>
          </div>
          <p className="mt-5 leading-relaxed text-gray-700">{gig.description}</p>

          <section className="mt-10 border-t border-gray-100 pt-8">
            <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
            {reviews.length > 0 ? (
              <>
                <div className="mt-4 grid gap-6 sm:grid-cols-[240px_1fr]">
                  <div className="card h-fit p-5 text-center">
                    <p className="text-4xl font-extrabold text-gray-900">{gig.rating?.toFixed(1) || '—'}/5</p>
                    <RatingStars rating={gig.rating} />
                    <p className="mt-2 text-sm text-gray-500">{reviews.length} reviews</p>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <Bar key={star} star={star} total={reviews.length} reviews={reviews} />
                    ))}
                  </div>
                </div>
                <div className="mt-8 space-y-6">
                  {reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-500">No reviews yet.</p>
            )}
          </section>
        </div>

        <aside>
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <Avatar user={gig.seller} size={44} />
              <div>
                <p className="flex items-center gap-1 text-sm font-bold text-gray-800">
                  {gig.seller?.name}
                  {gig.seller?.verifiedSeller && <BadgeCheck size={15} className="text-brand-500" />}
                </p>
                <p className="text-xs text-gray-500">Seller</p>
              </div>
            </div>
            {basic && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="text-sm font-bold text-gray-800">Basic package</p>
                <p className="mt-1 text-xs text-gray-500">{basic.description}</p>
                <p className="mt-3 text-2xl font-extrabold text-gray-900">{formatPrice(basic.price)}</p>
                <p className="mt-1 text-xs text-gray-500">Delivery in {basic.deliveryDays} days · {basic.revisions} revisions</p>
              </div>
            )}
            <button type="button" className="btn-primary mt-5 w-full" onClick={() => { setSelected('basic'); setOpen(true); }}>
              Continue to order
            </button>
          </div>
        </aside>
      </div>

      {open && (
        <OrderModal
          gig={gig}
          selected={selected}
          setSelected={setSelected}
          placing={placing}
          onClose={() => setOpen(false)}
          onPlace={placeOrder}
        />
      )}
    </main>
  );
}

function Bar({ star, total, reviews }) {
  const count = reviews.filter((r) => Math.round(r.rating) === star).length;
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500">
      <span className="w-8 shrink-0 text-right font-semibold">{star}★</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0">{count}</span>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="border-b border-gray-100 pb-6">
      <div className="flex items-center gap-2">
        <Avatar user={review.user} size={32} />
        <div>
          <p className="text-sm font-bold text-gray-800">{review.user?.name}</p>
          <RatingStars rating={review.rating} />
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{review.comment}</p>
    </div>
  );
}

function OrderModal({ gig, selected, setSelected, placing, onClose, onPlace }) {
  const selectedPkg = gig.packages?.[selected];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">Choose a package</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
          {PACKAGE_ORDER.map((key) => {
            const pkg = gig.packages?.[key];
            if (!pkg) return null;
            const active = selected === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  active ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold capitalize text-gray-800">{key}</p>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(pkg.price)}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{pkg.description}</p>
                <p className="mt-2 text-xs text-gray-500">Delivery in {pkg.deliveryDays} days · {pkg.revisions} revisions</p>
                <ul className="mt-2 grid gap-1">
                  {(pkg.features || []).map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600"><Check size={12} className="text-emerald-500" /> {f}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-extrabold text-gray-900">{formatPrice(selectedPkg?.price)}</p>
          </div>
          <button className="btn-primary" disabled={placing} onClick={onPlace}>
            {placing ? <Spinner size={16} className="text-white" /> : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  );
}
