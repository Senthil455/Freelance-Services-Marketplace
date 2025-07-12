import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BadgeCheck, Calendar, MapPin, Star, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Avatar from '../components/Avatar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import GigCard from '../components/GigCard.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatDate, imgUrl } from '../utils/format.js';

export default function SellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${id}`)
      .then(({ data }) => setSeller(data.user))
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  const startChat = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await api.post('/chat/conversations', { sellerId: id });
      navigate(`/dashboard/messages?conv=${data.conversation?._id || ''}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size={34} /></div>;
  if (error) return <div className="mx-auto max-w-lg py-24 text-center"><p className="text-lg font-bold text-gray-800">Profile unavailable</p><p className="mt-2 text-sm text-gray-500">{error}</p></div>;
  if (!seller) return null;

  const average = seller.ratings?.average;
  const gigs = seller.gigs || [];
  const skills = seller.skills || [];

  return (
    <main>
      <div className="relative h-44 bg-gradient-to-r from-brand-600 to-brand-400">
        {seller.coverImage && <img src={imgUrl(seller.coverImage)} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="rounded-full ring-4 ring-white"><Avatar user={seller} size={96} /></div>
            <div className="pb-1">
              <h1 className="flex items-center gap-1.5 text-2xl font-extrabold text-gray-900">
                {seller.name}
                {seller.verifiedSeller && <BadgeCheck size={20} className="text-brand-500" />}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1"><Star size={13} className="text-amber-400" /> {average ? `${average} / 5` : 'New seller'}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={13} /> {seller.location || 'Remote'}</span>
                <span className="inline-flex items-center gap-1"><Calendar size={13} /> Member since {formatDate(seller.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-8 pb-1 text-center">
            <div><p className="text-2xl font-extrabold text-gray-900">{seller.sales ?? 0}</p><p className="text-xs text-gray-500">Sales</p></div>
            <div><p className="text-2xl font-extrabold text-gray-900">{seller.reviewCount ?? 0}</p><p className="text-xs text-gray-500">Reviews</p></div>
            <div><p className="text-2xl font-extrabold text-gray-900">{seller.orders ?? 0}</p><p className="text-xs text-gray-500">Orders</p></div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-10">
            {seller.bio && (
              <section>
                <h2 className="text-xl font-bold text-gray-900">About the seller</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600">{seller.bio}</p>
              </section>
            )}
            {skills.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((s) => <span key={s} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{s}</span>)}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-xl font-bold text-gray-900">Services</h2>
              {gigs.length > 0 ? (
                <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {gigs.map((gig) => <GigCard key={gig._id} gig={gig} />)}
                </div>
              ) : (
                <EmptyState title="No services yet" description="This seller has not published any services" />
              )}
            </section>
          </div>

          <aside className="card h-fit p-5">
            <button type="button" className="btn-primary flex w-full items-center justify-center gap-2" onClick={startChat}>
              <MessageCircle size={16} /> Contact seller
            </button>
            <p className="mt-3 text-center text-xs text-gray-500">Usually responds within a few hours</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
