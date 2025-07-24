import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Megaphone, MessageSquare, Bell, Heart,
  Settings, LogOut, Menu, X, ExternalLink,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/dashboard/gigs', label: 'My Gigs', icon: Megaphone },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="SkillForge" className="h-8 w-8" />
            <span className="text-lg font-extrabold tracking-tight text-brand-600">SkillForge</span>
          </Link>
          <button className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 p-3">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100">
            <ExternalLink size={18} /> View site
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
