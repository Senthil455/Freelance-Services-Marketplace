import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, FileText, CheckCircle2, MessageSquare, Send, Upload, Paperclip,
  XCircle, AlertTriangle, RefreshCcw, Star, Download,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Avatar from '../../components/Avatar.jsx';
import Spinner from '../../components/Spinner.jsx';
import { Modal } from '../GigDetail.jsx';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, timeAgo } from '../../utils/format.js';

const STEPS = ['pending', 'in_progress', 'delivered', 'completed'];

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [deliverMsg, setDeliverMsg] = useState('');
  const [deliverFiles, setDeliverFiles] = useState([]);
  const [cancelReason, setCancelReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [confirmId, setConfirmId] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const fileInput = useRef(null);

  const load = () => {
    setLoading(true);
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const isSeller = user && order && order.seller?._id === user.id;
  const isBuyer = user && order && order.buyer?._id === user.id;
  const role = isSeller ? 'seller' : 'buyer';

  const changeStatus = async (to, extra = {}) => {
    setActionLoading(true);
    const body = new FormData();
    body.append('to', to);
    Object.entries(extra).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((f) => body.append('files', f));
      else if (v !== undefined && v !== null) body.append(k, v);
    });
    try {
      const { data } = await api.put(`/orders/${id}/status`, body);
      setOrder(data.order);
      toast.success(`Order ${(ORDER_STATUS_LABELS[to] || to).toLowerCase()}`);
      setDeliverOpen(false); setConfirmId(''); setDeliverFiles([]); setCancelReason(''); setDisputeReason(''); setRevisionNote('');
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const submitReview = async () => {
    if (!rating) return toast.error('Please select a rating');
    setActionLoading(true);
    try {
      await api.post(`/orders/${id}/review`, { rating, text: reviewText });
      setOrder((o) => ({ ...o, reviewed: true }));
      toast.success(`Thanks for your ${rating}-star review!`);
      setReviewOpen(false);
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

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

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><FileText size={17} className="text-brand-600" /> Requirements</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{order.requirements || 'No requirements were provided.'}</p>
          </div>
          {order.deliveredWork?.files?.length > 0 && (
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><CheckCircle2 size={17} className="text-emerald-500" /> Delivered work</h2>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <Avatar user={order.seller} size={18} /> {order.seller?.name} delivered {timeAgo(order.deliveredWork.deliveredAt)}
              </div>
              {order.deliveredWork.message && <p className="mt-3 text-sm leading-relaxed text-gray-700">{order.deliveredWork.message}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {order.deliveredWork.files.map((f, i) => (
                  <a key={i} href={f} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-700">
                    <Download size={14} /> File {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
          {(order.cancellationReason || order.status === 'disputed') && (
            <div className={`card border-l-4 p-5 ${order.status === 'disputed' ? 'border-rose-400' : 'border-gray-300'}`}>
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                {order.status === 'disputed' ? <AlertTriangle size={16} className="text-rose-500" /> : <XCircle size={16} className="text-gray-500" />}
                {order.status === 'disputed' ? 'Dispute' : 'Cancellation'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{order.cancellationReason || 'This order is under review.'}</p>
            </div>
          )}
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><MessageSquare size={17} className="text-brand-600" /> Need to talk?</h2>
            <p className="mt-1 text-sm text-gray-500">Discuss this order with {isSeller ? order.buyer?.name : order.seller?.name}.</p>
            <Link to="/dashboard/messages" className="btn-secondary mt-4"><MessageSquare size={15} /> Open messages</Link>
          </div>
          {order.status === 'completed' && !order.reviewed && isBuyer && (
            <div className="card flex flex-wrap items-center justify-between gap-4 border-purple-200 bg-purple-50/60 p-6">
              <div>
                <h3 className="text-base font-bold text-purple-900">How was your experience?</h3>
                <p className="mt-0.5 text-sm text-purple-700">Your review helps other buyers.</p>
              </div>
              <button onClick={() => setReviewOpen(true)} className="btn-primary"><Star size={15} /> Leave a review</button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Order details</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-gray-400">Package</span><span className="font-semibold capitalize text-gray-800">{order.packageTitle}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-400">Delivery time</span><span className="font-semibold capitalize text-gray-800">{order.deliveryDays} days</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-400">Deadline</span><span className="font-semibold capitalize text-gray-800">{formatDate(order.deadline)}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-400">Service fee</span><span className="font-semibold capitalize text-gray-800">{formatPrice(order.serviceFee)}</span></div>
            </div>
          </div>
          <OrderActions
            order={order} role={role} actionLoading={actionLoading}
            onStart={() => changeStatus('in_progress')}
            onDeliver={() => setDeliverOpen(true)}
            onComplete={() => changeStatus('completed')}
            onRevision={() => { setRevisionNote(''); setConfirmId('revision'); }}
            onCancel={() => setConfirmId('cancel')}
            onDispute={() => setConfirmId('dispute')}
          />
        </aside>
      </div>

      {deliverOpen && (
        <Modal title="Deliver work" onClose={() => setDeliverOpen(false)}>
          <textarea value={deliverMsg} onChange={(e) => setDeliverMsg(e.target.value)} rows={4} placeholder="Describe what you've delivered…" className="input resize-none" />
          <button onClick={() => fileInput.current?.click()} className="btn-secondary mt-4 w-full"><Upload size={15} /> Attach files</button>
          <input ref={fileInput} type="file" multiple hidden onChange={(e) => setDeliverFiles([...deliverFiles, ...Array.from(e.target.files || [])])} />
          <button onClick={() => changeStatus('delivered', { message: deliverMsg, files: deliverFiles })} disabled={actionLoading} className="btn-primary mt-5 w-full !py-3">
            {actionLoading ? <Spinner size={17} className="text-white" /> : <><Send size={15} /> Deliver work</>}
          </button>
        </Modal>
      )}

      {confirmId === 'cancel' && (
        <Modal title="Cancel order" onClose={() => setConfirmId('')}>
          <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} placeholder="Why are you cancelling?" className="input resize-none" />
          <div className="mt-5 flex gap-3">
            <button onClick={() => setConfirmId('')} className="btn-secondary flex-1">Keep order</button>
            <button onClick={() => changeStatus('cancelled', { reason: cancelReason })} disabled={actionLoading} className="btn-primary flex-1 !bg-rose-600 hover:!bg-rose-700">
              {actionLoading ? <Spinner size={17} className="text-white" /> : 'Cancel order'}
            </button>
          </div>
        </Modal>
      )}

      {confirmId === 'dispute' && (
        <Modal title="Open a dispute" onClose={() => setConfirmId('')}>
          <textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} rows={4} placeholder="Explain what went wrong…" className="input resize-none" />
          <button onClick={() => changeStatus('disputed', { reason: disputeReason })} disabled={actionLoading} className="btn-primary mt-5 w-full !bg-rose-600 hover:!bg-rose-700">
            {actionLoading ? <Spinner size={17} className="text-white" /> : <><AlertTriangle size={15} /> Open dispute</>}
          </button>
        </Modal>
      )}

      {confirmId === 'revision' && (
        <Modal title="Request revision" onClose={() => setConfirmId('')}>
          <textarea value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} rows={4} placeholder="Describe the changes you need…" className="input resize-none" />
          <button onClick={() => changeStatus('revision', { reason: revisionNote })} disabled={actionLoading} className="btn-primary mt-5 w-full !py-3">
            {actionLoading ? <Spinner size={17} className="text-white" /> : 'Request revision'}
          </button>
        </Modal>
      )}

      {reviewOpen && (
        <Modal title="Review this order" onClose={() => setReviewOpen(false)}>
          <label className="label">Overall rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} className={`text-3xl transition ${n <= rating ? 'text-amber-400' : 'text-gray-200'}`}>★</button>
            ))}
            <span className="ml-2 self-center text-sm font-bold text-gray-700">{rating}.0</span>
          </div>
          <label className="label mt-4">Your review</label>
          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} placeholder="What was it like working with this seller?" className="input resize-none" />
          <button onClick={submitReview} disabled={actionLoading} className="btn-primary mt-5 w-full !py-3">
            {actionLoading ? <Spinner size={17} className="text-white" /> : <><Star size={15} /> Submit review</>}
          </button>
        </Modal>
      )}
    </div>
  );
}

function OrderActions({ order, role, actionLoading, onStart, onDeliver, onComplete, onRevision, onCancel, onDispute }) {
  if (order.status === 'pending') {
    return role === 'seller' ? (
      <Card title="This order is waiting for you" text="Accept the order to confirm the deadline and start working.">
        <button onClick={onStart} disabled={actionLoading} className="btn-primary w-full"><CheckCircle2 size={15} /> Accept &amp; start</button>
        <button onClick={onCancel} disabled={actionLoading} className="btn-secondary w-full mt-2">Decline (cancel)</button>
      </Card>
    ) : null;
  }
  if (order.status === 'in_progress') {
    return role === 'seller' ? (
      <Card title="Working on it?" text="Deliver your completed work to the buyer.">
        <button onClick={onDeliver} disabled={actionLoading} className="btn-primary w-full"><Send size={15} /> Deliver work</button>
      </Card>
    ) : (
      <Card title="In progress" text="Track progress here.">
        <button onClick={onCancel} disabled={actionLoading} className="btn-secondary w-full mb-2">Request cancellation</button>
        <button onClick={onDispute} disabled={actionLoading} className="btn-ghost w-full !text-rose-600">Open dispute</button>
      </Card>
    );
  }
  if (order.status === 'delivered') {
    return role === 'buyer' ? (
      <Card title="Work delivered!" text="Review the delivery, then accept or request changes.">
        <button onClick={onComplete} disabled={actionLoading} className="btn-primary w-full"><CheckCircle2 size={15} /> Accept &amp; complete</button>
        <button onClick={onRevision} disabled={actionLoading} className="btn-secondary w-full mt-2"><RefreshCcw size={15} /> Request revision</button>
      </Card>
    ) : null;
  }
  if (order.status === 'revision' && role === 'seller') {
    return (
      <Card title="Revision requested" text="Revise your delivery and deliver again.">
        <button onClick={onDeliver} disabled={actionLoading} className="btn-primary w-full"><Send size={15} /> Deliver updated work</button>
      </Card>
    );
  }
  return null;
}

function Card({ title, text, children, muted = false }) {
  return (
    <div className={`card p-5 ${muted ? 'border-gray-200' : 'border-brand-200 bg-brand-50/50'}`}>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{text}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
