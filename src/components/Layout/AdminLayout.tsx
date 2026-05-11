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
    await logout();
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
    ...(isSuperAdmin ? [{ label: 'Staff Management', icon: Users, path: '/admin/staff' }] : []),
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
      <div className="mb-0">
        <button
          onClick={() => {
            navigate(item.path);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-6 py-4 transition-all cursor-pointer border-b border-slate-100 ${
            isActive 
              ? 'bg-brand-primary text-white' 
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-4">
            <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-brand-primary'}`} />
            <span className="font-black text-[11px] uppercase tracking-tighter">{item.label}</span>
          </div>
          {item.badge && (
            <div className={`${isActive ? 'bg-white text-brand-primary' : 'bg-brand-primary text-white'} h-5 min-w-5 px-1.5 flex items-center justify-center text-[9px] font-black`}>
              {item.badge}
            </div>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 overflow-x-hidden">
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
        className={`fixed inset-y-0 left-0 z-[100] w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Brand Bar */}
          <div className="h-12 bg-brand-primary flex items-center px-4 flex-shrink-0">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-white flex items-center justify-center text-brand-primary font-black text-sm">
                {(settings?.siteName || 'SS').substring(0, 2).toUpperCase()}
              </div>
              <h1 className="text-sm font-black tracking-tighter text-white uppercase leading-none">
                ADMIN_PANEL
              </h1>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Brief */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-200 flex items-center justify-center overflow-hidden">
                {profile?.photoURL ? <img src={profile.photoURL} className="w-full h-full object-cover" /> : <CircleUser className="h-6 w-6 text-slate-400" />}
             </div>
             <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-900 truncate uppercase">{profile?.name || 'ADMIN'}</p>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[8px] font-bold text-slate-400 uppercase">Live_Node</span>
                </div>
             </div>
          </div>

          {/* Navigation - Sheet Tabs Look */}
          <nav className="flex-1 overflow-y-auto p-0 space-y-0 custom-scrollbar">
              {menuItems.map(item => (
                <div key={item.label}>
                  <SidebarItem item={item} />
                </div>
              ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-700 hover:bg-rose-50 transition-colors font-black text-[10px] uppercase border border-rose-100"
            >
              <LogOut className="h-4 w-4" />
              <span>TERMINATE_SESSION</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Header - Spreadsheet Ribbon Bar */}
        <header 
          className="h-12 bg-brand-primary border-b border-white/10 sticky top-0 z-[60] px-4 flex items-center justify-between transition-all duration-300 w-full"
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
        <main className="flex-1 p-0 overflow-y-auto">
          <div className="h-full w-full bg-white">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

