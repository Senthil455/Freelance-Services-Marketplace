import { useSelector } from 'react-redux';

export default function DashboardOverview() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white sm:p-8">
        <h1 className="text-2xl font-extrabold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-sm text-brand-100">Your dashboard is ready — real stats are coming soon.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-2xl font-extrabold text-gray-900">0</p>
          <p className="text-xs font-medium text-gray-500">Orders placed</p>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-extrabold text-gray-900">0</p>
          <p className="text-xs font-medium text-gray-500">Active orders</p>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-extrabold text-gray-900">0</p>
          <p className="text-xs font-medium text-gray-500">Completed</p>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-extrabold text-gray-900">—</p>
          <p className="text-xs font-medium text-gray-500">Rating</p>
        </div>
      </div>
    </div>
  );
}
