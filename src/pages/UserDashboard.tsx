import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ShoppingBag, Package, Heart, Settings, User } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error('Fetch user orders error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
  };

  return (
    <div className="bg-[#f4e4d4] min-h-screen pb-20 font-sans">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Sidebar / Identity Terminal */}
          <div className="w-full xl:w-96 space-y-6">
            <div className="bg-[#ead9c4] border border-[#777] shadow-lg overflow-hidden relative">
              <div className="bg-[#9B2B2C] h-24 border-b border-[#777]" />
              <div className="px-8 pb-10 -mt-12 text-center relative z-10">
                <div className="w-28 h-28 border border-[#777] bg-white p-1 mx-auto mb-6 shadow-2xl">
                  <div className="w-full h-full border border-[#777]/20 overflow-hidden">
                    <img
                      src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                      alt="Avatar"
                      className="w-full h-full object-cover grayscale opacity-80"
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-2">
                  USER: {user?.displayName?.toUpperCase()}
                </h2>
                <div className="inline-block px-3 py-1 bg-white border border-[#777] text-[9px] font-black uppercase tracking-widest text-[#9B2B2C] mb-8">
                  {user?.email}
                </div>
                
                <div className="flex justify-center gap-6 border-t border-[#777]/20 pt-8">
                  <div className="text-center">
                    <p className="text-2xl font-black text-[#9B2B2C] tracking-tighter">{orders.length}</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Logs</p>
                  </div>
                  <div className="w-[1px] h-10 bg-[#777]/20" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-[#9B2B2C] tracking-tighter">{profile?.wishlist?.length || 0}</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Assets</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'MY_ORDERS', icon: ShoppingBag, active: true },
                { label: 'MY_WISHLIST', icon: Heart },
                { label: 'EDIT_PROFILE', icon: User },
                { label: 'SETTINGS', icon: Settings },
              ].map((item, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center justify-between px-6 py-4 border border-[#777] text-[10px] font-black transition-all ${
                    item.active 
                    ? 'bg-[#9B2B2C] text-white shadow-xl translate-x-2' 
                    : 'bg-white text-slate-600 hover:bg-[#ead9c4]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <div className={`h-1.5 w-1.5 rounded-full ${item.active ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Main Action Terminal */}
          <div className="flex-1 space-y-10">
            <div className="bg-[#ead9c4] border border-[#777] p-8 shadow-sm">
              <h1 className="text-4xl font-black text-[#9B2B2C] uppercase tracking-tighter leading-none mb-3">Recent_Orders</h1>
              <div className="h-1 w-20 bg-[#9B2B2C] mb-4" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Your order history and tracking detail</p>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-white border border-[#777] p-1 opacity-40 animate-pulse">
                    <div className="w-full h-full border border-[#777]/20" />
                  </div>
                ))}
              </div>
            ) : orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white border border-[#777] group hover:shadow-2xl transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                         <Package className="h-16 w-16 text-[#9B2B2C]" />
                      </div>

                      <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                        <div className="flex gap-8 items-center w-full md:w-auto">
                          <div className="w-20 h-20 bg-[#f4e4d4] border border-[#777] flex items-center justify-center relative">
                            <ShoppingBag className="h-8 w-8 text-[#9B2B2C]" />
                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#9B2B2C]" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-black text-[#9B2B2C] border-b border-[#9B2B2C] font-mono">
                                #{order?.orderId || order?.id?.slice(0, 8).toUpperCase() || 'UNKNOWN'}
                              </span>
                              <div className={`px-2 py-0.5 border text-[8px] font-black uppercase tracking-widest ${
                                order?.status === 'delivered' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 
                                'border-amber-500 text-amber-600 bg-amber-50'
                              }`}>
                                {order?.status || 'PENDING'}
                              </div>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                              Logged: {order?.createdAt?.toDate ? format(order.createdAt.toDate(), 'PPP HH:mm') : 'Just now'}
                            </p>
                            <div className="flex gap-2">
                              {order?.items?.slice(0, 4).map((item: any, i: number) => (
                                <div key={i} className="w-10 h-10 border border-[#777]/20 p-0.5 bg-[#f8f8f8]">
                                  <img src={item?.image || 'https://picsum.photos/seed/thumb/100/100'} alt="" className="w-full h-full object-cover grayscale" />
                                </div>
                              ))}
                              {order?.items && order.items.length > 4 && (
                                <div className="w-10 h-10 border border-[#777]/20 flex items-center justify-center text-[10px] font-black text-slate-400 bg-white">
                                  +{order.items.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto border-t md:border-t-0 md:border-l border-[#777]/10 pt-6 md:pt-0 md:pl-10">
                          <div className="text-right mb-4">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total_Price</p>
                            <p className="text-3xl font-black text-[#9B2B2C] tracking-tighter">৳{(order?.total || 0).toLocaleString()}</p>
                          </div>
                          <button className="px-6 py-2 bg-[#ead9c4] border border-[#777] text-[9px] font-black uppercase tracking-widest hover:bg-[#9B2B2C] hover:text-white transition-all">
                            Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
            ) : (
                <div className="text-center py-40 border-2 border-dashed border-[#777]/30 bg-white/20">
                  <div className="w-24 h-24 bg-[#ead9c4] border border-[#777] flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <ShoppingBag className="h-10 w-10 text-[#9B2B2C]" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">No Orders Yet</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-10 max-w-sm mx-auto">Start shopping today to see your order history.</p>
                  <button className="bg-[#9B2B2C] text-white px-10 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg" onClick={() => navigate('/shop')}>
                    Start Shopping
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
