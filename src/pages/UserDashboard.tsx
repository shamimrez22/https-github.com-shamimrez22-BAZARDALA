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
    <div className="bg-brand-bg min-h-screen pb-20 font-sans">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Sidebar / Identity Terminal */}
          <div className="w-full xl:w-96 space-y-6">
            <div className="bg-brand-secondary border border-[#777] shadow-lg overflow-hidden relative">
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
                  { id: 'MY_ORDERS', label: 'MY_ORDERS', icon: ShoppingBag },
                  { id: 'MY_WISHLIST', label: 'MY_WISHLIST', icon: Heart },
                  { id: 'EDIT_PROFILE', label: 'EDIT_PROFILE', icon: User },
                  { id: 'SETTINGS', label: 'SETTINGS', icon: Settings },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-6 py-4 border border-[#777] text-[10px] font-black transition-all ${
                      activeTab === item.id 
                      ? 'bg-[#9B2B2C] text-white shadow-xl translate-x-2' 
                      : 'bg-white text-slate-600 hover:bg-brand-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    <div className={`h-1.5 w-1.5 rounded-full ${activeTab === item.id ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                  </button>
                ))}
              </div>
          </div>

          {/* Main Action Terminal */}
          <div className="flex-1 space-y-10">
            <AnimatePresence mode="wait">
              {activeTab === 'MY_ORDERS' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <div className="bg-brand-secondary border border-[#777] p-8 shadow-sm">
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
                                <div className="w-20 h-20 bg-brand-bg border border-[#777] flex items-center justify-center relative">
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
                                <button className="px-6 py-2 bg-brand-secondary border border-[#777] text-[9px] font-black uppercase tracking-widest hover:bg-[#9B2B2C] hover:text-white transition-all">
                                  Details
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-40 border-2 border-dashed border-[#777]/30 bg-white/20">
                        <div className="w-24 h-24 bg-brand-secondary border border-[#777] flex items-center justify-center mx-auto mb-8 shadow-xl">
                          <ShoppingBag className="h-10 w-10 text-[#9B2B2C]" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">No Orders Yet</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-10 max-w-sm mx-auto">Start shopping today to see your order history.</p>
                        <button className="bg-[#9B2B2C] text-white px-10 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg" onClick={() => navigate('/shop')}>
                          Start Shopping
                        </button>
                      </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'EDIT_PROFILE' && (
                <motion.div
                  key="edit_profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <div className="bg-brand-secondary border border-[#777] p-8 shadow-sm">
                    <h1 className="text-4xl font-black text-[#9B2B2C] uppercase tracking-tighter leading-none mb-3">Edit_Profile</h1>
                    <div className="h-1 w-20 bg-[#9B2B2C] mb-4" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Update your personal identity and avatar</p>
                  </div>

                  <div className="bg-white border border-[#777] p-10 shadow-xl">
                    <form onSubmit={handleProfileSave} className="max-w-2xl mx-auto space-y-10">
                      <div className="flex flex-col md:flex-row items-center gap-10 border-b border-[#777]/10 pb-10">
                        <div className="relative group">
                          <div className="w-32 h-32 bg-brand-bg border-4 border-brand-secondary shadow-lg overflow-hidden flex items-center justify-center">
                            {profileData.photoURL ? (
                              <img src={profileData.photoURL} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-12 w-12 text-[#9B2B2C]/30" />
                            )}
                          </div>
                          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="h-8 w-8 text-white" />
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                        </div>
                        <div className="text-center md:text-left">
                          <h3 className="text-sm font-black uppercase tracking-widest text-[#9B2B2C] mb-2">Avatar_Upload</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed max-w-xs">
                            Click image to upload. Recommended: Square ratio, JPEG format. Optimized to 300x300.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full_Name</Label>
                          <Input 
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-[#f8f8f8] border-[#777] h-12 rounded-none font-black text-sm uppercase placeholder:text-slate-300"
                            placeholder="ENTER_YOUR_NAME"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-300">Email_Address (Restricted)</Label>
                          <Input 
                            value={user?.email || ''} 
                            disabled 
                            className="bg-slate-100 border-[#777]/20 h-12 rounded-none font-bold text-sm text-slate-400"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={savingProfile}
                        className="w-full bg-[#9B2B2C] text-white py-4 font-black uppercase tracking-[0.3em] text-xs hover:bg-slate-900 transition-all shadow-[6px_6px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
                      >
                        <Save className="h-4 w-4" />
                        {savingProfile ? 'SYNCHRONIZING...' : 'SAVE_IDENTITY_CHANGES'}
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
