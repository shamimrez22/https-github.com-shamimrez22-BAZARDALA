import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getCountFromServer,
  getDocs,
  where,
  getDoc,
  setDoc,
  doc as firestoreDoc
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Order } from '../../types';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Timer,
  Truck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
  });

  // Rebranding Migration
  useEffect(() => {
    const runMigration = async () => {
      if (!isAdmin || authLoading) return;
      
      try {
        const siteDocRef = firestoreDoc(db, 'settings', 'site');
        const siteDoc = await getDoc(siteDocRef);
        
        if (siteDoc.exists()) {
          const currentSettings = siteDoc.data();
          const oldNames = ['LuxeCart', 'Luxe Cart', 'LUXECART', 'LUXE CART', 'My App'];
          
          if (oldNames.includes(currentSettings.siteName)) {
            console.log('MIGRATION: Updating site name to BAZAR DALA');
            await setDoc(siteDocRef, {
              ...currentSettings,
              siteName: 'BAZAR DALA',
              siteDescription: currentSettings.siteDescription?.toLowerCase().includes('luxe') 
                ? 'BAZAR DALA - Your premium destination for multi-category products and deals.'
                : currentSettings.siteDescription || 'BAZAR DALA - Your premium destination for multi-category products and deals.'
            }, { merge: true });
            toast.success('System rebranded to BAZAR DALA successfully.');
          }
        }
      } catch (error) {
        console.error('Migration error:', error);
      }
    };
    
    runMigration();
  }, [isAdmin, authLoading]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch administrative statistics and recent activity
    if (authLoading || !isAdmin) return;
    
    setLoading(true);

    const fetchStats = async () => {
      try {
        const ordersCol = collection(db, 'orders');
        const productsCol = collection(db, 'products');
        const usersCol = collection(db, 'users');

        // Efficient counts
        const [ordersCount, productsCount, usersCount] = await Promise.all([
          getCountFromServer(ordersCol).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(productsCol).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(usersCol).catch(() => ({ data: () => ({ count: 0 }) }))
        ]);

        // Revenue estimation
        let revenue = 0;
        try {
          const revenueQ = query(ordersCol, orderBy('createdAt', 'desc'), limit(100));
          const revenueSnap = await getDocs(revenueQ);
          revenue = revenueSnap.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
        } catch (revErr) {
          console.error("Revenue fetch restricted:", revErr);
        }

        setStats({
          revenue,
          orders: ordersCount.data().count,
          products: productsCount.data().count,
          customers: usersCount.data().count,
        });
      } catch (err) {
        console.error("Stats fetch error handled:", err);
      }
    };

    fetchStats();

    // Still keep RECENT orders as list
    const fetchRecentOrders = async () => {
      try {
        const recentQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
        let snapshot;
        try {
          snapshot = await getDocs(recentQ);
        } catch (innerErr: any) {
          if (innerErr.message?.includes('index')) {
             snapshot = await getDocs(query(collection(db, 'orders'), limit(10)));
          } else {
            throw innerErr;
          }
        }
        setRecentOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (err: any) {
         console.error('Recent orders sync error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
    const intervalId = setInterval(fetchRecentOrders, 60000); // Poll recent orders every minute

    return () => {
      clearInterval(intervalId);
    };
  }, [authLoading, isAdmin]);

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  const StatCard = ({ title, value, icon: Icon, color, description }: any) => (
    <div className="bg-white border border-slate-200 flex flex-col group">
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
        <Icon className="h-3 w-3 text-brand-primary" />
      </div>
      <div className="p-5 flex flex-col items-center justify-center flex-1">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tight">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-slate-50 border-b border-slate-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-6 bg-brand-primary" />
             <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                Admin Dashboard
             </h1>
          </div>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">
            Status: Active // Protocol: Manual
          </p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200">
               <div className="w-2 h-2 bg-green-500 animate-pulse" />
               <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">System Online</span>
            </div>
            <button className="h-10 px-6 bg-brand-primary text-white font-black uppercase text-[10px] tracking-widest hover:opacity-90 active:scale-95 transition-all">
               Generate Report
            </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`৳${stats.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-emerald-600"
          description="Total Sales Amount"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={ShoppingBag} 
          color="bg-indigo-500"
          description="Orders Placed"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.customers} 
          icon={Users} 
          color="bg-rose-500"
          description="Registered Users"
        />
        <StatCard 
          title="Total Products" 
          value={stats.products} 
          icon={Package} 
          color="bg-amber-500"
          description="Items in Inventory"
        />
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-slate-200 flex flex-col">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
              <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-brand-primary" /> Revenue Overview
              </h2>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-brand-primary" />
                 <span className="text-[8px] font-bold text-slate-400 capitalize">Sales Graph</span>
              </div>
            </div>
            <div className="h-[400px] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748B', fontWeight: 700 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748B', fontWeight: 700 }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '0px', border: '1px solid #E2E8F0', boxShadow: 'none' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#00BCBC" strokeWidth={3} fill="url(#colorSales)" fillOpacity={1} />
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00BCBC" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#00BCBC" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 flex flex-col">
            <div className="bg-slate-50 border-b border-slate-200 p-4">
              <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Recent Orders</h2>
            </div>
            <div className="p-0 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[400px]">
              {recentOrders.map((order, i) => (
                <div key={order?.id || i} className="p-4 hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => navigate('/admin/orders')}>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-brand-primary tracking-tighter">
                        #{order?.orderId || 'PENDING_ID'}
                      </span>
                      <p className="text-[11px] font-bold text-slate-800 uppercase mt-1 leading-none">
                        {order?.customerInfo?.name || 'GUEST_USER'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-black text-slate-900">৳{(order?.total || 0).toLocaleString()}</p>
                      <div className={`mt-1 inline-block px-2 py-0.5 text-[7px] font-black uppercase tracking-widest ${
                        order?.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-brand-primary/10 text-brand-primary'
                      }`}>
                         {order?.status || 'Active'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <div className="text-center py-20">
                  <ShoppingBag className="h-10 w-10 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-300 font-bold uppercase tracking-widest text-[8px]">Empty_Registry</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <button 
                onClick={() => navigate('/admin/orders')} 
                className="w-full py-3 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95"
              >
                View All Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
