import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import { PageSpinner } from './components/Skeleton';

// Lazy-load pages
const Homepage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin layout component
function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Admin sidebar nav */}
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const links = [
    { label: '✦ NOIR MAN', href: '/admin', admin: true, isLogo: true },
    { label: 'Dashboard', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Orders', href: '/admin/orders' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Coupons', href: '/admin/coupons' },
    { label: '← Back to Store', href: '/' },
  ];
  return (
    <aside className="w-56 min-h-screen bg-[#0d0b09] border-r border-[rgba(201,168,76,0.1)] flex flex-col">
      <div className="p-6 border-b border-[rgba(201,168,76,0.1)]">
        <span className="font-heading text-xl tracking-[4px] text-[#f5f0eb]">NOIR <span className="text-[#c9a84c]">MAN</span></span>
        <p className="text-[10px] text-[#9e9087] mt-1 tracking-widest uppercase">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.slice(1).map(link => (
          <a key={link.label} href={link.href} className="block px-3 py-2.5 rounded text-sm text-[#9e9087] hover:text-[#c9a84c] hover:bg-[rgba(201,168,76,0.05)] transition-colors">
            {link.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Public routes with Navbar + Footer */}
        <Route path="/" element={<><Navbar /><Homepage /><Footer /></>} />
        <Route path="/shop" element={<><Navbar /><ShopPage /><Footer /></>} />
        <Route path="/product/:id" element={<><Navbar /><ProductDetailPage /><Footer /></>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes */}
        <Route path="/cart" element={<><Navbar /><ProtectedRoute><CartPage /></ProtectedRoute><Footer /></>} />
        <Route path="/checkout" element={<><Navbar /><ProtectedRoute><CheckoutPage /></ProtectedRoute><Footer /></>} />
        <Route path="/order-confirmation/:id" element={<><Navbar /><ProtectedRoute><OrderConfirmationPage /></ProtectedRoute><Footer /></>} />
        <Route path="/dashboard" element={<><Navbar /><ProtectedRoute><UserDashboardPage /></ProtectedRoute><Footer /></>} />
        <Route path="/orders/:id" element={<><Navbar /><ProtectedRoute><OrderDetailPage /></ProtectedRoute><Footer /></>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProductsPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrdersPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminRoute>} />
        <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><AdminCouponsPage /></AdminLayout></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<><Navbar /><NotFoundPage /><Footer /></>} />
      </Routes>
    </Suspense>
  );
}
