import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import store from './store/store.js';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import GigDetail from './pages/GigDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';
import Overview from './pages/dashboard/Overview.jsx';
import Orders from './pages/dashboard/Orders.jsx';
import OrderDetail from './pages/dashboard/OrderDetail.jsx';
import Gigs from './pages/dashboard/Gigs.jsx';
import GigEditor from './pages/dashboard/GigEditor.jsx';
import Messages from './pages/dashboard/Messages.jsx';
import Notifications from './pages/dashboard/Notifications.jsx';
import Wishlist from './pages/dashboard/Wishlist.jsx';
import Settings from './pages/dashboard/Settings.jsx';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/gig/:id" element={<GigDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="gigs" element={<Gigs />} />
              <Route path="gigs/new" element={<GigEditor />} />
              <Route path="gigs/:id/edit" element={<GigEditor />} />
              <Route path="messages" element={<Messages />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer position="top-right" />
      </Router>
    </Provider>
  );
}
