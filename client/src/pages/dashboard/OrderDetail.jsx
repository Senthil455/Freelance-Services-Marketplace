import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, Clock, FileText, Paperclip, CheckCircle2, XCircle, MessageSquare,
  RefreshCcw, AlertTriangle, Star, Send, Download, ShieldCheck, Loader2, Upload,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Avatar from '../../components/Avatar.jsx';
import Spinner from '../../components/Spinner.jsx';
import { Modal } from '../GigDetail.jsx';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, STATUS_COLORS, timeAgo } from '../../utils/format.js';

const STEPS = ['pending', 'in_progress', 'delivered', 'completed'];

export default function OrderDetail() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
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
  const [communication, setCommunication] = useState(5);
  const [quality, setQuality] = useState(5);
  const [onTime, setOnTime] = useState(5);
  const fileInput = useRef(null);

  const load = () => {
    setLoading(true);
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (params.get('paid')) {
      toast.success('Payment successful — order is now in progress!');
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isSeller = user && order && order.seller?._id === user.id;
  const isBuyer = user && order && order.buyer?._id === user.id;
  const role = isSeller ? 'seller' : 'buyer';

  const changeStatus = async (to, extra = {}) => {
    setActionLoading(true);
    const body = new FormData();
    body.append('to', to);
    Object.entries(extra).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        if (Array.isArray(v)) v.forEach((f) => body.append('files', f));
        else body.append(k, v);
      }
    });
    try {
      const { data } = await api.put(`/orders/${id}/status`, body);
      setOrder(data.order);
      const label = ORDER_STATUS_LABELS[to] || to;
      toast.success(`Order ${label.toLowerCase()}`);
      closeAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const submitReview = async () => {
    if (!rating) return toast.error('Please select a rating');
    setActionLoading(true);
    try {
      const { data } = await api.post(`/orders/${id}/review`, { rating, text: reviewText, communication, quality, onTime });
      setOrder((o) => ({ ...o, reviewed: true }));
      toast.success(`Thanks for your ${data.rating}-star review!`);
      setReviewOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const closeAll = () => {
    setDeliverOpen(false); setCancelReason(''); setDisputeReason(''); setRevisionNote(''); setConfirmId(''); setDeliverFiles([]);
  };

  if (loading || !order) return <div className="flex justify-center py-24"><Spinner size={30} /></div>;

  return (
    <div className="space-y-6">
      <Link to="/dashboard/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-600">
        <ArrowLeft size={15} /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="h2 text-gray-900">{order.gigTitle}</h1>
            <span className={`badge !px-3 !py-1 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Order {order.orderId} · placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total paid</p>
          <p className="text-2xl font-extrabold text-gray-900">{formatPrice(order.total)}</p>
        </div>
      </div>

      <Timeline order={order} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><FileText size={17} className="text-brand-600" /> Requirements</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{order.requirements || 'No requirements were provided.'}</p>
          </div>

          {order.deliveredWork ? (
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><CheckCircle2 size={17} className="text-emerald-500" /> Delivered work</h2>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <Avatar user={order.seller} size={18} /> {order.seller?.name} delivered {timeAgo(order.deliveredWork.deliveredAt)}
              </div>
              {order.deliveredWork.message && <p className="mt-3 text-sm leading-relaxed text-gray-700">{order.deliveredWork.message}</p>}
              {order.deliveredWork.files?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {order.deliveredWork.files.map((f, i) => (
                    <a key={i} href={f} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:border-brand-300 hover:text-brand-700">
                      <Download size={14} /> File {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card p-6 text-center text-sm text-gray-400">
              <Clock size={22} className="mx-auto text-gray-300" />
              <p className="mt-2">{order.status === 'delivered' ? 'Delivery details loading…' : `Deliverable due ${formatDate(order.deadline)}`}</p>
            </div>
          )}

          {(order.cancellationReason || order.status === 'disputed') && (
            <div className={`card border-l-4 p-5 ${order.status === 'disputed' ? 'border-rose-400' : 'border-gray-300'}`}>
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                {order.status === 'disputed' ? <AlertTriangle size={16} className="text-rose-500" /> : <XCircle size={16} className="text-gray-500" />}
                {order.status === 'disputed' ? 'Dispute' : 'Cancellation'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{order.cancellationReason || 'This order is under review. The admin team will resolve it shortly.'}</p>
              {order.cancelledBy && <p className="mt-1 text-xs text-gray-400">Initiated by {order.cancelledBy} · {formatDate(order.cancelledAt)}</p>}
            </div>
          )}

          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><MessageSquare size={17} className="text-brand-600" /> Need to talk?</h2>
            <p className="mt-1 text-sm text-gray-500">Discuss this order directly with {isSeller ? order.buyer?.name : order.seller?.name}.</p>
            <Link to={`/dashboard/messages`} className="btn-secondary mt-4">
              <MessageSquare size={15} /> Open messages
            </Link>
          </div>

          {order.status === 'completed' && !order.reviewed && isBuyer && (
            <div className="card flex flex-wrap items-center justify-between gap-4 border-purple-200 bg-purple-50/60 p-6">
              <div>
                <h3 className="text-base font-bold text-purple-900">How was your experience?</h3>
                <p className="mt-0.5 text-sm text-purple-700">Your review helps other buyers and rewards great sellers.</p>
              </div>
              <button onClick={() => setReviewOpen(true)} className="btn-primary"><Star size={15} /> Leave a review</button>
            </div>
          )}
          {order.status === 'completed' && order.reviewed && (
            <div className="card flex items-center gap-3 border-emerald-200 bg-emerald-50/60 p-5 text-sm font-semibold text-emerald-800">
              <CheckCircle2 size={18} /> Thanks! Your review has been published.
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Order details</h3>
            <div className="mt-4 space-y-3 text-sm">
              <InfoRow label="Package" value={order.packageTitle} />
              <InfoRow label="Service price" value={formatPrice(order.price)} />
              <InfoRow label="Service fee" value={formatPrice(order.serviceFee)} />
              <InfoRow label="Delivery time" value={`${order.deliveryDays} days`} />
              <InfoRow label="Revisions" value={`${order.revisions}`} />
              <InfoRow label="Deadline" value={formatDate(order.deadline)} />
              <InfoRow label="Payment" value={order.paymentMethod === 'card' ? 'Card' : 'SkillForge Pay'} />
              <InfoRow label="Payout" value={order.payoutStatus === 'released' ? 'Released' : 'In escrow'} />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">{role === 'seller' ? 'Buyer' : 'Seller'}</h3>
            <Link to={`/seller/${order.seller?._id}`} className="mt-3 flex items-center gap-3">
              <Avatar user={isSeller ? order.buyer : order.seller} size={44} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-800">{(isSeller ? order.buyer : order.seller)?.name}</p>
                <p className="text-xs text-gray-400">{isSeller ? 'Buyer' : 'Seller'}</p>
              </div>
            </Link>
          </div>

          <OrderActions
            order={order} role={role} actionLoading={actionLoading}
            onStart={() => changeStatus('in_progress')}
            onDeliver={() => setDeliverOpen(true)}
            onComplete={() => changeStatus('completed')}
            onRevision={() => { setRevisionNote(''); setConfirmId('revision'); }}
            onCancel={() => setConfirmId('cancel')}
            onDispute={() => setConfirmId('dispute')}
            revisionNote={revisionNote} setRevisionNote={setRevisionNote}
          />
        </aside>
      </div>

      {deliverOpen && (
        <Modal title="Deliver work" onClose={() => setDeliverOpen(false)}>
          <label className="label">Message to buyer</label>
          <textarea value={deliverMsg} onChange={(e) => setDeliverMsg(e.target.value)} rows={4} placeholder="Describe what you've delivered…" className="input resize-none" />
          <button onClick={() => fileInput.current?.click()} className="btn-secondary mt-4 w-full">
            <Upload size={15} /> {deliverFiles.length > 0 ? `Add files (${deliverFiles.length} selected)` : 'Attach files'}
          </button>
          <input ref={fileInput} type="file" multiple hidden onChange={(e) => setDeliverFiles([...deliverFiles, ...Array.from(e.target.files || [])])} />
          {deliverFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {deliverFiles.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                  <Paperclip size={12} /> {f.name}
                  <button onClick={() => setDeliverFiles(deliverFiles.filter((_, j) => j !== i))} className="text-gray-400 hover:text-rose-500">×</button>
                </span>
              ))}
            </div>
          )}
          <button onClick={() => changeStatus('delivered', { message: deliverMsg, files: deliverFiles })} disabled={actionLoading} className="btn-primary mt-5 w-full !py-3">
            {actionLoading ? <Spinner size={17} className="text-white" /> : <><Send size={15} /> Deliver work</>}
          </button>
        </Modal>
      )}

      {confirmId === 'cancel' && (
        <Modal title="Cancel order" onClose={() => setConfirmId('')}>
          <p className="text-sm text-gray-500">Cancelling this order will notify the other party. Refunds are handled by the platform.</p>
          <label className="label mt-4">Reason (optional)</label>
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
          <p className="text-sm text-gray-500">Disputes are reviewed by our support team. Describe your issue in detail.</p>
          <label className="label mt-4">Reason</label>
          <textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} rows={4} placeholder="Explain what went wrong…" className="input resize-none" />
          <button onClick={() => changeStatus('disputed', { reason: disputeReason })} disabled={actionLoading} className="btn-primary mt-5 w-full !bg-rose-600 hover:!bg-rose-700">
            {actionLoading ? <Spinner size={17} className="text-white" /> : <><AlertTriangle size={15} /> Open dispute</>}
          </button>
        </Modal>
      )}

      {confirmId === 'revision' && (
        <Modal title="Request revision" onClose={() => setConfirmId('')}>
          <label className="label">What should be revised?</label>
          <textarea value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} rows={4} placeholder="Describe the changes you need…" className="input resize-none" />
          <button onClick={() => changeStatus('revision', { reason: revisionNote })} disabled={actionLoading} className="btn-primary mt-5 w-full !py-3">
            {actionLoading ? <Spinner size={17} className="text-white" /> : 'Request revision'}
          </button>
        </Modal>
      )}

      {reviewOpen && (
        <Modal title="Review this order" onClose={() => setReviewOpen(false)}>
          <div className="space-y-4">
            <div>
              <label className="label">Overall rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} className={`text-3xl transition ${n <= rating ? 'text-amber-400' : 'text-gray-200'}`}>★</button>
                ))}
                <span className="ml-2 self-center text-sm font-bold text-gray-700">{rating}.0</span>
              </div>
            </div>
            <SliderRow label="Communication" value={communication} onChange={setCommunication} />
            <SliderRow label="Quality of work" value={quality} onChange={setQuality} />
            <SliderRow label="On-time delivery" value={onTime} onChange={setOnTime} />
            <div>
              <label className="label">Your review</label>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} placeholder="What was it like working with this seller?" className="input resize-none" />
            </div>
            <button onClick={submitReview} disabled={actionLoading} className="btn-primary w-full !py-3">
              {actionLoading ? <Spinner size={17} className="text-white" /> : <><Star size={15} /> Submit review</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Timeline({ order }) {
  const currentIdx = STEPS.indexOf(order.status) >= 0 ? STEPS.indexOf(order.status) : -1;
  return (
    <div className="card flex items-center gap-2 overflow-x-auto p-5">
      {STEPS.map((s, i) => (
        <div key={s} className="flex min-w-0 flex-1 items-center gap-2 last:flex-none">
          <div className="flex min-w-0 flex-col items-center gap-1.5">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i <= currentIdx ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {i < currentIdx || (order.status === 'completed' && i === 3) ? <CheckCircle2 size={16} /> : i + 1}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${i <= currentIdx ? 'text-brand-700' : 'text-gray-400'}`}>{ORDER_STATUS_LABELS[s]}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`mb-5 h-0.5 flex-1 rounded ${i < currentIdx ? 'bg-brand-500' : 'bg-gray-100'}`} />}
        </div>
      ))}
      {order.status === 'cancelled' && <span className="badge shrink-0 bg-red-100 text-red-700">Cancelled</span>}
      {order.status === 'disputed' && <span className="badge shrink-0 bg-rose-100 text-rose-700">Disputed</span>}
      {order.status === 'revision' && <span className="badge shrink-0 bg-orange-100 text-orange-700">In revision</span>}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold capitalize text-gray-800">{value}</span>
    </div>
  );
}

