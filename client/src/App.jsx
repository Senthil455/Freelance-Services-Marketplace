import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import SearchResults from './pages/SearchResults.jsx';
import GigDetail from './pages/GigDetail.jsx';
import SellerProfile from './pages/SellerProfile.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Checkout from './pages/Checkout.jsx';
import NotFound from './pages/NotFound.jsx';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/search', element: <SearchResults /> },
      { path: '/gig/:id', element: <GigDetail /> },
      { path: '/seller/:id', element: <SellerProfile /> },
      { path: '/category/:slug', element: <CategoryPage /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/checkout/:orderId', element: <Checkout /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
