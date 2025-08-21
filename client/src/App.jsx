import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import SearchResults from './pages/SearchResults.jsx';
import GigDetail from './pages/GigDetail.jsx';
import SellerProfile from './pages/SellerProfile.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Checkout from './pages/Checkout.jsx';
import NotFound from './pages/NotFound.jsx';
import DashboardOverview from './pages/dashboard/Overview.jsx';
import DashboardOrders from './pages/dashboard/Orders.jsx';
import OrderDetail from './pages/dashboard/OrderDetail.jsx';
import DashboardGigs from './pages/dashboard/Gigs.jsx';
import GigEditor from './pages/dashboard/GigEditor.jsx';
import DashboardMessages from './pages/dashboard/Messages.jsx';
import DashboardNotifications from './pages/dashboard/Notifications.jsx';
import DashboardSettings from './pages/dashboard/Settings.jsx';
import DashboardWishlist from './pages/dashboard/Wishlist.jsx';
import AdminOverview from './pages/admin/Overview.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminGigs from './pages/admin/Gigs.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import AdminCategories from './pages/admin/Categories.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/gig/:id" element={<GigDetail />} />
        <Route path="/seller/:id" element={<SellerProfile />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/checkout/:orderId"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="orders" element={<DashboardOrders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="gigs" element={<DashboardGigs />} />
        <Route path="gigs/new" element={<GigEditor />} />
        <Route path="gigs/:id/edit" element={<GigEditor />} />
        <Route path="messages" element={<DashboardMessages />} />
        <Route path="messages/:conversationId" element={<DashboardMessages />} />
        <Route path="notifications" element={<DashboardNotifications />} />
        <Route path="settings" element={<DashboardSettings />} />
        <Route path="wishlist" element={<DashboardWishlist />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="gigs" element={<AdminGigs />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
      </Route>

      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Navigate to="/" replace />} />
    </Routes>
  );
}