function OrderActions({ order, role, actionLoading, onStart, onDeliver, onComplete, onRevision, onCancel, onDispute }) {
  if (order.status === 'pending') {
    return role === 'seller' ? (
      <ActionCard title="This order is waiting for you" text="Accept the order to confirm the deadline and start working.">
        <button onClick={onStart} disabled={actionLoading} className="btn-primary w-full"><CheckCircle2 size={15} /> Accept & start</button>
        <button onClick={onCancel} disabled={actionLoading} className="btn-secondary w-full mt-2">Decline (cancel)</button>
      </ActionCard>
    ) : (
      <ActionCard title="Finish checkout" text="Your payment hasn't been received yet.">
        <Link to={`/checkout/${order._id}`} className="btn-primary w-full"><ShieldCheck size={15} /> Continue to payment</Link>
      </ActionCard>
    );
  }
  if (order.status === 'in_progress') {
    return role === 'seller' ? (
      <ActionCard title="Working on it?" text="Deliver your completed work to the buyer.">
        <button onClick={onDeliver} disabled={actionLoading} className="btn-primary w-full"><Send size={15} /> Deliver work</button>
      </ActionCard>
    ) : (
      <ActionCard title="In progress" text={`Seller is working on your order. Due ${formatDate(order.deadline)}.`}>
        <button onClick={onCancel} disabled={actionLoading} className="btn-secondary w-full mb-2">Request cancellation</button>
        <button onClick={onDispute} disabled={actionLoading} className="btn-ghost w-full !text-rose-600">Open dispute</button>
      </ActionCard>
    );
  }
  if (order.status === 'delivered') {
    return role === 'buyer' ? (
      <ActionCard title="Work delivered!" text="Review the delivery. Accept to complete the order, or request changes.">
        <button onClick={onComplete} disabled={actionLoading} className="btn-primary w-full"><CheckCircle2 size={15} /> Accept & complete</button>
        <button onClick={onRevision} disabled={actionLoading} className="btn-secondary w-full mt-2"><RefreshCcw size={15} /> Request revision</button>
        <button onClick={onCancel} disabled={actionLoading} className="btn-ghost w-full mt-1 !text-rose-600">Cancel order</button>
      </ActionCard>
    ) : (
      <ActionCard title="Delivered" text="Waiting for the buyer to review your delivery.">
        <button onClick={onCancel} disabled={actionLoading} className="btn-secondary w-full mb-2">Cancel order</button>
        <button onClick={onDispute} disabled={actionLoading} className="btn-ghost w-full !text-rose-600">Open dispute</button>
      </ActionCard>
    );
  }
  if (order.status === 'revision') {
    return role === 'seller' ? (
      <ActionCard title="Revision requested" text="Revise your delivery and deliver it again.">
        <button onClick={onDeliver} disabled={actionLoading} className="btn-primary w-full"><Send size={15} /> Deliver updated work</button>
      </ActionCard>
    ) : (
      <ActionCard title="In revision" text="Waiting for the seller to revise and re-deliver." />
    );
  }
  if (order.status === 'cancelled') {
    return <ActionCard title="Order cancelled" text={`${order.cancellationReason || 'No reason provided.'}`} muted />;
  }
  if (order.status === 'disputed') {
    return <ActionCard title="Order under review" text="Our support team is investigating this dispute. We'll notify both parties with the outcome." muted />;
  }
  if (order.status === 'completed') {
    return <ActionCard title="Order completed" text={`Completed on ${formatDate(order.completedAt)}. Thank you for using SkillForge!`} muted />;
  }
  return null;
}

function ActionCard({ title, text, children, muted = false }) {
  return (
    <div className={`card p-5 ${muted ? 'border-gray-200' : 'border-brand-200 bg-brand-50/50'}`}>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{text}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

function SliderRow({ label, value, onChange }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-600">{label}</label>
        <span className="text-xs font-bold text-gray-800">{value}.0</span>
      </div>
      <input type="range" min="1" max="5" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-brand-600" />
    </div>
  );
}