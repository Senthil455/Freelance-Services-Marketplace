import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ToggleRight, ToggleLeft, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import Pagination from '../../components/Pagination.jsx';
import Avatar from '../../components/Avatar.jsx';
import { formatPrice } from '../../utils/format.js';

export default function AdminGigs() {
  const [gigs, setGigs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), limit: '15' });
    if (query) q.set('query', query);
    api.get('/admin/gigs?' + q.toString())
      .then(({ data }) => {
        setGigs(data.gigs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 350);
    return () => clearTimeout(t);
  }, [query]);

  const toggle = async (gig) => {
    setBusy(gig._id);
    try {
      await api.patch('/gigs/' + gig._id + '/toggle');
      toast.success(gig.active ? 'Gig deactivated' : 'Gig activated');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h2 text-gray-900">Gigs</h1>
          <p className="mt-1 text-sm text-gray-500">{total} services listed</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, category…" className="input !pl-9 !py-2" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={30} /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3.5 font-bold">Gig</th>
                <th className="px-4 py-3.5 font-bold">Seller</th>
                <th className="px-4 py-3.5 font-bold">Price</th>
                <th className="px-5 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gigs.map((g) => (
                <tr key={g._id} className="transition hover:bg-gray-50/70">
                  <td className="max-w-[300px] px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={g.images ? g.images[0] : ''} alt="" className="h-11 w-16 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-bold text-gray-800">{g.title}</p>
                        <span className={'badge ' + (g.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500')}>{g.active ? 'Active' : 'Hidden'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar user={g.seller} size={24} />
                      <span className="truncate text-xs text-gray-600">{g.seller ? g.seller.name : ''}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-gray-800">{formatPrice(g.packages ? g.packages.basic ? g.packages.basic.price : 0 : 0)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <Link to={'/gig/' + g._id} title="View on site" className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100">
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        title={g.active ? 'Deactivate' : 'Activate'}
                        disabled={busy === g._id}
                        onClick={() => toggle(g)}
                        className={'rounded-lg p-2 transition disabled:opacity-40 ' + (g.active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50')}
                      >
                        {g.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
