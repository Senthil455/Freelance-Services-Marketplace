import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Megaphone, ShoppingBag, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import Avatar from '../../components/Avatar.jsx';
import { formatPrice, formatDate } from '../../utils/format.js';

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/overview')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size={30} /></div>;
  if (!data) return null;

  const { stats, recentUsers, recentOrders } = data;
  const maxOrders = Math.max(1, ...(stats.ordersByDay || []).map((d) => d.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h2 text-gray-900">Platform overview</h1>
        <p className="mt-1 text-sm text-gray-500">Live snapshot of the SkillForge marketplace.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <AdminStat icon={Users} label="Total users" value={stats.totalUsers} color="text-blue-600 bg-blue-50" />
        <AdminStat icon={Users} label="Sellers" value={stats.totalSellers} color="text-purple-600 bg-purple-50" />
        <AdminStat icon={Megaphone} label="Gigs" value={stats.totalGigs} color="text-brand-600 bg-brand-50" />
        <AdminStat icon={ShoppingBag} label="Orders" value={stats.totalOrders} color="text-emerald-600 bg-emerald-50" />
        <AdminStat icon={DollarSign} label="Revenue" value={formatPrice(stats.totalRevenue)} color="text-amber-600 bg-amber-50" />
        <AdminStat icon={Clock} label="Active orders" value={stats.activeOrders} color="text-rose-600 bg-rose-50" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Orders — last 14 days</h2>
            <span className="text-xs text-gray-400">{stats.pendingOrders} pending now</span>
          </div>
          <div className="mt-6 flex h-44 items-end gap-2">
            {(stats.ordersByDay || []).map((d) => (
              <div key={d._id} className="group flex flex-1 flex-col items-center gap-1.5">
                <div className="relative w-full rounded-t-lg bg-brand-100 transition group-hover:bg-brand-200" style={{ height: `${Math.max(6, (d.count / maxOrders) * 100)}%` }}>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                    {d.count} · {formatPrice(d.revenue)}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400">{d._id.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-bold text-gray-900">Recent users</h2>
              <Link to="/admin/users" className="text-xs font-semibold text-brand-600 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentUsers.map((u) => (
                <div key={u._id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar user={u} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{u.name}</p>
                    <p className="truncate text-xs text-gray-400">{u.email}</p>
                  </div>
                  <span className="badge bg-gray-100 text-gray-600">{u.isSeller ? 'seller' : u.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-bold text-gray-900">Recent orders</h2>
              <Link to="/admin/orders" className="text-xs font-semibold text-brand-600 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders.map((o) => (
                <Link key={o._id} to={`/admin/orders`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-50">
                  <span className="flex h-8 w-14 items-center justify-center rounded-md bg-gray-100 text-[10px] font-extrabold tracking-wider text-gray-500">
                    {o.orderId?.replace('FS-', '')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{o.gigTitle}</p>
                    <p className="text-xs text-gray-400">{o.buyer?.name} → {o.seller?.name}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{formatPrice(o.price)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminStat({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-4">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}><Icon size={17} /></span>
      <p className="mt-2.5 truncate text-xl font-extrabold text-gray-900">{value}</p>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
    </div>
  );
}