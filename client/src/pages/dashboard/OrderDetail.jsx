import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '../../utils/format.js';

const STEPS = ['pending', 'in_progress', 'delivered', 'completed'];

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
  const currentIdx = STEPS.indexOf(order.status);

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

      <div className="card flex items-center gap-2 overflow-x-auto p-5">
        {STEPS.map((s, i) => (
          <div key={s} className="flex min-w-0 flex-1 items-center gap-2 last:flex-none">
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i <= currentIdx ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {i < currentIdx ? <CheckCircle2 size={16} /> : i + 1}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wide ${i <= currentIdx ? 'text-brand-700' : 'text-gray-400'}`}>{ORDER_STATUS_LABELS[s]}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mb-5 h-0.5 flex-1 rounded ${i < currentIdx ? 'bg-brand-500' : 'bg-gray-100'}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}
