import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Lock, Clock, ArrowLeft } from 'lucide-react';
import api from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import { formatPrice, formatDate } from '../utils/format.js';

export default function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [sandbox, setSandbox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => { setError(err.message); setLoading(false); });

    api.post('/payments/create-payment-intent', { orderId })
      .then(({ data }) => {
        if (data.sandbox) {
          setSandbox(true);
          setTimeout(() => navigate(`/dashboard/orders/${orderId}?paid=1`, { replace: true }), 1800);
        }
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [orderId, navigate]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size={34} /></div>;
  if (error) return <div className="mx-auto max-w-lg py-24 text-center"><p className="text-lg font-bold text-gray-800">Checkout unavailable</p><p className="mt-2 text-sm text-gray-500">{error}</p><Link to="/" className="btn-primary mt-6">Back to home</Link></div>;
  if (!order) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to={`/gig/${order.gig?._id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-600">
        <ArrowLeft size={15} /> Back to service
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">Checkout</h1>
      <p className="mt-1 text-sm text-gray-500">Order {order.orderId} · {formatDate(order.createdAt)}</p>

      {sandbox ? (
        <div className="card mt-8 flex flex-col items-center p-10 text-center">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={30} className="text-emerald-600" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-gray-900">Payment successful!</h2>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            This environment runs in sandbox mode, so your order was marked as paid automatically.
            Redirecting to your order…
          </p>
          <Spinner size={22} className="mt-6" />
        </div>
      ) : (
        <div className="card mt-8 p-7">
          <h2 className="text-lg font-bold text-gray-900">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Package" value={order.packageTitle} />
            <Row label="Delivery" value={`${order.deliveryDays} day${order.deliveryDays > 1 ? 's' : ''}`} />
            <Row label="Service price" value={formatPrice(order.price)} />
            <Row label="Service fee (8%)" value={formatPrice(order.serviceFee)} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm font-bold text-gray-800">Total</span>
            <span className="text-2xl font-extrabold text-gray-900">{formatPrice(order.total)}</span>
          </div>
          <div className="mt-4 space-y-2.5 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
            <p className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Escrow protection until you approve delivery</p>
            <p className="flex items-center gap-2"><Lock size={14} className="text-gray-400" /> Secure payments</p>
            <p className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /> Deadline: {formatDate(order.deadline)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold capitalize text-gray-800">{value}</span>
    </div>
  );
}
