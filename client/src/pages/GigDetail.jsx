import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Avatar from '../components/Avatar.jsx';
import RatingStars from '../components/RatingStars.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatPrice } from '../utils/format.js';

export default function GigDetail() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/gigs/${id}`)
      .then(({ data }) => setGig(data.gig))
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size={34} /></div>;
  if (error) return <div className="mx-auto max-w-lg py-24 text-center"><p className="text-lg font-bold text-gray-800">Gig unavailable</p><p className="mt-2 text-sm text-gray-500">{error}</p></div>;
  if (!gig) return null;

  const basic = gig.packages?.basic;

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
            <button type="button" className="btn-primary mt-5 w-full" onClick={() => toast.info('Order flow coming soon')}>
              Continue to order
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
