import { useEffect, useState } from 'react';
import { Search, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import Pagination from '../../components/Pagination.jsx';
import Avatar from '../../components/Avatar.jsx';
import { Modal } from '../GigDetail.jsx';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, STATUS_COLORS } from '../../utils/format.js';

const STATUS_FILTERS = ['', 'pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'revision', 'disputed'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [dispute, setDispute] = useState(null);
  const [decision, setDecision] = useState('complete');
  const [reason, setReason] = useState('');

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), limit: '15' });
    if (query) q.set('query', query);
    if (status) q.set('status', status);
    api.get(`/admin/orders?${q.toString()}`)
      .then(({ data }) => {
        setOrders(data.orders || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, status]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const resolve = async () => {
    setBusy(dispute._id);
    try {
      await api.put(`/admin/orders/${dispute._id}/dispute`, { decision, reason });
      toast.success(`Dispute resolved — order ${decision === 'complete' ? 'completed' : 'cancelled'}`);
      setDispute(null);
      setReason('');
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
          <h1 className="h2 text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">{total} total orders</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto !py-2">
            {STATUS_FILTERS.map((s) => (
              <option key={s || 'all'} value={s}>{s ? s.replace('_', ' ') : 'All statuses'}</option>
            ))}
          </select>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order ID or gig…" className="input !pl-9 !py-2" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition ${status === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {s ? s.replace('_', ' ') : 'All'} {s === 'disputed' && orders.some((o) => o.status === 'disputed') ? `(${orders.filter((o) => o.status === 'disputed').length})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={30} /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3.5 font-bold">Order</th>
                <th className="px-4 py-3.5 font-bold">Buyer</th>
                <th className="px-4 py-3.5 font-bold">Seller</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 font-bold">Total</th>
                <th className="px-4 py-3.5 font-bold">Date</th>
                <th className="px-5 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o._id} className="transition hover:bg-gray-50/70">
                  <td className="max-w-[260px] px-5 py-3.5">
                    <p className="text-[10px] font-extrabold tracking-wider text-gray-400">{o.orderId}</p>
                    <p className="line-clamp-1 font-bold text-gray-800">{o.gigTitle}</p>
                    <p className="text-xs text-gray-400 capitalize">{o.packageName} · {o.deliveryDays}d</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar user={o.buyer} size={24} />
                      <span className="text-xs text-gray-600">{o.buyer?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar user={o.seller} size={24} />
                      <span className="text-xs text-gray-600">{o.seller?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{ORDER_STATUS_LABELS[o.status] || o.status}</span>
                    {o.status === 'disputed' && <span className="badge ml-1.5 bg-rose-100 text-rose-700"><AlertTriangle size={11} /> Dispute</span>}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-gray-800">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <a href={`/dashboard/orders/${o._id}`} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100" title="Open order">
                        <ShieldCheck size={15} />
                      </a>
                      {o.status === 'disputed' && (
                        <button onClick={() => setDispute(o)} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100">
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {dispute && (
        <Modal title={`Resolve dispute — ${dispute.orderId}`} onClose={() => setDispute(null)}>
          <p className="text-sm text-gray-600">{dispute.gigTitle}</p>
          <p className="mt-1 text-xs text-gray-400">
            {dispute.buyer?.name} (buyer) vs {dispute.seller?.name} (seller) · amount {formatPrice(dispute.total)}
          </p>
          {dispute.cancellationReason && (
            <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">Dispute note: {dispute.cancellationReason}</div>
          )}
          <label className="label mt-4">Decision</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecision('complete')}
              className={`rounded-xl border-2 p-3.5 text-left transition ${decision === 'complete' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}
            >
              <ShieldCheck size={16} className={decision === 'complete' ? 'text-emerald-600' : 'text-gray-400'} />
              <p className="mt-1 text-sm font-bold text-gray-800">Complete order</p>
              <p className="text-xs text-gray-500">Release payment to seller</p>
            </button>
            <button
              type="button"
              onClick={() => setDecision('cancel')}
              className={`rounded-xl border-2 p-3.5 text-left transition ${decision === 'cancel' ? 'border-rose-500 bg-rose-50' : 'border-gray-200'}`}
            >
              <XCircle size={16} className={decision === 'cancel' ? 'text-rose-600' : 'text-gray-400'} />
              <p className="mt-1 text-sm font-bold text-gray-800">Cancel order</p>
              <p className="text-xs text-gray-500">Refund the buyer</p>
            </button>
          </div>
          <label className="label mt-4">Reason (shown to both parties)</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Explain the resolution…" className="input resize-none" />
          <button onClick={resolve} disabled={busy === dispute._id} className="btn-primary mt-5 w-full !py-3">
            {busy === dispute._id ? <Spinner size={17} className="text-white" /> : `Resolve — ${decision === 'complete' ? 'complete' : 'cancel'} order`}
          </button>
        </Modal>
      )}
    </div>
  );
}