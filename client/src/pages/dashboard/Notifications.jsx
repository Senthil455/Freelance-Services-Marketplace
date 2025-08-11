import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { timeAgo } from '../../utils/format.js';

const TYPE_COLORS = {
  order: 'bg-blue-100 text-blue-700',
  payment: 'bg-emerald-100 text-emerald-700',
  message: 'bg-purple-100 text-purple-700',
  review: 'bg-amber-100 text-amber-700',
  gig: 'bg-brand-100 text-brand-700',
  system: 'bg-gray-100 text-gray-600',
};

export default function DashboardNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/notifications')
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markRead = async (n) => {
    if (n.read) return;
    try {
      await api.put(`/notifications/${n._id}/read`);
      setNotifications((list) => list.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    } catch {}
  };

  const markAll = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((list) => list.map((x) => ({ ...x, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) { toast.error(err.message); }
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h2 text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">{unread > 0 ? `${unread} unread` : 'You are all caught up'}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="btn-secondary !py-2">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={30} /></div>
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications yet" subtitle="Order updates, messages and system alerts will show up here." icon={<Bell size={26} />} />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <Link
              key={n._id}
              to={n.link || '/dashboard'}
              onClick={() => markRead(n)}
              className={`flex items-start gap-4 rounded-xl border p-4 transition hover:shadow-card ${n.read ? 'border-gray-100 bg-white' : 'border-brand-100 bg-brand-50/40'}`}
            >
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TYPE_COLORS[n.type] || TYPE_COLORS.system}`}>
                {n.read ? <BellOff size={16} /> : <Bell size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-gray-800">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-gray-400">{timeAgo(n.createdAt)}</span>
                </div>
                {n.body && <p className="mt-0.5 text-sm leading-relaxed text-gray-500">{n.body}</p>}
              </div>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}