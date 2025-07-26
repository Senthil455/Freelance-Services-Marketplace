import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, FileText,  CheckCircle2, MessageSquare, Send, Upload, Paperclip, XCircle } from 'lucide-react';
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
  const [confirmId, setConfirmId] = useState('');
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
      setDeliverOpen(false); setConfirmId('');
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
          {order.deliveredWork?.message && (
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><CheckCircle2 size={17} className="text-emerald-500" /> Delivered work</h2>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <Avatar user={order.seller} size={18} /> {order.seller?.name} delivered {timeAgo(order.deliveredWork.deliveredAt)}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{order.deliveredWork.message}</p>
            </div>
          )}
          {order.cancellationReason && (
            <div className="card border-l-4 border-gray-300 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800"><XCircle size={16} className="text-gray-500" /> Cancellation</h3>
              <p className="mt-2 text-sm text-gray-600">{order.cancellationReason}</p>
            </div>
          )}
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><MessageSquare size={17} className="text-brand-600" /> Need to talk?</h2>
            <p className="mt-1 text-sm text-gray-500">Discuss this order with {isSeller ? order.buyer?.name : order.seller?.name}.</p>
            <Link to="/dashboard/messages" className="btn-secondary mt-4"><MessageSquare size={15} /> Open messages</Link>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Order details</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-gray-400">Package</span><span className="font-semibold capitalize text-gray-800">{order.packageTitle}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-400">Deadline</span><span className="font-semibold capitalize text-gray-800">{formatDate(order.deadline)}</span></div>
            </div>
          </div>
          {order.status === 'pending' && role === 'seller' && (
            <div className="card border-brand-200 bg-brand-50/50 p-5">
              <h3 className="text-sm font-bold text-gray-800">This order is waiting for you</h3>
              <button onClick={() => changeStatus('in_progress')} disabled={actionLoading} className="btn-primary mt-4 w-full"><CheckCircle2 size={15} /> Accept &amp; start</button>
              <button onClick={() => setConfirmId('cancel')} disabled={actionLoading} className="btn-secondary mt-2 w-full">Decline (cancel)</button>
            </div>
          )}
          {order.status === 'in_progress' && role === 'seller' && (
            <div className="card border-brand-200 bg-brand-50/50 p-5">
              <h3 className="text-sm font-bold text-gray-800">Working on it?</h3>
              <button onClick={() => setDeliverOpen(true)} className="btn-primary mt-4 w-full"><Send size={15} /> Deliver work</button>
            </div>
          )}
          {order.status === 'delivered' && role === 'buyer' && (
            <div className="card border-brand-200 bg-brand-50/50 p-5">
              <h3 className="text-sm font-bold text-gray-800">Work delivered!</h3>
              <button onClick={() => changeStatus('completed')} disabled={actionLoading} className="btn-primary mt-4 w-full"><CheckCircle2 size={15} /> Accept &amp; complete</button>
            </div>
          )}
        </aside>
      </div>

      {deliverOpen && (
        <Modal title="Deliver work" onClose={() => setDeliverOpen(false)}>
          <textarea value={deliverMsg} onChange={(e) => setDeliverMsg(e.target.value)} rows={4} placeholder="Describe what you've delivered…" className="input resize-none" />
          <button onClick={() => fileInput.current?.click()} className="btn-secondary mt-4 w-full">
            <Upload size={15} /> {deliverFiles.length > 0 ? `Add files (${deliverFiles.length} selected)` : 'Attach files'}
          </button>
          <input ref={fileInput} type="file" multiple hidden onChange={(e) => setDeliverFiles([...deliverFiles, ...Array.from(e.target.files || [])])} />
          <button onClick={() => changeStatus('delivered', { message: deliverMsg, files: deliverFiles })} disabled={actionLoading} className="btn-primary mt-5 w-full !py-3">
            {actionLoading ? <Spinner size={17} className="text-white" /> : <><Send size={15} /> Deliver work</>}
          </button>
        </Modal>
      )}

      {confirmId === 'cancel' && (
        <Modal title="Cancel order" onClose={() => setConfirmId('')}>
          <p className="text-sm text-gray-500">Cancelling this order will notify the other party.</p>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setConfirmId('')} className="btn-secondary flex-1">Keep order</button>
            <button onClick={() => changeStatus('cancelled')} disabled={actionLoading} className="btn-primary flex-1 !bg-rose-600 hover:!bg-rose-700">
              {actionLoading ? <Spinner size={17} className="text-white" /> : 'Cancel order'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
