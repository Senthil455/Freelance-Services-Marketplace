import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import { formatPrice, formatDate } from '../../utils/format.js';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !order) return <div className="flex justify-center py-24"><Spinner size={30} /></div>;

  return (
    <div className="space-y-6">
      <Link to="/dashboard/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-600">
        <ArrowLeft size={15} /> Back to orders
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h2 text-gray-900">{order.gigTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">Order {order.orderId} · placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total paid</p>
          <p className="text-2xl font-extrabold text-gray-900">{formatPrice(order.total)}</p>
        </div>
      </div>
      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><FileText size={17} className="text-brand-600" /> Requirements</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">{order.requirements || 'No requirements were provided.'}</p>
      </div>
    </div>
  );
}
