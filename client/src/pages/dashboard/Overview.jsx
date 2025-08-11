import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ShoppingBag, Clock, CheckCircle2, Star, Megaphone, Wallet, ArrowUpRight,
  PlusCircle, MessageSquare, Heart,
} from 'lucide-react';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import Avatar from '../../components/Avatar.jsx';
import { formatPrice, ORDER_STATUS_LABELS, STATUS_COLORS, timeAgo } from '../../utils/format.js';

export default function DashboardOverview() {
  const { user } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size={30} /></div>;
  if (!data) return null;

  const { stats, recentOrders } = data;
  const isSeller = user?.role === 'seller' || user?.isSeller;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white sm:p-8">
        <h1 className="text-2xl font-extrabold">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-sm text-brand-100">
          {isSeller
            ? `You've earned ${formatPrice(stats.earnings)} across ${stats.completedSales} completed orders.`
            : 'Track your orders, messages and saved services — all in one place.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/dashboard/gigs/new" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-brand-700 transition hover:bg-brand-50">
            <PlusCircle size={16} /> Create a gig
          </Link>
          <Link to="/dashboard/orders" className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/25">
            View orders <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label={isSeller ? 'Incoming orders' : 'Orders placed'} value={isSeller ? stats.sellerOrders : stats.buyerOrders} color="text-blue-600 bg-blue-50" />
        <StatCard icon={Clock} label="Active orders" value={stats.activeOrders} color="text-amber-600 bg-amber-50" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="text-emerald-600 bg-emerald-50" />
        {isSeller ? (
          <StatCard icon={Wallet} label="Total earnings" value={formatPrice(stats.earnings)} color="text-brand-600 bg-brand-50" />
        ) : (
          <StatCard icon={Star} label="Awaiting review" value={stats.pendingReviews} color="text-purple-600 bg-purple-50" />
        )}
      </div>

      {isSeller && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Megaphone} label="Active gigs" value={stats.gigCount} color="text-brand-600 bg-brand-50" />
          <StatCard icon={Star} label="Seller rating" value={stats.rating ? `${stats.rating.toFixed(1)} ★` : '—'} color="text-amber-600 bg-amber-50" />
          <StatCard icon={CheckCircle2} label="Completed sales" value={stats.completedSales} color="text-emerald-600 bg-emerald-50" />
          <StatCard icon={Wallet} label="Pending payout" value={formatPrice(stats.pendingPayout)} color="text-gray-600 bg-gray-100" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-bold text-gray-900">Recent orders</h2>
            <Link to="/dashboard/orders" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <ShoppingBag size={30} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No orders yet. Explore services and place your first order!</p>
              <Link to="/search" className="btn-primary mt-4">Browse services</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((o) => (
                <Link key={o._id} to={`/dashboard/orders/${o._id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-gray-50">
                  <img src={o.gigImage || o.gig?.images?.[0]} alt="" className="h-12 w-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{o.gigTitle}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                      <Avatar user={isSeller ? o.buyer : o.seller} size={16} />
                      {isSeller ? o.buyer?.name : o.seller?.name} · {timeAgo(o.createdAt)}
                    </p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{ORDER_STATUS_LABELS[o.status] || o.status}</span>
                  <span className="hidden w-20 text-right text-sm font-bold text-gray-800 sm:block">{formatPrice(o.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Quick actions</h3>
            <div className="mt-3 space-y-2">
              <QuickLink to="/dashboard/messages" icon={<MessageSquare size={16} />} label="Open messages" />
              <QuickLink to="/dashboard/wishlist" icon={<Heart size={16} />} label="View wishlist" />
              {!isSeller && <QuickLink to="/dashboard/gigs/new" icon={<PlusCircle size={16} />} label="Become a seller" />}
              <QuickLink to="/dashboard/notifications" icon={<Clock size={16} />} label="Notifications" />
            </div>
          </div>

          {stats.pendingReviews > 0 && (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-purple-800"><Star size={15} /> Reviews to leave</h3>
              <p className="mt-1 text-xs text-purple-700">You have {stats.pendingReviews} completed order{stats.pendingReviews > 1 ? 's' : ''} waiting for your review.</p>
              <Link to="/dashboard/orders?status=completed" className="mt-3 inline-block text-xs font-bold text-purple-800 underline">Review now</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon size={19} />
      </span>
      <p className="mt-3 text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
  );
}

function QuickLink({ to, icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">
      <span className="text-gray-400">{icon}</span> {label}
    </Link>
  );
}