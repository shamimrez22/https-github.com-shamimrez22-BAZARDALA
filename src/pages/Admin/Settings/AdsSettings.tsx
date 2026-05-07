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
    <div className="space-y-6">
      <Card className="rounded-none border-[#777] bg-white shadow-lg overflow-hidden border-t-4 border-t-brand-primary">
        <CardHeader className="bg-slate-900 text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Megaphone className="h-4 w-4" /> Adsterra Matrix
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 border border-white/20">
               <span className="text-[8px] font-black uppercase">Enable Matrix</span>
               <Switch 
                 checked={settings.ads?.adsterra?.enabled || false}
                 onCheckedChange={val => {
                    const newAds = { ...(settings.ads || {}), adsterra: { ...(settings.ads?.adsterra || {}), enabled: val } };
                    setSettings({...settings, ads: newAds as any});
                 }}
               />
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm" className="bg-brand-primary hover:bg-slate-800 h-8 font-black uppercase text-[9px]">
              {saving ? 'Saving...' : <><Save className="mr-2 h-3 w-3" /> Save Module</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4 p-4 bg-slate-50 border border-[#777]/30">
               <h3 className="text-[10px] font-black uppercase text-brand-primary flex items-center gap-2">
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
                     className="w-full min-h-[60px] p-2 border border-[#777] rounded-none text-[10px] font-mono leading-tight bg-white focus:border-brand-primary outline-none"
                   />
                 </div>
               ))}
             </div>

             <div className="space-y-4 p-4 bg-slate-50 border border-[#777]/30">
               <h3 className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-2">
                 <Megaphone className="h-3 w-3" /> Content Banners
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
                       className="h-8 border-[#777] rounded-none text-[9px]"
                     />
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none border-[#777] bg-white shadow-lg">
        <CardHeader className="bg-slate-900 text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Zap className="h-4 w-4" /> System Notices & Announcements
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-brand-primary hover:bg-slate-800 h-8 font-black uppercase text-[9px]">
            {saving ? 'Saving...' : <><Save className="mr-2 h-3 w-3" /> Save Module</>}
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
           {/* Top Global Scroll */}
           <div className="p-6 bg-slate-50 border border-slate-200 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                 <Megaphone className="h-20 w-20 text-brand-primary" />
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
                    className="h-12 border-[#777] rounded-none text-[11px] uppercase font-black"
                  />
                </div>
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
                        className="h-10 w-12 p-1 border-[#777] rounded-none cursor-pointer"
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
                        className="h-10 w-12 p-1 border-[#777] rounded-none cursor-pointer"
                      />
                      <span className="font-mono text-[9px] font-bold">{settings.ads?.topScrollingNotice?.bgColor || '#9B2B2C'}</span>
                    </div>
                  </div>
                </div>
              </div>
           </div>

           {/* Home/Bottom Scroll */}
           <div className="p-6 bg-slate-50 border border-slate-200 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                 <Zap className="h-20 w-20 text-brand-primary" />
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
                    className="h-12 border-[#777] rounded-none text-[11px] uppercase font-black"
                  />
                </div>
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
                        className="h-10 w-12 p-1 border-[#777] rounded-none cursor-pointer"
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
                        className="h-10 w-12 p-1 border-[#777] rounded-none cursor-pointer"
                      />
                      <span className="font-mono text-[9px] font-bold">{settings.ads?.floatingNotice?.bgColor || '#f4e4d4'}</span>
                    </div>
                  </div>
                </div>
              </div>
           </div>

           <div className="p-6 bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <Switch 
                  checked={settings.ads?.globalNotice?.active || false}
                  onCheckedChange={val => {
                    const newAds = { ...(settings.ads || {}), globalNotice: { ...(settings.ads?.globalNotice || {}), active: val } };
                    setSettings({...settings, ads: newAds as any});
                  }}
                />
                <Label className="text-[11px] font-black uppercase">Service Status Alert</Label>
              </div>
              <textarea 
                value={settings.ads?.globalNotice?.message || ''}
                onChange={e => {
                  const newAds = { ...(settings.ads || {}), globalNotice: { ...(settings.ads?.globalNotice || {}), message: e.target.value } };
                  setSettings({...settings, ads: newAds as any});
                }}
                placeholder="Central status message..."
                className="w-full min-h-[80px] p-4 border border-[#777] text-[11px] font-black uppercase tracking-widest bg-white"
              />
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsSettings;
