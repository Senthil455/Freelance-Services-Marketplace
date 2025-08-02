import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Megaphone, Eye, Star, Trash2, Pencil, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatPrice } from '../../utils/format.js';

export default function DashboardGigs() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/gigs/mine')
      .then(({ data }) => setGigs(data.gigs || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (gig) => {
    if (!window.confirm(`Delete "${gig.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api.delete(`/gigs/${gig._id}`);
      toast.success('Gig deleted');
      setGigs(gigs.filter((g) => g._id !== gig._id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h2 text-gray-900">My gigs</h1>
          <p className="mt-1 text-sm text-gray-500">{gigs.length} active service{gigs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/dashboard/gigs/new" className="btn-primary">
          <PlusCircle size={16} /> Create new gig
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={30} /></div>
      ) : gigs.length === 0 ? (
        <EmptyState
          title="You haven't published any gigs yet"
          subtitle="Create your first service to start receiving orders. It takes about 5 minutes."
          icon={<Megaphone size={26} />}
          action={<Link to="/dashboard/gigs/new" className="btn-primary"><PlusCircle size={16} /> Create your first gig</Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {gigs.map((gig) => (
            <div key={gig._id} className="card group overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img src={gig.images?.[0]} alt={gig.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                <span className={`absolute left-2.5 top-2.5 badge ${gig.active ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {gig.active ? 'Active' : 'Hidden'}
                </span>
                {gig.featured && <span className="absolute right-2.5 top-2.5 badge bg-amber-400 text-white">Featured</span>}
              </div>
              <div className="p-4">
                <p className="line-clamp-2 text-sm font-bold text-gray-800">{gig.title}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><Eye size={13} /> {gig.views ?? 0}</span>
                  <span className="inline-flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /> {gig.rating || 0} ({gig.ratingCount || 0})</span>
                  <span>{gig.sales ?? 0} sales</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <div>
                    <span className="block text-[10px] text-gray-400">From</span>
                    <span className="text-base font-extrabold text-gray-900">{formatPrice(gig.packages?.basic?.price)}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Link to={`/gig/${gig._id}`} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-brand-600" title="View gig" aria-label="View gig">
                      <ExternalLink size={16} />
                    </Link>
                    <Link to={`/dashboard/gigs/${gig._id}/edit`} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-brand-600" title="Edit gig" aria-label="Edit gig">
                      <Pencil size={16} />
                    </Link>
                    <button onClick={() => remove(gig)} disabled={busy} className="rounded-lg p-2 text-gray-500 transition hover:bg-rose-50 hover:text-rose-600" title="Delete gig" aria-label="Delete gig">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}