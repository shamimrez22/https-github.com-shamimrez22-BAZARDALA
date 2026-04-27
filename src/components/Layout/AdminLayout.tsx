import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBasket,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Ticket,
  FileText,
  Bell,
  Settings,
  Search,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  PlusCircle,
  List,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Image as ImageIcon,
  Timer,
  Zap,
  CircleUser
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { auth, db } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, limit, getCountFromServer, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import { useSettings } from '../../context/SettingsContext';

export const AdminLayout: React.FC = () => {
  const { user, profile, logoutAdmin, isAdmin, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Products', 'Orders']);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024 && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle resize to auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (authLoading || !isAdmin) return;

    // Periodically fetch count efficiently
    const fetchPendingCount = async () => {
      try {
        const q = query(collection(db, 'orders'), where('status', '==', 'pending'));
        const snapshot = await getCountFromServer(q);
        setPendingOrdersCount(snapshot.data().count);
      } catch (error) {
        // Silent catch for permissions to prevent crashing the whole layout
        console.warn('Admin count sync limited (check auth):', (error as any).message);
      }
    };

    fetchPendingCount();
    const countIntervalId = setInterval(fetchPendingCount, 30000); // Polling every 30s

    // Listen for actual notifications 
    const fetchNotifications = async () => {
      if (!auth.currentUser && db.app.options.apiKey) return;

      try {
        const notificationsQuery = query(
          collection(db, 'notifications'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const snapshot = await getDocs(notificationsQuery);
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Detect new notifications to show toast if not first load
        if (recentNotifications.length > 0) {
          const latestCount = snapshot.docs.length;
          const prevLatestId = recentNotifications[0]?.id;
          const currentLatestId = notifs[0]?.id;

          if (currentLatestId && currentLatestId !== prevLatestId) {
             const data = notifs[0] as any;
             toast.success('System Update', {
               description: data.message || 'New order manifest received',
               action: {
                 label: 'View',
                 onClick: () => navigate('/admin/orders')
               }
             });
          }
        }

        setRecentNotifications(notifs);
      } catch (error) {
        console.warn('Notification sync limited:', (error as any).message);
      }
    };

    fetchNotifications();
    const notifIntervalId = setInterval(fetchNotifications, 45000); // Poll notifications every 45s

    return () => {
      clearInterval(countIntervalId);
      clearInterval(notifIntervalId);
    };
  }, [navigate, authLoading, isAdmin, recentNotifications.length]);

  const handleLogout = async () => {
    await signOut(auth);
    logoutAdmin();
    navigate('/admin/login');
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Manage Products', icon: Package, path: '/admin/products' },
    { label: 'Add Product', icon: PlusCircle, path: '/admin/products/add' },
    { label: 'All Orders', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'Pending Orders', icon: Timer, path: '/admin/orders?status=pending', badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
    { label: 'Customers', icon: Users, path: '/admin/customers' },
    { label: 'Slider Banners', icon: ImageIcon, path: '/admin/slider' },
    { label: 'Limited Offers', icon: Zap, path: '/admin/limited-offers' },
    { label: 'Categories', icon: List, path: '/admin/categories' },
    { label: 'Coupons', icon: Ticket, path: '/admin/coupons' },
    { label: 'Profile Settings', icon: CircleUser, path: '/admin/profile' },
    { label: 'Reports & Logs', icon: FileText, path: '/admin/reports' },
    { label: 'Control Center', icon: Settings, path: '/admin/settings' },
  ];

  const SidebarItem = ({ item }: { item: any }) => {
    const isActive = location.pathname === item.path;

    return (
      <div className="mb-2">
        <Link
          to={item.path}
          className={`flex items-center justify-between px-5 py-4 border border-[#777]/40 ${
            isActive 
              ? 'bg-[#9B2B2C] text-white border-[#000] shadow-[3px_3px_0px_#000]' 
              : 'bg-white text-slate-800 hover:bg-[#ead9c4] border-[#777]/20 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]'
          }`}
        >
          <div className="flex items-center gap-4">
            <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-[#9B2B2C]'}`} />
            <span className="font-black text-[12px] uppercase tracking-tighter">{item.label}</span>
          </div>
          {item.badge && (
            <Badge className={`${isActive ? 'bg-white text-[#9B2B2C]' : 'bg-rose-600 text-white'} border-none h-5 min-w-5 flex items-center justify-center p-0 text-[9px] font-black`}>
              {item.badge}
            </Badge>
          )}
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f4e4d4] text-slate-900 overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#ead9c4] border-r border-[#777] transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 border-b border-[#777] bg-[#9B2B2C]">
            <Link to="/admin" className="flex items-center gap-4 group px-2">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-[#9B2B2C] shadow-lg group-hover:rotate-[10deg] transition-all">
                <ShoppingBasket className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                  {(settings?.siteName || 'BAZAR DALA').split(' ')[0]}
                  <span className="text-yellow-400">
                    {' '}{(settings?.siteName || 'BAZAR DALA').split(' ').slice(1).join(' ')}
                  </span> Admin
                </h1>
                <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mt-1.5 font-mono">Store Management // v3.0</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {menuItems.map(item => (
                <div key={item.label}>
                  <SidebarItem item={item} />
                </div>
              ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#777] bg-[#ead9c4]">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-none text-rose-700 hover:bg-rose-50 transition-colors font-black text-[11px] uppercase border border-rose-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout Account</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        {/* Header */}
        <header className="h-16 bg-[#ead9c4] border-b border-[#777] sticky top-0 z-40 px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-4">
            {/* Desktop Sidebar Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-600 hover:bg-[#d4c1ad] rounded-lg hidden lg:flex"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile Navigation Dropdown */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-[#d4c1ad] rounded-lg border border-[#777]/20">
                    <Menu className="h-6 w-6 text-[#9B2B2C]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 bg-white border-[#777] p-2 space-y-1 shadow-2xl rounded-lg z-[100]">
                  <DropdownMenuLabel className="p-3 text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Admin_Command_Center</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#777]/20" />
                  <div className="max-h-[70vh] overflow-y-auto custom-scrollbar p-1">
                    {menuItems.map(item => (
                      <DropdownMenuItem 
                        key={item.label} 
                        onClick={() => navigate(item.path)} 
                        className={`flex items-center justify-between p-4 rounded-md transition-all mb-1 border border-transparent ${location.pathname === item.path ? 'bg-[#9B2B2C] text-white shadow-md' : 'hover:bg-[#ead9c4]/30'}`}
                      >
                        <div className="flex items-center gap-4">
                          <item.icon className={`h-4.5 w-4.5 ${location.pathname === item.path ? 'text-white' : 'text-[#9B2B2C]'}`} />
                          <span className="font-black text-[12px] uppercase tracking-tighter">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`${location.pathname === item.path ? 'bg-white text-[#9B2B2C]' : 'bg-rose-600 text-white'} text-[9px] min-w-5 h-5 flex items-center justify-center p-0 font-black rounded-full`}>
                            {item.badge}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator className="bg-[#777]/20" />
                  <DropdownMenuItem onClick={handleLogout} className="p-4 text-rose-600 font-black text-xs uppercase flex items-center gap-3">
                    <LogOut className="h-4 w-4" />
                    Logout Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="h-8 w-[1px] bg-[#777]/30 hidden md:block" />

            <nav className="hidden lg:flex items-center gap-4">
              <Link to="/" className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#d4c1ad]">
                <ExternalLink className="h-4 w-4 text-[#9B2B2C]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">View Store</span>
              </Link>
            </nav>

            <div className="h-8 w-[1px] bg-[#777]/30 hidden md:block" />
            
            <div className="relative hidden md:block w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-white border-[#777] text-slate-900 h-10 rounded-lg focus:ring-1 focus:ring-[#9B2B2C] w-full text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-[#d4c1ad] rounded-lg relative">
                  <Bell className="h-5 w-5" />
                  {pendingOrdersCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 rounded-full border border-white text-[9px] flex items-center justify-center font-black text-white">
                      {pendingOrdersCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white border-[#777] text-slate-900 p-0 rounded-lg shadow-xl">
                <div className="p-4 bg-[#9B2B2C] text-white flex items-center justify-between">
                  <h3 className="font-black uppercase tracking-tight text-sm">Notifications</h3>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => navigate('/admin/orders')}
                        className={`p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer ${!notif.read ? 'bg-amber-50/50' : ''}`}
                      >
                        <p className="text-xs font-bold text-slate-900">{notif.message || 'New System event'}</p>
                        <p className="text-[8px] text-slate-400 mt-1 uppercase">
                          {notif.createdAt && typeof notif.createdAt.toDate === 'function' 
                            ? format(notif.createdAt.toDate(), 'PPP p') 
                            : 'Just now'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">No notifications</div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-8 w-[1px] bg-[#777]/30" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-1 rounded-lg hover:bg-[#d4c1ad] transition-all border border-transparent">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#777] bg-white flex items-center justify-center">
                    {(profile?.photoURL || user?.photoURL) ? (
                      <img
                        src={profile?.photoURL || user?.photoURL}
                        alt="Admin"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CircleUser className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
              <div className="text-left hidden sm:block">
                <p className="text-[11px] font-black text-slate-900 leading-none uppercase">{profile?.name || user?.displayName || 'Admin Account'}</p>
                <p className="text-[8px] font-black text-[#9B2B2C] mt-1">ONLINE_SYNC</p>
              </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white border-[#777] text-slate-900 p-0 rounded-lg shadow-xl">
                <div className="p-4 bg-[#ead9c4] border-b border-[#777]">
                  <p className="text-xs font-black text-slate-900">{user?.email}</p>
                </div>
                <div className="p-1">
                  <DropdownMenuItem onClick={() => navigate('/admin/profile')} className="rounded-md font-bold text-xs uppercase">
                    My Account / Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/')} className="rounded-md font-bold text-xs uppercase">
                    Storefront
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="rounded-md font-bold text-xs uppercase text-rose-600">
                    Logout
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

