import { useEffect, useState } from 'react';
import { Users, Megaphone, ShoppingBag, DollarSign } from 'lucide-react';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import { formatPrice } from '../../utils/format.js';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/overview')
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size={30} /></div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h2 text-gray-900">Platform overview</h1>
        <p className="mt-1 text-sm text-gray-500">Live snapshot of the SkillForge marketplace.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminStat icon={Users} label="Total users" value={stats.totalUsers} color="text-blue-600 bg-blue-50" />
        <AdminStat icon={Megaphone} label="Gigs" value={stats.totalGigs} color="text-brand-600 bg-brand-50" />
        <AdminStat icon={ShoppingBag} label="Orders" value={stats.totalOrders} color="text-emerald-600 bg-emerald-50" />
        <AdminStat icon={DollarSign} label="Revenue" value={formatPrice(stats.totalRevenue)} color="text-amber-600 bg-amber-50" />
      </div>
    </div>
  );
}

function AdminStat({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-4">
      <span className={'inline-flex h-9 w-9 items-center justify-center rounded-lg ' + color}><Icon size={17} /></span>
      <p className="mt-2.5 truncate text-xl font-extrabold text-gray-900">{value}</p>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
    </div>
  );
}
