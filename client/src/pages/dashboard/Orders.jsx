const PLACEHOLDER = [
  { id: 'SF-1001', gig: 'Logo design for a startup', status: 'in_progress', total: 45 },
  { id: 'SF-1002', gig: 'Landing page in react', status: 'completed', total: 120 },
];

export default function DashboardOrders() {
  return (
    <div className="space-y-6">
      <h1 className="h2 text-gray-900">Orders</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Gig</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {PLACEHOLDER.map((o) => (
              <tr key={o.id}>
                <td className="px-5 py-3.5 font-semibold text-gray-700">{o.id}</td>
                <td className="px-5 py-3.5 text-gray-800">{o.gig}</td>
                <td className="px-5 py-3.5 capitalize text-gray-500">{o.status}</td>
                <td className="px-5 py-3.5 text-right font-bold text-gray-800">${o.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
