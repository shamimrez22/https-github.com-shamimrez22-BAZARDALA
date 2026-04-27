import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ShoppingBag, Package, Heart, Settings, User, Camera, Save } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { optimizeProfileImage } from '../lib/image-utils';

const UserDashboard = () => {
  const { user, profile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('MY_ORDERS');
  const [savingProfile, setSavingProfile] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: profile?.name || user?.displayName || '',
    photoURL: profile?.photoURL || user?.photoURL || ''
  });

  useEffect(() => {
    if (profile || user) {
      setProfileData({
        name: profile?.name || user?.displayName || '',
        photoURL: profile?.photoURL || user?.photoURL || ''
      });
    }
  }, [profile, user]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const optimized = await optimizeProfileImage(reader.result as string);
          setProfileData(prev => ({ ...prev, photoURL: optimized }));
        } catch (err) {
          toast.error('Image optimization failed');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserProfile({
        name: profileData.name,
        photoURL: profileData.photoURL
      });
      toast.success('Profile updated successfully');
      setActiveTab('MY_ORDERS');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="bg-slate-50/30 min-h-screen pb-20 font-sans">
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-20 py-8 md:py-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Sidebar / Identity Hub */}
          <div className="w-full xl:w-[350px] space-y-6">
            <div className="bg-white rounded-none shadow-xl overflow-hidden relative border-2 border-[#777]">
              <div className="bg-slate-900 h-32 border-b-2 border-slate-900 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>
              <div className="px-6 pb-8 -mt-16 text-center relative z-10">
                <div className="w-32 h-32 rounded-none bg-white p-2 mx-auto mb-6 shadow-lg border-2 border-[#777] group">
                  <div className="w-full h-full rounded-none overflow-hidden bg-[#f8f8f8] relative">
                    <img
                      src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                      alt="Avatar"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-2">
                  {user?.displayName || 'User Session'}
                </h2>
                <div className="inline-block px-4 py-1.5 bg-[#f8f8f8] border border-[#777] rounded-none text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                  {user?.email}
                </div>
                
                <div className="flex items-center justify-between p-4 bg-[#f8f8f8] border-2 border-[#777] rounded-none shadow-inner">
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">{orders.length}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Total Logs</p>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-300 rounded-none mx-2" />
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">{profile?.wishlist?.length || 0}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Assets</p>
                  </div>
                </div>
              </div>
            </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'MY_ORDERS', label: 'ORDER_HISTORY', icon: ShoppingBag },
                  { id: 'MY_WISHLIST', label: 'FAVORITES', icon: Heart },
                  { id: 'EDIT_PROFILE', label: 'MODIFY_PROFILE', icon: User },
                  { id: 'SETTINGS', label: 'CORE_SETTINGS', icon: Settings },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(item.id)}
                    className={`group w-full flex items-center justify-between px-6 py-4 rounded-none text-[12px] font-black uppercase tracking-widest transition-all border-2 ${
                      activeTab === item.id 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                      : 'bg-white border-[#777] text-slate-400 hover:bg-[#f8f8f8] shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-none border-2 transition-colors ${activeTab === item.id ? 'bg-white border-transparent text-slate-900' : 'bg-[#f8f8f8] border-[#777] text-slate-300'}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-none border-2 border-[#777] transform transition-all ${activeTab === item.id ? 'bg-[#9B2B2C] scale-100' : 'bg-transparent scale-50'}`} />
                  </button>
                ))}
              </div>
          </div>

          {/* Main Action Terminal */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'MY_ORDERS' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-10"
                >
                  <div className="bg-white rounded-none p-8 md:p-10 shadow-2xl border-2 border-[#777] relative overflow-hidden">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4 relative z-10 border-b-4 border-[#9B2B2C] pb-3 inline-block">DISPATCH_HISTORY</h1>
                    <div className="flex items-center gap-3 relative z-10 mt-4">
                       <div className="w-2 h-2 bg-[#9B2B2C] rounded-none animate-pulse" />
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Accessing verified purchase logs for your session</p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="space-y-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-40 bg-white rounded-none animate-pulse border-2 border-[#777]" />
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-none p-8 md:p-10 shadow-xl border-2 border-[#777] group relative overflow-hidden"
                          >
                            <div className="flex flex-col lg:flex-row justify-between items-center gap-10 relative z-10">
                              <div className="flex flex-col md:flex-row gap-8 items-center w-full lg:w-auto">
                                <div className="w-24 h-24 bg-[#f8f8f8] border-2 border-[#777] rounded-none flex items-center justify-center relative shadow-inner">
                                  <ShoppingBag className="h-10 w-10 text-slate-400" />
                                </div>
                                
                                <div className="text-center md:text-left">
                                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                                    <span className="text-[12px] font-black text-slate-400 px-4 py-1 bg-[#f8f8f8] border border-[#777] rounded-none">
                                      #{order?.orderId || order?.id?.slice(0, 8).toUpperCase() || 'UNKNOWN'}
                                    </span>
                                    <div className={`px-4 py-1 rounded-none border-2 border-slate-900 text-[10px] font-black uppercase tracking-widest ${
                                      order?.status === 'delivered' ? 'bg-green-600 text-white' : 
                                      'bg-[#9B2B2C] text-white'
                                    }`}>
                                      {order?.status?.toUpperCase() || 'PENDING'}
                                    </div>
                                  </div>
                                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 opacity-60">
                                    LOGGED: {order?.createdAt?.toDate ? format(order.createdAt.toDate(), 'PPP HH:mm') : 'ACTIVE_SESSION'}
                                  </p>
                                  <div className="flex justify-center md:justify-start gap-3">
                                    {order?.items?.slice(0, 4).map((item: any, i: number) => (
                                      <div key={i} className="w-12 h-12 rounded-none border-2 border-slate-900 overflow-hidden bg-white p-1">
                                        <img src={item?.image || 'https://picsum.photos/seed/thumb/100/100'} alt="" className="w-full h-full object-cover rounded-none" />
                                      </div>
                                    ))}
                                    {order?.items && order.items.length > 4 && (
                                      <div className="w-12 h-12 rounded-none border-2 border-[#777] bg-[#f8f8f8] flex items-center justify-center text-[10px] font-black text-slate-400">
                                        +{order.items.length - 4}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-row lg:flex-col justify-between items-center lg:items-end w-full lg:w-auto pt-8 lg:pt-0 border-t-2 lg:border-t-0 lg:border-l-2 border-[#777] lg:pl-10">
                                <div className="text-right lg:mb-6">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">VALUATION</p>
                                  <p className="text-4xl font-black text-slate-900 tracking-tighter">৳{(order?.total || 0).toLocaleString()}</p>
                                </div>
                                <button 
                                  onClick={() => navigate(`/tracking?id=${order.orderId}`)}
                                  className="px-10 py-4 bg-slate-900 text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-[#9B2B2C] transition-all shadow-lg active:scale-95"
                                >
                                  TRACE_PARCEL
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-40 bg-white rounded-none shadow-2xl border-2 border-[#777]">
                        <div className="w-32 h-32 bg-[#f8f8f8] border-2 border-[#777] rounded-none flex items-center justify-center mx-auto mb-10 shadow-inner">
                          <ShoppingBag className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">LOGS_REGISTRY_EMPTY</h3>
                        <p className="text-[12px] text-slate-400 font-black uppercase tracking-[0.2em] mb-12 max-w-sm mx-auto leading-relaxed">You haven't initiated any dispatches yet. Access global collections to start.</p>
                        <button className="bg-slate-900 hover:bg-[#9B2B2C] text-white px-12 py-5 text-[12px] font-black uppercase tracking-widest rounded-none shadow-xl active:scale-95 transition-all" onClick={() => navigate('/shop')}>
                          ACCESS_COLLECTIONS
                        </button>
                      </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'EDIT_PROFILE' && (
                <motion.div
                  key="edit_profile"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-10"
                >
                  <div className="bg-white rounded-none p-8 md:p-10 shadow-2xl border-2 border-[#777] relative overflow-hidden">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4 relative z-10 border-b-4 border-[#9B2B2C] pb-3 inline-block">IDENTITY_CORE</h1>
                    <div className="flex items-center gap-3 relative z-10 mt-4">
                       <div className="w-2 h-2 bg-[#9B2B2C] rounded-none animate-pulse" />
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Modify your authentication identity across the network</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-none p-12 md:p-16 shadow-2xl border-2 border-[#777]">
                    <form onSubmit={handleProfileSave} className="max-w-3xl mx-auto space-y-12">
                      <div className="flex flex-col md:flex-row items-center gap-12 pb-12 border-b-2 border-[#777]">
                        <div className="relative group">
                          <div className="w-44 h-44 bg-[#f8f8f8] rounded-none shadow-inner overflow-hidden flex items-center justify-center p-2 border-2 border-[#777]">
                            <div className="w-full h-full rounded-none overflow-hidden border-2 border-slate-900">
                              {profileData.photoURL ? (
                                <img src={profileData.photoURL} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <User className="h-16 w-16 text-slate-300" />
                              )}
                            </div>
                          </div>
                          <label className="absolute inset-4 rounded-none flex items-center justify-center bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-md">
                            <Camera className="h-10 w-10 text-white" />
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                        </div>
                        <div className="text-center md:text-left flex-1">
                          <h3 className="text-sm font-black uppercase tracking-widest text-[#9B2B2C] mb-3">AVATAR_DISPATCH</h3>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                            Upload a high-fidelity image for cross-network recognition. Optimized dimensions: [300x300_ENC]
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">SYSTEM_ALIAS</Label>
                          <Input 
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-[#f8f8f8] border-2 border-[#777] h-16 rounded-none font-black text-sm uppercase tracking-widest px-6 shadow-inner focus-visible:ring-0"
                            placeholder="SET_ALIAS"
                            required
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-2 block opacity-60">VERIFIED_CHANNEL (STATIC)</Label>
                          <Input 
                            value={user?.email || ''} 
                            disabled 
                            className="bg-[#f8f8f8] border-2 border-[#777]/20 h-16 rounded-none font-black text-sm text-slate-300 px-6 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={savingProfile}
                        className="w-full bg-slate-900 hover:bg-[#9B2B2C] text-white py-6 rounded-none font-black uppercase tracking-widest text-[12px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-5 group"
                      >
                        <Save className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        {savingProfile ? 'SYNCHRONIZING_ID...' : 'CONFIRM_GLOBAL_CHANGES'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
