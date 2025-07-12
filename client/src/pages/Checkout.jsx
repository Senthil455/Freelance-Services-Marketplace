import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckCircle2, CreditCard, ShieldCheck, Lock, ArrowLeft, PackageOpen, Clock, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import Avatar from '../components/Avatar.jsx';
import { formatPrice, formatDate } from '../utils/format.js';

let stripePromise = null;
function getStripe() {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_REPLACE_WITH_YOUR_KEY';
  if (!stripePromise && key.startsWith('pk_')) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

export default function Checkout() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [sandbox, setSandbox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => { setError(err.message); setLoading(false); });

    api.post('/payments/create-payment-intent', { orderId })
      .then(({ data }) => {
        if (data.sandbox) {
          setSandbox(true);
          setTimeout(() => navigate(`/dashboard/orders/${orderId}?paid=1`, { replace: true }), 1800);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => { setError(err.message); toast.error(err.message); })
      .finally(() => setLoading(false));
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

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          {sandbox ? (
            <div className="card flex flex-col items-center p-10 text-center">
              <div className="h-16 w-16 animate-pulse rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={30} className="text-emerald-600" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-gray-900">Payment successful!</h2>
              <p className="mt-2 max-w-sm text-sm text-gray-500">
                This environment runs in sandbox mode, so your order was marked as paid automatically.
                Redirecting to your order…
              </p>
              <Spinner size={22} className="mt-6" />
            </div>
          ) : clientSecret ? (
            <Elements stripe={getStripe()} options={{ clientSecret }}>
              <StripeForm order={order} clientSecret={clientSecret} />
            </Elements>
          ) : (
            <div className="card p-10 text-center">
              <p className="text-sm text-gray-500">Preparing your payment…</p>
              <Spinner size={22} className="mt-4 mx-auto" />
            </div>
          )}
        </div>

        <aside>
          <div className="card overflow-hidden">
            <div className="relative aspect-video bg-gray-100">
              <img src={order.gigImage || order.gig?.images?.[0]} alt={order.gigTitle} className="h-full w-full object-cover" />
            </div>
            <div className="p-5">
              <p className="line-clamp-2 text-sm font-bold text-gray-800">{order.gigTitle}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <Avatar user={order.seller} size={22} />
                <span className="truncate">{order.seller?.name}</span>
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                <Row label="Package" value={order.packageTitle} />
                <Row label="Delivery" value={`${order.deliveryDays} day${order.deliveryDays > 1 ? 's' : ''}`} />
                <Row label="Revisions" value={`${order.revisions}`} />
                <Row label="Service price" value={formatPrice(order.price)} />
                <Row label="Service fee (8%)" value={formatPrice(order.serviceFee)} />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-bold text-gray-800">Total</span>
                <span className="text-2xl font-extrabold text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5 rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-500">
            <p className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Escrow protection until you approve delivery</p>
            <p className="flex items-center gap-2"><Lock size={14} className="text-gray-400" /> Encrypted, PCI-compliant payment</p>
            <p className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /> Deadline: {formatDate(order.deadline)}</p>
          </div>
        </aside>
      </div>
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

function StripeForm({ order, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const pay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (confirmError) throw new Error(confirmError.message);
      toast.success('Payment successful!');
      navigate(`/dashboard/orders/${order._id}?paid=1`, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={pay} className="card p-7">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
        <CreditCard size={19} className="text-brand-600" /> Card payment
      </h2>
      <p className="mt-1 text-xs text-gray-500">You will be charged {formatPrice(order.total)}. Test card: 4242 4242 4242 4242.</p>

      <label className="label mt-5">Card details</label>
      <div className="rounded-xl border border-gray-300 bg-white p-4 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
        <CardElement options={{ style: { base: { fontSize: '15px', color: '#1f2937' } } }} />
      </div>

      <button type="submit" disabled={!stripe || processing} className="btn-primary mt-6 w-full !py-3">
        {processing ? <Spinner size={17} className="text-white" /> : `Pay ${formatPrice(order.total)}`}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Lock size={12} /> Payments are processed securely by Stripe
      </p>
    </form>
  );
}