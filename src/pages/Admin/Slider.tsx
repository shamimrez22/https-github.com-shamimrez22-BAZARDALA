import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Trash2, Plus, Image as ImageIcon, Save, Info } from 'lucide-react';
import { toast } from 'sonner';

import { optimizeSliderImage } from '../../lib/image-utils';

interface SliderBanner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

const AdminSlider = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [banners, setBanners] = useState<SliderBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newBanner, setNewBanner] = useState({
    image: '',
    title: '',
    subtitle: '',
    link: '/shop'
  });

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    fetchBanners();
  }, [authLoading, isAdmin]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'slider_banners'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SliderBanner));
      setBanners(data);
    } catch (error) {
      console.error('Fetch banners error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.image) {
      toast.error('Please provide an image');
      return;
    }

    const tempId = Math.random().toString(36).substr(2, 9);
    const originalBanners = [...banners];
    const bannerData = {
      image: newBanner.image,
      title: newBanner.title,
      subtitle: newBanner.subtitle,
      link: newBanner.link,
    };

    try {
      // Optimistic Add
      const optimisticBanner = { id: tempId, ...bannerData } as SliderBanner;
      setBanners(prev => [...prev, optimisticBanner]);
      
      setNewBanner({ image: '', title: '', subtitle: '', link: '/shop' });
      setIsAdding(false);

      const docRef = await addDoc(collection(db, 'slider_banners'), {
        ...bannerData,
        createdAt: serverTimestamp()
      });
      
      // Update with real ID
      setBanners(prev => prev.map(b => b.id === tempId ? { ...b, id: docRef.id } : b));
      toast.success('Banner added successfully');
    } catch (error: any) {
      console.error('Add banner error:', error);
      setBanners(originalBanners);
      toast.error(`Failed to add banner: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    
    const originalBanners = [...banners];
    try {
      // Optimistic Delete
      setBanners(prev => prev.filter(b => b.id !== id));
      await deleteDoc(doc(db, 'slider_banners', id));
      toast.success('Banner deleted');
    } catch (error) {
      console.error('Delete error:', error);
      setBanners(originalBanners);
      toast.error('Failed to delete banner');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const optimized = await optimizeSliderImage(reader.result as string);
        setNewBanner({ ...newBanner, image: optimized });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-[#ead9c4] border-b border-[#777] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
            Banner <span className="text-slate-900">Control</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Homepage Hero Rotation // Operation Protocol 66 // {banners.length} Slots Active
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`h-10 px-6 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
            isAdding ? 'bg-rose-600 text-white' : 'bg-brand-primary hover:bg-slate-900 text-white'
          }`}
        >
          {isAdding ? 'CANCEL_PROTOCOL' : <><Plus className="mr-2 h-4 w-4" /> ADD_NEW_BANNER_NODE</>}
        </button>
      </div>

      <div className="p-8 space-y-8">
        {isAdding && (
          <div className="bg-white border border-slate-200 p-8 animate-in fade-in slide-in-from-top-6 duration-300">
            <h2 className="text-xs font-black text-slate-900 uppercase mb-8 border-b border-slate-100 pb-4 flex items-center gap-3">
              <ImageIcon className="h-4 w-4 text-brand-primary" /> DATA_ENTRY_SPECIFICATION
            </h2>
            <form onSubmit={handleAddBanner} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visual Payload (1920x800)</Label>
                  <div className="relative group">
                    <div className={`aspect-[21/9] border border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden transition-all ${newBanner.image ? 'border-brand-primary' : 'hover:border-brand-primary'}`}>
                      {newBanner.image ? (
                        <img src={newBanner.image} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      ) : (
                        <div className="text-center p-4">
                          <Plus className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">DRAG_DROP_OR_CLICK</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Identifier (Title)</Label>
                    <Input 
                      value={newBanner.title}
                      onChange={e => setNewBanner({...newBanner, title: e.target.value})}
                      placeholder="e.g. MEGA SALE"
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus:border-brand-primary outline-none focus-visible:ring-0 uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Meta Descriptor (Subtitle)</Label>
                    <Input 
                      value={newBanner.subtitle}
                      onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})}
                      placeholder="SHORT DESCRIPTION"
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus:border-brand-primary outline-none focus-visible:ring-0 uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Routing Path (Link)</Label>
                    <Input 
                      value={newBanner.link}
                      onChange={e => setNewBanner({...newBanner, link: e.target.value})}
                      placeholder="/shop"
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus:border-brand-primary outline-none focus-visible:ring-0"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-brand-primary hover:bg-slate-900 text-white rounded-none font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95">
                    <Save className="mr-2 h-4 w-4" /> SAVE_TO_REGISTRY
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="group relative bg-white border border-slate-200 p-3 overflow-hidden transition-all hover:border-brand-primary">
              <div className="aspect-[21/9] relative overflow-hidden border border-slate-100 bg-slate-50">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-brand-primary/40 p-6 flex flex-col justify-end">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-white font-black text-xl uppercase tracking-tighter leading-none">{banner.title}</h3>
                    <p className="text-white/60 text-[9px] font-bold mt-2 uppercase tracking-[0.2em]">{banner.subtitle}</p>
                    <div className="mt-4">
                      <span className="bg-white/10 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 border border-white/20">
                        LINK: {banner.link}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-2 right-2 z-10">
                <button 
                  className={`h-8 flex items-center justify-center transition-all rounded-none shadow-2xl ${
                    deletingId === banner.id 
                      ? "bg-rose-700 text-white px-3" 
                      : "w-8 bg-rose-600 text-white hover:bg-rose-700"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (deletingId === banner.id) {
                      handleDeleteBanner(banner.id);
                      setDeletingId(null);
                    } else {
                      setDeletingId(banner.id);
                      setTimeout(() => setDeletingId(null), 3000);
                    }
                  }}
                  title={deletingId === banner.id ? "Confirm Delete" : "Delete Banner"}
                >
                  {deletingId === banner.id ? (
                    <span className="text-[8px] font-black uppercase">SURE?</span>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
          {loading && (
            <div className="col-span-full py-40 text-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-primary animate-spin mx-auto mb-4" />
              <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[9px]">Syncing_Banners_State...</p>
            </div>
          )}
          {!loading && banners.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100">
              <ImageIcon className="h-10 w-10 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[9px]">Registry_Zero_Detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSlider;
