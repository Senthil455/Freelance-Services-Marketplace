import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, Calendar, MapPin, Star } from 'lucide-react';
import api from '../api/client.js';
import Avatar from '../components/Avatar.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatDate, imgUrl } from '../utils/format.js';

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${id}`)
      .then(({ data }) => setSeller(data.user))
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size={34} /></div>;
  if (error) return <div className="mx-auto max-w-lg py-24 text-center"><p className="text-lg font-bold text-gray-800">Profile unavailable</p><p className="mt-2 text-sm text-gray-500">{error}</p></div>;
  if (!seller) return null;

  const average = seller.ratings?.average;

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
      </div>
    </main>
  );
}
