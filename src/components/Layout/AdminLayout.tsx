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
  CircleUser,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
  const { user, profile, logout, isAdmin, isSuperAdmin, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Products', 'Orders']);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    const term = searchTerm.trim().toLowerCase();
    
    // Logic: 
    // If it looks like an order (numeric or starts with #), go to orders
    // Otherwise go to customers
    if (term.startsWith('#') || /^\d+$/.test(term)) {
      navigate(`/admin/orders?search=${encodeURIComponent(term)}`);
    } else {
      navigate(`/admin/customers?search=${encodeURIComponent(term)}`);
    }
    setSearchTerm('');
  };

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
    await logout();
    navigate('/admin/login');
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const menuItems = [
    { label: 'DASHBOARD', bengaliLabel: '(ড্যাশবোর্ড)', icon: LayoutDashboard, path: '/admin' },
    { label: 'PRODUCTS', bengaliLabel: '(পণ্য তালিকা)', icon: Package, path: '/admin/products' },
    { label: 'ADD PRODUCT', bengaliLabel: '(পণ্য যোগ করুন)', icon: PlusCircle, path: '/admin/products/add' },
    { label: 'ALL ORDERS', bengaliLabel: '(সব অর্ডার)', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'PENDING FARES', bengaliLabel: '(পেন্ডিং ফেয়ারস)', icon: Timer, path: '/admin/orders?status=pending', badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
    { label: 'CUSTOMERS', bengaliLabel: '(গ্রাহক তালিকা)', icon: Users, path: '/admin/customers' },
    ...(isSuperAdmin ? [{ label: 'STAFF MANAGEMENT', bengaliLabel: '(স্টাফ ম্যানেজমেন্ট)', icon: Users, path: '/admin/staff' }] : []),
    { label: 'SLIDER BANNERS', bengaliLabel: '(স্লাইড ব্যানার)', icon: ImageIcon, path: '/admin/slider' },
    { label: 'LIMITED OFFERS', bengaliLabel: '(সীমিত সময়ের অফার)', icon: Zap, path: '/admin/limited-offers' },
    { label: 'CATEGORIES', bengaliLabel: '(ক্যাটাগরি সমূহ)', icon: List, path: '/admin/categories' },
    { label: 'COUPONS', bengaliLabel: '(কুপন সমূহ)', icon: Ticket, path: '/admin/coupons' },
    { label: 'PROFILE', bengaliLabel: '(প্রোফাইল সেটিংস)', icon: CircleUser, path: '/admin/profile' },
    { label: 'REPORTS', bengaliLabel: '(রিপোর্ট এবং লগ)', icon: FileText, path: '/admin/reports' },
    { label: 'SETTINGS', bengaliLabel: '(কন্ট্রোল সেন্টার)', icon: Settings, path: '/admin/settings' },
  ];

  const SidebarItem = ({ item }: { item: any }) => {
    const currentPath = location.pathname + location.search;
    const isActive = currentPath === item.path;

    return (
      <div className="mb-2">
        <button
          onClick={() => {
            navigate(item.path);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-4 py-2.5 transition-all cursor-pointer border-2 border-slate-900 shadow-sm ${
            isActive 
              ? 'bg-[#8B1E1E] text-white' 
              : 'bg-[#faf6f0] text-slate-800 hover:bg-[#ebd9c4]/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 flex items-center justify-center border border-slate-900/10 ${isActive ? 'bg-white/10' : 'bg-slate-100'}`}>
              <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-[#8B1E1E]'}`} />
            </div>
            <div className="text-left leading-none flex flex-col gap-1">
              <span className="font-black text-[10px] uppercase tracking-wider">{item.label}</span>
              <span className={`text-[9px] font-bold ${isActive ? 'text-white/80' : 'text-slate-500'}`}>{item.bengaliLabel}</span>
            </div>
          </div>
          {item.badge && (
            <div className={`${isActive ? 'bg-white text-[#8b1e1e]' : 'bg-[#8b1e1e] text-white'} h-5 min-w-5 px-1.5 flex items-center justify-center text-[9px] font-black border border-slate-900`}>
              {item.badge}
            </div>
          )}
        </button>
      </div>
    );
  };

  const firstName = (profile?.name || user?.displayName || 'SHAMIM').split(' ')[0].toUpperCase();

  return (
    <div className="h-[100dvh] flex bg-[#f4efe6] text-slate-900 overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Sheet Selector Style */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[100] w-64 bg-[#f4efe6] border-r-2 border-slate-900 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Brand Bar */}
          <div className="p-4 border-b-2 border-slate-900 bg-[#f4efe6] flex items-center gap-3 flex-shrink-0">
            <div className="w-11 h-11 bg-[#eae0d5] border-2 border-slate-900 flex items-center justify-center text-slate-800 shadow-sm">
              <CircleUser className="h-6 w-6 text-slate-900" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[11px] font-black text-slate-900 uppercase tracking-wider leading-none">
                SYSTEM ADMIN
              </h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[9px] text-rose-600 font-extrabold flex items-center gap-1 uppercase tracking-tight">
                  <span className="inline-block w-2.5 h-2.5 bg-rose-600 border border-slate-900 shadow-sm animate-pulse" /> LIVE_TICKET_COCKPIT
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto text-slate-900 hover:bg-slate-200 h-8 w-8 border border-slate-300">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation - Sheet Tabs Look */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-0 custom-scrollbar bg-[#f4efe6]" data-lenis-prevent>
              {menuItems.map(item => (
                <div key={item.label}>
                  <SidebarItem item={item} />
                </div>
              ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t-2 border-slate-900 bg-[#f4efe6] space-y-2 flex-shrink-0">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 bg-[#faf6f0] hover:bg-slate-100 transition-colors font-black text-[10px] uppercase border-2 border-slate-900 shadow-sm cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-slate-600 shrink-0" />
              <div className="text-left leading-none flex flex-col gap-1">
                <span className="font-extrabold tracking-wider">LOGOUT {firstName}</span>
                <span className="text-[9px] text-slate-400 font-bold">(লগ আউট)</span>
              </div>
            </button>

            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-white bg-[#8B1E1E] hover:bg-slate-950 transition-colors font-black text-[10px] uppercase border-2 border-slate-900 shadow-sm cursor-pointer animate-pulse-slow"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <div className="text-left leading-none flex flex-col gap-1">
                <span className="font-extrabold tracking-wider">CLOSE CONTROL</span>
                <span className="text-[9px] text-white/80 font-bold">(বন্ধ করুন)</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Header - Spreadsheet Ribbon Bar */}
        <header 
          className="h-12 bg-brand-primary border-b border-white/10 z-[60] px-4 flex items-center justify-between shrink-0 transition-all duration-300 w-full"
        >
          <div className="flex items-center gap-3">
            {/* Toggle Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white/70 hover:bg-white/10 border border-white/10 h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
            
            {/* Sheet Identifier */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10">
               <div className="w-2 h-2 bg-white" />
               <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                  {location.pathname.split('/').pop() || 'DASHBOARD'}
               </span>
            </div>
 
            <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
 
            <Link to="/" className="group flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 transition-colors">
              <ExternalLink className="h-4 w-4 text-white/50" />
              <span className="text-[9px] font-black uppercase tracking-tight text-white/50">Live_Storefront</span>
            </Link>

            <div className="h-6 w-[1px] bg-white/10 hidden lg:block mx-2" />

            <form onSubmit={handleSearch} className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 group-focus-within:text-white transition-colors" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="অর্ডার বা কাস্টমার খুঁজুন..."
                className="h-8 w-48 lg:w-64 bg-white/10 border-white/10 text-white placeholder:text-white/40 text-[10px] font-bold rounded-none pl-10 focus:bg-white/20 focus:border-white/20 transition-all"
              />
            </form>
          </div>
 
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-1 text-[9px] font-bold text-white/40">
                <Timer className="h-3 w-3" />
                <span>UPTIME: {format(new Date(), 'HH:mm:ss')}</span>
             </div>
 
             <div className="h-6 w-[1px] bg-white/10" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10 rounded-lg relative">
                  <Bell className="h-5 w-5" />
                  {pendingOrdersCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full border border-brand-primary text-[9px] flex items-center justify-center font-black text-brand-primary">
                      {pendingOrdersCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white border-[#777] text-slate-900 p-0 rounded-lg shadow-xl">
                <div className="p-4 bg-brand-primary text-white flex items-center justify-between">
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
 
            <div className="h-8 w-[1px] bg-white/10" />
 
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-1 rounded-lg hover:bg-white/10 transition-all border border-transparent">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-white flex items-center justify-center">
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
                <p className="text-[11px] font-black text-white leading-none uppercase">{profile?.name || user?.displayName || 'Admin Account'}</p>
                <p className="text-[8px] font-black text-white/50 mt-1">ONLINE_SYNC</p>
              </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white border-[#777] text-slate-900 p-0 rounded-lg shadow-xl">
                <div className="p-4 bg-[#ead9c4] border-b border-[#777]">
                  <p className="text-xs font-black text-slate-900">{user?.email}</p>
                </div>
                <DropdownMenuGroup className="p-1">
                  <DropdownMenuItem onClick={() => navigate('/admin/profile')} className="rounded-md font-bold text-xs uppercase">
                    My Account / Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/')} className="rounded-md font-bold text-xs uppercase">
                    Storefront
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="rounded-md font-bold text-xs uppercase text-rose-600">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content - Edge to Edge Sheet Look */}
        <main className="flex-1 p-0 overflow-y-auto custom-scrollbar" data-lenis-prevent>
          <div className="h-full w-full bg-white">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

