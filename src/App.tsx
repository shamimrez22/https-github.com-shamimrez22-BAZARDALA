import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { UserLayout } from './components/Layout/UserLayout';
import { AdminLayout } from './components/Layout/AdminLayout';
import { Toaster } from './components/ui/sonner';
import { SmoothScroll } from './components/SmoothScroll';
import { ShoppingBasket } from 'lucide-react';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
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
const AIChatbot = lazy(() => import('./components/AIChatbot').then(m => ({ default: m.AIChatbot })));

import { SettingsProvider, useSettings } from './context/SettingsContext';

const LoadingFallback = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-[#f4e4d4]">
    <div className="relative mb-12">
      <div className="w-24 h-24 border-4 border-[#9B2B2C]/20 border-t-[#9B2B2C] rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center text-[#9B2B2C]">
        <ShoppingBasket className="h-10 w-10 animate-bounce" />
      </div>
    </div>
    <div className="text-[#9B2B2C] font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">BAZAR_DALA_PROTOCOL_LOADING</div>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) return <LoadingFallback />;
  
  if (adminOnly) {
    if (!isAdmin) return <Navigate to="/admin/login" />;
    return <>{children}</>;
  }

  if (!user) return <Navigate to="/" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppContent />
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
      <Router>
        <SmoothScroll>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
                  {/* User Routes */}
                  <Route path="/" element={<UserLayout />}>
                    <Route index element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="product/:id" element={<ProductDetails />} />
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
                  </Route>

                  {/* Admin Login */}
                  <Route path="/admin/login" element={<AdminLogin />} />

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
                    <Route path="reports" element={<AdminAnalytics />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="profile" element={<AdminProfile />} />
                  </Route>
                </Routes>
                <AIChatbot />
                <Toaster position="top-center" richColors />
              </Suspense>
            </SmoothScroll>
          </Router>
        </CartProvider>
      </ProductProvider>
  );
}
