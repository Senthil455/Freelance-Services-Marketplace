import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Megaphone, Eye, Star, Trash2, Pencil, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import { formatPrice } from '../../utils/format.js';

export default function DashboardGigs() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await api.delete(`/gigs/${gig._id}`);
      toast.success('Gig deleted');
      setGigs(gigs.filter((g) => g._id !== gig._id));
    } catch (err) { toast.error(err.message); }
  };

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
                <span className={`absolute left-2.5 top-2.5 badge ${gig.active ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {gig.active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <div className="p-4">
                <p className="line-clamp-2 text-sm font-bold text-gray-800">{gig.title}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><Eye size={13} /> {gig.views ?? 0}</span>
                  <span className="inline-flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /> {gig.rating || 0}</span>
                  <span>{gig.sales ?? 0} sales
                  {gig.rating > 0 && <Star className="fill-amber-400 text-amber-400" size={13} />} {gig.rating > 0 ? gig.rating : ''}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-base font-extrabold text-gray-900">{formatPrice(gig.packages?.basic?.price)}</span>
                  <div className="flex gap-1.5">
                    <Link to={`/gig/${gig._id}`} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-brand-600" title="View gig"><ExternalLink size={16} /></Link>
                    <Link to={`/dashboard/gigs/${gig._id}/edit`} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-brand-600" title="Edit gig"><Pencil size={16} /></Link>
                    <button onClick={() => remove(gig)} className="rounded-lg p-2 text-gray-500 transition hover:bg-rose-50 hover:text-rose-600" title="Delete gig"><Trash2 size={16} /></button>
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
