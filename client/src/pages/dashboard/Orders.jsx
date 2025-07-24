import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingBag, Package } from 'lucide-react';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import Pagination from '../../components/Pagination.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Avatar from '../../components/Avatar.jsx';
import { formatPrice, formatDate } from '../../utils/format.js';

const STATUSES = ['all', 'pending', 'in_progress', 'delivered', 'completed', 'revision', 'cancelled', 'disputed'];

export default function DashboardOrders() {
  const { user } = useSelector((s) => s.auth);
  const [params, setParams] = useSearchParams();
  const isSeller = user?.role === 'seller' || user?.isSeller;
  const role = params.get('role') || (isSeller ? 'seller' : 'buyer');
  const status = params.get('status') || 'all';
  const page = Number(params.get('page') || 1);

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ role, status, page: String(page), limit: '10' });
    api.get(`/orders/my-orders?${q.toString()}`)
      .then(({ data }) => {
        setOrders(data.orders || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role, status, page]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };

  const other = (order) => (role === 'seller' ? order.buyer : order.seller);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h2 text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">{total} order{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
          <button onClick={() => setParam('role', 'buyer')} className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${role !== 'seller' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Buying
          </button>
          <button onClick={() => setParam('role', 'seller')} className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${role === 'seller' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Selling
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setParam('status', s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition ${status === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={30} /></div>
      ) : orders.length === 0 ? (
        <EmptyState
          title={status === 'all' ? `No ${role === 'seller' ? 'incoming ' : ''}orders yet` : `No ${status.replace('_', ' ')} orders`}
          subtitle="Try changing the filters to see more orders."
          icon={role === 'seller' ? <Package size={26} /> : <ShoppingBag size={26} />}
        />
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <Link key={o._id} to={`/dashboard/orders/${o._id}`} className="card flex flex-col gap-4 p-4 transition hover:shadow-lift sm:flex-row sm:items-center sm:p-5">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-bold text-gray-800">{o.gigTitle}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Avatar user={other(o)} size={20} />
                  <span className="truncate">{other(o)?.name}</span>
                  <span className="text-gray-300">·</span>
                  <span>{formatDate(o.createdAt)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-400">Total</p>
                <p className="text-lg font-extrabold text-gray-900">{formatPrice(o.total)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={(p) => setParam('page', String(p))} />
    </div>
  );
}
