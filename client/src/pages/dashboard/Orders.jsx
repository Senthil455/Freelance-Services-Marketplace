import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import { formatPrice, ORDER_STATUS_LABELS, STATUS_COLORS } from '../../utils/format.js';

export default function DashboardOrders() {
  const { user } = useSelector((s) => s.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/orders/my-orders?role=seller')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size={30} /></div>;

  return (
    <div className="space-y-6">
      <h1 className="h2 text-gray-900">Orders</h1>
      <div className="grid gap-4">
        {orders.map((o) => (
          <Link key={o._id} to={`/dashboard/orders/${o._id}`} className="card flex flex-col gap-4 p-4 transition hover:shadow-lift sm:flex-row sm:items-center sm:p-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-gray-400">{o.orderId}</span>
                <span className={`badge ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{ORDER_STATUS_LABELS[o.status] || o.status}</span>
              </div>
              <p className="mt-1.5 line-clamp-1 text-sm font-bold text-gray-800">{o.gigTitle}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400">Total</p>
              <p className="text-lg font-extrabold text-gray-900">{formatPrice(o.total)}</p>
            </div>
          </Link>
        ))}
      </div>
      {orders.length === 0 && <p className="py-16 text-center text-sm text-gray-500">No orders yet.</p>}
    </div>
  );
}
