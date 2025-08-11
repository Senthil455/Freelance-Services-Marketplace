import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Megaphone, ShoppingBag, Grid3x3 } from 'lucide-react';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/gigs', label: 'Gigs', icon: Megaphone },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: Grid3x3 },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-800 bg-gray-950 lg:static lg:translate-x-0">
        <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-5">
          <img src="/favicon.svg" alt="SkillForge" className="h-8 w-8" />
          <span className="text-lg font-extrabold tracking-tight text-white">SkillForge</span>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ' +
                (isActive ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white')
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h1 className="text-lg font-bold text-gray-900">Admin</h1>
          <span className="badge bg-gray-900 text-white">Administrator</span>
        </header>
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
