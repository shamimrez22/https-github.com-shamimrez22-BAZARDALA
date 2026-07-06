import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { SiteSettings } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Save, Megaphone, Zap, Info } from 'lucide-react';
import { toast } from 'sonner';

const AdsSettings = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SiteSettings);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), settings, { merge: true });
      toast.success('Ads & Notification data saved');
    } catch (error) {
      toast.error('Module sync failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-black uppercase text-slate-400">Syncing Ad Protocols...</div>;

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden hover:border-[#8B1E1E] transition-all shadow-sm">
        <div className="bg-[#ead9c4]/30 px-6 py-4 flex flex-row items-center justify-between border-b-2 border-slate-900">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[#8B1E1E]" /> Adsterra Matrix
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-3 py-1 border-2 border-slate-900 shadow-sm">
               <span className="text-[8px] font-black uppercase text-slate-900">Enable Matrix</span>
               <Switch 
                 checked={settings.ads?.adsterra?.enabled || false}
                 onCheckedChange={val => {
                    const newAds = { ...(settings.ads || {}), adsterra: { ...(settings.ads?.adsterra || {}), enabled: val } };
                    setSettings({...settings, ads: newAds as any});
                 }}
               />
            </div>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="h-8 px-5 bg-[#8B1E1E] hover:bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 disabled:opacity-50 border-2 border-slate-900 shadow-sm cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Module'}
            </button>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4 p-6 bg-white border-2 border-slate-900 shadow-sm">
               <h3 className="text-[10px] font-black uppercase text-[#8B1E1E] flex items-center gap-2">
                 <Zap className="h-3 w-3" /> Essential Ad Slots
               </h3>
               {[
                 { id: 'socialBarCode', label: 'Social Bar Code', desc: 'Floating script' },
                 { id: 'popunderCode', label: 'Popunder Code', desc: 'Full page or script' },
                 { id: 'nativeBannerCode', label: 'Native Banner Code', desc: 'Contextual banners' }
               ].map((ad) => (
                 <div key={ad.id} className="space-y-2">
                   <div className="flex items-center justify-between">
                     <Label className="text-[9px] font-black uppercase text-slate-500">{ad.label}</Label>
                     <span className="text-[8px] text-slate-400 font-mono uppercase">{ad.desc}</span>
                   </div>
                   <textarea 
                     value={(settings.ads?.adsterra as any)?.[ad.id] || ''} 
                     onChange={e => {
                       const newAds = { ...(settings.ads || {}), adsterra: { ...(settings.ads?.adsterra || {}), [ad.id]: e.target.value } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                     placeholder="Paste Adsterra content here..."
                     className="w-full min-h-[60px] p-2 bg-white border-2 border-slate-900 rounded-none text-[10px] font-mono leading-tight focus:border-[#8B1E1E] outline-none shadow-sm"
                   />
                 </div>
               ))}
             </div>

             <div className="space-y-4 p-6 bg-white border-2 border-slate-900 shadow-sm">
               <h3 className="text-[10px] font-black uppercase text-slate-700 flex items-center gap-2">
                 <Megaphone className="h-3 w-3 text-[#8B1E1E]" /> Content Banners
               </h3>
               <div className="grid grid-cols-2 gap-3">
                 {['bannerOneCode', 'bannerTwoCode', 'bannerThreeCode', 'bannerFourCode', 'bannerFiveCode', 'bannerSixCode'].map((field) => (
                   <div key={field} className="space-y-1">
                     <Label className="text-[8px] font-black uppercase text-slate-400">{field.replace(/Code$/, '')}</Label>
                     <Input 
                       value={(settings.ads?.adsterra as any)?.[field] || ''} 
                       onChange={e => {
                         const newAds = { ...(settings.ads || {}), adsterra: { ...(settings.ads?.adsterra || {}), [field]: e.target.value } };
                         setSettings({...settings, ads: newAds as any});
                       }}
                       placeholder="Banner URL"
                       className="h-10 bg-white border-2 border-slate-900 rounded-none text-[9px] font-black focus:border-[#8B1E1E] shadow-sm"
                     />
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden hover:border-[#8B1E1E] transition-all shadow-sm">
        <div className="bg-[#ead9c4]/30 px-6 py-4 flex flex-row items-center justify-between border-b-2 border-slate-900">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#8B1E1E]" /> System Notices & Announcements
          </span>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-8 px-5 bg-[#8B1E1E] hover:bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 disabled:opacity-50 border-2 border-slate-900 shadow-sm cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Module'}
          </button>
        </div>
        <div className="p-8 space-y-8">
            {/* Top Bar Notice */}
            <div className="p-6 bg-white border-2 border-slate-900 space-y-6 relative overflow-hidden shadow-sm">
               <div className="absolute top-0 right-0 p-2 opacity-5">
                  <Megaphone className="h-20 w-20 text-[#8B1E1E]" />
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <Switch 
                     checked={settings.ads?.bannerNotice?.active || false}
                     onCheckedChange={val => {
                       const newAds = { ...(settings.ads || {}), bannerNotice: { ...(settings.ads?.bannerNotice || {}), active: val } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                   />
                   <div>
                     <Label className="text-[11px] font-black uppercase text-slate-800">Top Bar Notice</Label>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Mini banner above header</p>
                   </div>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Notice Text</Label>
                   <Input 
                     value={settings.ads?.bannerNotice?.text || ''}
                     onChange={e => {
                       const newAds = { ...(settings.ads || {}), bannerNotice: { ...(settings.ads?.bannerNotice || {}), text: e.target.value } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                     placeholder="Top info bar text..."
                     className="h-12 bg-white border-2 border-slate-900 rounded-none text-[11px] uppercase font-black focus:border-[#8B1E1E] shadow-sm"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Notice Link</Label>
                   <Input 
                     value={settings.ads?.bannerNotice?.link || ''}
                     onChange={e => {
                       const newAds = { ...(settings.ads || {}), bannerNotice: { ...(settings.ads?.bannerNotice || {}), link: e.target.value } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                     placeholder="/shop or https://..."
                     className="h-12 bg-white border-2 border-slate-900 rounded-none text-[11px] focus:border-[#8B1E1E] shadow-sm"
                   />
                 </div>
               </div>
            </div>

            {/* Top Header Graphic Banner */}
            <div className="p-6 bg-white border-2 border-slate-900 space-y-6 relative overflow-hidden shadow-sm">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <Switch 
                     checked={settings.ads?.topHeaderBanner?.active || false}
                     onCheckedChange={val => {
                       const newAds = { ...(settings.ads || {}), topHeaderBanner: { ...(settings.ads?.topHeaderBanner || {}), active: val } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                   />
                   <div>
                     <Label className="text-[11px] font-black uppercase text-slate-800">Graphic Header Banner</Label>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Image banner below header</p>
                   </div>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Banner Image URL</Label>
                   <Input 
                     value={settings.ads?.topHeaderBanner?.imageUrl || ''}
                     onChange={e => {
                       const newAds = { ...(settings.ads || {}), topHeaderBanner: { ...(settings.ads?.topHeaderBanner || {}), imageUrl: e.target.value } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                     placeholder="https://..."
                     className="h-12 bg-white border-2 border-slate-900 rounded-none text-[11px] focus:border-[#8B1E1E] shadow-sm"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Banner Link</Label>
                   <Input 
                     value={settings.ads?.topHeaderBanner?.link || ''}
                     onChange={e => {
                       const newAds = { ...(settings.ads || {}), topHeaderBanner: { ...(settings.ads?.topHeaderBanner || {}), link: e.target.value } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                     placeholder="/shop or external"
                     className="h-12 bg-white border-2 border-slate-900 rounded-none text-[11px] focus:border-[#8B1E1E] shadow-sm"
                   />
                 </div>
               </div>
            </div>

            {/* Top Global Scroll */}
            <div className="p-6 bg-white border-2 border-slate-900 space-y-6 relative overflow-hidden shadow-sm">
               <div className="absolute top-0 right-0 p-2 opacity-5">
                  <Megaphone className="h-20 w-20 text-[#8B1E1E]" />
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <Switch 
                     checked={settings.ads?.topScrollingNotice?.active || false}
                     onCheckedChange={val => {
                       const newAds = { ...(settings.ads || {}), topScrollingNotice: { ...(settings.ads?.topScrollingNotice || {}), active: val } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                   />
                   <div>
                     <Label className="text-[11px] font-black uppercase text-slate-800">Global Top Scroll</Label>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Main announcement below header</p>
                   </div>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Notice Text</Label>
                   <Input 
                     value={settings.ads?.topScrollingNotice?.text || ''}
                     onChange={e => {
                       const newAds = { ...(settings.ads || {}), topScrollingNotice: { ...(settings.ads?.topScrollingNotice || {}), text: e.target.value } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                     placeholder="Global important message..."
                     className="h-12 bg-white border-2 border-slate-900 rounded-none text-[11px] uppercase font-black focus:border-[#8B1E1E] shadow-sm"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Link Protocol</Label>
                   <Input 
                     value={settings.ads?.topScrollingNotice?.link || ''}
                     onChange={e => {
                       const newAds = { ...(settings.ads || {}), topScrollingNotice: { ...(settings.ads?.topScrollingNotice || {}), link: e.target.value } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                     placeholder="/promos or external link"
                     className="h-12 bg-white border-2 border-slate-900 rounded-none text-[11px] focus:border-[#8B1E1E] shadow-sm"
                   />
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase text-slate-500">Text Color</Label>
                     <div className="flex items-center gap-2">
                       <Input 
                         type="color" 
                         value={settings.ads?.topScrollingNotice?.textColor || '#ffffff'}
                         onChange={e => {
                           const newAds = { ...(settings.ads || {}), topScrollingNotice: { ...(settings.ads?.topScrollingNotice || {}), textColor: e.target.value } };
                           setSettings({...settings, ads: newAds as any});
                         }}
                         className="h-10 w-12 p-1 bg-white border-2 border-slate-900 rounded-none cursor-pointer shadow-sm"
                       />
                       <span className="font-mono text-[9px] font-bold">{settings.ads?.topScrollingNotice?.textColor || '#fff'}</span>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase text-slate-500">Notice BG</Label>
                     <div className="flex items-center gap-2">
                       <Input 
                         type="color" 
                         value={settings.ads?.topScrollingNotice?.bgColor || '#9B2B2C'}
                         onChange={e => {
                           const newAds = { ...(settings.ads || {}), topScrollingNotice: { ...(settings.ads?.topScrollingNotice || {}), bgColor: e.target.value } };
                           setSettings({...settings, ads: newAds as any});
                         }}
                         className="h-10 w-12 p-1 bg-white border-2 border-slate-900 rounded-none cursor-pointer shadow-sm"
                       />
                       <span className="font-mono text-[9px] font-bold">{settings.ads?.topScrollingNotice?.bgColor || '#9B2B2C'}</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Home/Bottom Scroll */}
            <div className="p-6 bg-white border-2 border-slate-900 space-y-6 relative overflow-hidden shadow-sm">
               <div className="absolute top-0 right-0 p-2 opacity-5">
                  <Zap className="h-20 w-20 text-[#8B1E1E]" />
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <Switch 
                     checked={settings.ads?.floatingNotice?.active || false}
                     onCheckedChange={val => {
                       const newAds = { ...(settings.ads || {}), floatingNotice: { ...(settings.ads?.floatingNotice || {}), active: val } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                   />
                   <div>
                     <Label className="text-[11px] font-black uppercase text-slate-800">Home/Bottom Scroll</Label>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Announcement on Home Page</p>
                   </div>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Notice Text</Label>
                   <Input 
                     value={settings.ads?.floatingNotice?.text || ''}
                     onChange={e => {
                       const newAds = { ...(settings.ads || {}), floatingNotice: { ...(settings.ads?.floatingNotice || {}), text: e.target.value } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                     placeholder="Message for home page..."
                     className="h-12 bg-white border-2 border-slate-900 rounded-none text-[11px] uppercase font-black focus:border-[#8B1E1E] shadow-sm"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Notice Link</Label>
                   <Input 
                     value={settings.ads?.floatingNotice?.link || ''}
                     onChange={e => {
                       const newAds = { ...(settings.ads || {}), floatingNotice: { ...(settings.ads?.floatingNotice || {}), link: e.target.value } };
                       setSettings({...settings, ads: newAds as any});
                     }}
                     placeholder="Click destination..."
                     className="h-12 bg-white border-2 border-slate-900 rounded-none text-[11px] focus:border-[#8B1E1E] shadow-sm"
                   />
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase text-slate-500">Text Color</Label>
                     <div className="flex items-center gap-2">
                       <Input 
                         type="color" 
                         value={settings.ads?.floatingNotice?.textColor || '#000000'}
                         onChange={e => {
                           const newAds = { ...(settings.ads || {}), floatingNotice: { ...(settings.ads?.floatingNotice || {}), textColor: e.target.value } };
                           setSettings({...settings, ads: newAds as any});
                         }}
                         className="h-10 w-12 p-1 bg-white border-2 border-slate-900 rounded-none cursor-pointer shadow-sm"
                       />
                       <span className="font-mono text-[9px] font-bold">{settings.ads?.floatingNotice?.textColor || '#000'}</span>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase text-slate-500">Notice BG</Label>
                     <div className="flex items-center gap-2">
                       <Input 
                         type="color" 
                         value={settings.ads?.floatingNotice?.bgColor || '#f4e4d4'}
                         onChange={e => {
                           const newAds = { ...(settings.ads || {}), floatingNotice: { ...(settings.ads?.floatingNotice || {}), bgColor: e.target.value } };
                           setSettings({...settings, ads: newAds as any});
                         }}
                         className="h-10 w-12 p-1 bg-white border-2 border-slate-900 rounded-none cursor-pointer shadow-sm"
                       />
                       <span className="font-mono text-[9px] font-bold">{settings.ads?.floatingNotice?.bgColor || '#f4e4d4'}</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            <div className="p-6 bg-white border-2 border-slate-900 space-y-4 shadow-sm">
               <div className="flex items-center gap-3">
                 <Switch 
                   checked={settings.ads?.globalNotice?.active || false}
                   onCheckedChange={val => {
                     const newAds = { ...(settings.ads || {}), globalNotice: { ...(settings.ads?.globalNotice || {}), active: val } };
                     setSettings({...settings, ads: newAds as any});
                   }}
                 />
                 <Label className="text-[11px] font-black uppercase text-slate-800">Service Status Alert</Label>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea 
                    value={settings.ads?.globalNotice?.message || ''}
                    onChange={e => {
                      const newAds = { ...(settings.ads || {}), globalNotice: { ...(settings.ads?.globalNotice || {}), message: e.target.value } };
                      setSettings({...settings, ads: newAds as any});
                    }}
                    placeholder="Central status message..."
                    className="w-full min-h-[80px] p-4 bg-white border-2 border-slate-900 text-[11px] font-black uppercase tracking-widest focus:border-[#8B1E1E] outline-none shadow-sm"
                  />
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Alert Link</Label>
                    <Input 
                      value={settings.ads?.globalNotice?.link || ''}
                      onChange={e => {
                        const newAds = { ...(settings.ads || {}), globalNotice: { ...(settings.ads?.globalNotice || {}), link: e.target.value } };
                        setSettings({...settings, ads: newAds as any});
                      }}
                      placeholder="Info link..."
                      className="h-12 bg-white border-2 border-slate-900 rounded-none text-[11px] focus:border-[#8B1E1E] shadow-sm"
                    />
                  </div>
               </div>
            </div>

            {/* Social Bar Ad */}
            <div className="p-6 bg-white border-2 border-slate-900 space-y-4 shadow-sm">
               <div className="flex items-center gap-3">
                 <Switch 
                   checked={settings.ads?.socialBarAd?.active || false}
                   onCheckedChange={val => {
                     const newAds = { ...(settings.ads || {}), socialBarAd: { ...(settings.ads?.socialBarAd || {}), active: val } };
                     setSettings({...settings, ads: newAds as any});
                   }}
                 />
                 <Label className="text-[11px] font-black uppercase text-slate-800">Social Bar CTA</Label>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    value={settings.ads?.socialBarAd?.message || ''}
                    onChange={e => {
                      const newAds = { ...(settings.ads || {}), socialBarAd: { ...(settings.ads?.socialBarAd || {}), message: e.target.value } };
                      setSettings({...settings, ads: newAds as any});
                    }}
                    placeholder="Social CTA message..."
                    className="h-12 bg-white border-2 border-slate-900 rounded-none text-[11px] font-black uppercase focus:border-[#8B1E1E] shadow-sm"
                  />
                  <Input 
                    value={settings.ads?.socialBarAd?.link || ''}
                    onChange={e => {
                      const newAds = { ...(settings.ads || {}), socialBarAd: { ...(settings.ads?.socialBarAd || {}), link: e.target.value } };
                      setSettings({...settings, ads: newAds as any});
                    }}
                    placeholder="CTA Link (External or /shop)"
                    className="h-12 bg-white border-2 border-slate-900 rounded-none text-[11px] focus:border-[#8B1E1E] shadow-sm"
                  />
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdsSettings;
