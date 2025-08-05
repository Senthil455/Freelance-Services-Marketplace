import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../api/client';
import { timeAgo } from '../../utils/format.js';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then((res) => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center text-sm text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Notifications</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No notifications yet</p>
        </div>
      ) : (
        <div className="divide-y rounded-2xl border border-slate-200 bg-white">
          {items.map((n) => (
            <div key={n._id} className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm">{n.message}</p>
                <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
