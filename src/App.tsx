import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { UserLayout } from './components/Layout/UserLayout';
import { AdminLayout } from './components/Layout/AdminLayout';
import { Toaster } from './components/ui/sonner';
import { ShoppingBasket } from 'lucide-react';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const InfoPage = lazy(() => import('./pages/Static/InfoPage'));

import AdminErrorBoundary from './components/AdminErrorBoundary';

// Admin Pages - Lazy Loaded
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/Admin/Products'));
const AdminOrders = lazy(() => import('./pages/Admin/Orders'));
const AdminAnalytics = lazy(() => import('./pages/Admin/Analytics'));
const AdminCustomers = lazy(() => import('./pages/Admin/Customers'));
const AdminCoupons = lazy(() => import('./pages/Admin/Coupons'));
const AdminSlider = lazy(() => import('./pages/Admin/Slider'));
const AdminSettings = lazy(() => import('./pages/Admin/Settings'));
const AdminCategories = lazy(() => import('./pages/Admin/Categories'));
const AdminLimitedOffers = lazy(() => import('./pages/Admin/LimitedOffers'));
const AdminProfile = lazy(() => import('./pages/Admin/Profile'));
const AdminLogin = lazy(() => import('./pages/Admin/Login'));
const AdminStaff = lazy(() => import('./pages/Admin/Staff'));
const AdminVerify = lazy(() => import('./pages/Admin/Verify'));

import { SettingsProvider, useSettings } from './context/SettingsContext';

const LoadingFallback = () => {
  const [showRetry, setShowRetry] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowRetry(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-brand-bg relative overflow-hidden">
      {/* Background Matrix/Abstract effect for 'Hard' feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden text-[10px] font-mono leading-none break-all p-4">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="mb-1">
            {Math.random().toString(36).repeat(10)}
          </div>
        ))}
      </div>

      <div className="relative mb-12 z-10">
        <div className="w-24 h-24 border-4 border-brand-primary/20 border-t-brand-primary rounded-none animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-brand-primary">
          <ShoppingBasket className="h-10 w-10 animate-bounce" />
        </div>
      </div>
      <div className="text-brand-primary font-black uppercase tracking-[0.5em] text-[10px] animate-pulse z-10">
        BAZAR_DALA_PROTOCOL_INITIALIZING
      </div>

      {showRetry && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 flex flex-col items-center gap-4 z-10"
        >
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-center max-w-xs leading-relaxed">
            SYSTEM_RESPONSE_DELAYED_BY_NETWORK. <br/>
            PLEASE_VERIFY_CONNECTIVITY.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all rounded-none border border-white/10"
          >
            FORCE_RESYNC_PROTOCOL
          </button>
        </motion.div>
      )}
    </div>
  );
};

const Login = lazy(() => import('./pages/Login'));

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingFallback />;
  
  if (adminOnly) {
    if (!isAdmin) return <Navigate to="/admin/login" />;
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </SettingsProvider>
  );
}

const AppContent = () => {
  const { settings } = useSettings();

  React.useEffect(() => {
    if (settings?.siteName) {
      document.title = `${settings.siteName} | Premium Online Shop`;
    } else {
      document.title = 'BAZAR DALA | Premium Online Shop';
    }
  }, [settings]);

  return (
    <ProductProvider>
      <CartProvider>
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<UserLayout />}>
                      <Route index element={<Home />} />
                      <Route path="shop" element={<Shop />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="tracking" element={<OrderTracking />} />
                      <Route path="dashboard" element={
                        <ProtectedRoute>
                          <UserDashboard />
                        </ProtectedRoute>
                      } />
                    <Route path="help" element={<InfoPage />} />
                    <Route path="how-to-buy" element={<InfoPage />} />
                    <Route path="returns" element={<InfoPage />} />
                    <Route path="contact" element={<InfoPage />} />
                    <Route path="terms" element={<InfoPage />} />
                    <Route path="about" element={<InfoPage />} />
                    <Route path="careers" element={<InfoPage />} />
                    <Route path="blog" element={<InfoPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>

                  {/* Admin Login & Recovery */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/verify" element={<AdminVerify />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <AdminErrorBoundary>
                      <ProtectedRoute adminOnly>
                        <AdminLayout />
                      </ProtectedRoute>
                    </AdminErrorBoundary>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/add" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="slider" element={<AdminSlider />} />
                    <Route path="limited-offers" element={<AdminLimitedOffers />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="staff" element={<AdminStaff />} />
                    <Route path="reports" element={<AdminAnalytics />} />
                    <Route path="settings/*" element={<AdminSettings />} />
                    <Route path="profile" element={<AdminProfile />} />
                  </Route>
                </Routes>
                <Toaster position="top-center" richColors />
              </Suspense>
        </CartProvider>
      </ProductProvider>
  );
}
