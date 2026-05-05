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
    const originalBanners = [...banners];
    
    toast('Delete this banner?', {
      action: {
        label: 'Confirm Delete',
        onClick: async () => {
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
        }
      }
    });
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
    <div className="space-y-6">
      <div className="bg-[#ead9c4] border border-[#777] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
            Home <span className="text-slate-900">Slider</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Homepage Hero Slider // Manage homepage slider images
          </p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className={`rounded-none h-10 px-6 font-black text-[10px] uppercase tracking-widest border border-white/20 shadow-lg transition-all ${
            isAdding ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-[#9B2B2C] hover:bg-[#7a1f1f] text-white'
          }`}
        >
          {isAdding ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add New Banner</>}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-[#ead9c4] border border-[#777] p-8 animate-in fade-in slide-in-from-top-6 duration-300">
          <h2 className="text-sm font-black text-[#9B2B2C] uppercase mb-8 border-b border-[#777]/30 pb-4 flex items-center gap-3">
            <ImageIcon className="h-4 w-4" /> Banner Settings
          </h2>
          <form onSubmit={handleAddBanner} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Upload Image</Label>
                <div className="relative group">
                  <div className={`aspect-[21/9] border-2 border-dashed border-[#777]/30 bg-white flex flex-col items-center justify-center overflow-hidden transition-all ${newBanner.image ? 'border-[#9B2B2C]' : 'hover:border-[#9B2B2C]'}`}>
                    {newBanner.image ? (
                      <img src={newBanner.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Plus className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-[9px] text-slate-500 font-black uppercase">1920x800 Recommended</p>
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
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Main Title</Label>
                  <Input 
                    value={newBanner.title}
                    onChange={e => setNewBanner({...newBanner, title: e.target.value})}
                    placeholder="e.g. MEGA SALE"
                    className="h-10 bg-white border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-0 focus:border-[#9B2B2C] uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Short Description</Label>
                  <Input 
                    value={newBanner.subtitle}
                    onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})}
                    placeholder="SHORT DESCRIPTION"
                    className="h-10 bg-white border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-0 focus:border-[#9B2B2C] uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Button Link</Label>
                  <Input 
                    value={newBanner.link}
                    onChange={e => setNewBanner({...newBanner, link: e.target.value})}
                    placeholder="/shop"
                    className="h-10 bg-white border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-0 focus:border-[#9B2B2C]"
                  />
                </div>
                <Button type="submit" className="w-full h-12 bg-[#9B2B2C] hover:bg-[#7a1f1f] text-white rounded-none font-black text-[11px] uppercase tracking-widest shadow-xl">
                  <Save className="mr-2 h-4 w-4" /> Save Banner
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="group relative bg-[#ead9c4] border border-[#777] p-2 overflow-hidden shadow-md">
            <div className="aspect-[21/9] relative overflow-hidden border border-[#777]/30">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                <h3 className="text-white font-black text-lg uppercase tracking-[0.1em]">{banner.title}</h3>
                <p className="text-white/80 text-[10px] font-bold mt-1 uppercase">{banner.subtitle}</p>
                <div className="mt-3">
                  <span className="bg-white/20 text-white text-[8px] font-black uppercase tracking-wider px-2 py-1 border border-white/20">
                    Target: {banner.link}
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 w-8 rounded-none shadow-xl bg-rose-600 hover:bg-rose-700 border-none p-0"
                onClick={() => handleDeleteBanner(banner.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {loading && (
          <div className="col-span-full py-20 text-center">
            <div className="w-8 h-8 border-4 border-[#9B2B2C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading banners...</p>
          </div>
        )}
        {!loading && banners.length === 0 && (
          <div className="col-span-full py-20 text-center bg-[#ead9c4]/50 border-2 border-dashed border-[#777]/30">
            <ImageIcon className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No slider banners found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSlider;
