import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Megaphone } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import { formatPrice } from '../../utils/format.js';

export default function DashboardGigs() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/gigs/mine')
      .then(({ data }) => setGigs(data.gigs || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h2 text-gray-900">My gigs</h1>
          <p className="mt-1 text-sm text-gray-500">{gigs.length} active service{gigs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/dashboard/gigs/new" className="btn-primary"><PlusCircle size={16} /> Create new gig</Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={30} /></div>
      ) : gigs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <Megaphone size={26} className="mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-800">You haven't published any gigs yet</h3>
          <Link to="/dashboard/gigs/new" className="btn-primary mt-5"><PlusCircle size={16} /> Create your first gig</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {gigs.map((gig) => (
            <div key={gig._id} className="card group overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img src={gig.images?.[0]} alt={gig.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <p className="line-clamp-2 text-sm font-bold text-gray-800">{gig.title}</p>
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-base font-extrabold text-gray-900">{formatPrice(gig.packages?.basic?.price)}</span>
                  <span className="text-xs text-gray-400">{gig.sales ?? 0} sales</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
