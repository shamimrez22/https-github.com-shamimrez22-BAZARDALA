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
  where
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Order } from '../../types';
import { 
  getDoc,
  setDoc,
  doc as firestoreDoc
} from 'firebase/firestore';
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
    <div className="bg-[#ead9c4] border border-[#777] shadow-sm flex flex-col">
      <div className="bg-[#9B2B2C] p-2 flex items-center justify-between">
        <span className="text-[10px] font-black text-white uppercase tracking-wider">{title}</span>
        <Icon className="h-3 w-3 text-white/70" />
      </div>
      <div className="p-4 flex flex-col items-center justify-center flex-1 bg-white/30">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-[#ead9c4] border border-[#777] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
            Admin <span className="text-slate-900">Dashboard</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Control Center // {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase">Status:</span>
            <div className="bg-[#9B2B2C] text-white px-3 py-1 text-[10px] font-black rounded uppercase tracking-widest">Online</div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#ead9c4] border border-[#777] flex flex-col">
          <div className="bg-[#9B2B2C] p-3">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Sales Analytics
            </h2>
          </div>
          <div className="h-[350px] p-4 bg-white/30">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="1 1" stroke="#77777733" />
                <XAxis 
                  dataKey="name" 
                  axisLine={true} 
                  tickLine={true} 
                  tick={{ fontSize: 9, fill: '#334155', fontWeight: 800 }} 
                />
                <YAxis 
                  axisLine={true} 
                  tickLine={true} 
                  tick={{ fontSize: 9, fill: '#334155', fontWeight: 800 }} 
                />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#9B2B2C" strokeWidth={2} fill="#9B2B2C22" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#ead9c4] border border-[#777] flex flex-col">
          <div className="bg-[#9B2B2C] p-3">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Recent Orders</h2>
          </div>
          <div className="p-0 bg-white/20 divide-y divide-[#777]/30">
            {recentOrders.map((order, i) => (
              <div key={order?.id || i} className="p-3 hover:bg-[#ead9c4]/50 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-[#9B2B2C]">
                      #{order?.orderId || (order?.id ? order.id.slice(0, 8).toUpperCase() : 'UNKNOWN')}
                    </p>
                    <p className="text-[9px] font-bold text-slate-700 uppercase mt-0.5">
                      {order?.customerInfo?.name || (order as any)?.name || 'Guest'}
                    </p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5 truncate max-w-[150px]">
                      {order?.items?.[0]?.name || (order as any)?.productName || 'Multiple Items'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-900">৳{(order?.total || 0).toLocaleString()}</p>
                    <span className="text-[7px] font-black text-[#9B2B2C] uppercase">{order?.status || 'PENDING'}</span>
                  </div>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="text-center py-10 px-4">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">No Data Available</p>
              </div>
            )}
          </div>
          <div className="p-3 bg-[#ead9c4] border-t border-[#777]">
            <button onClick={() => navigate('/admin/orders')} className="w-full py-2 bg-[#9B2B2C] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#7e2323] transition-all">
              View All Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
