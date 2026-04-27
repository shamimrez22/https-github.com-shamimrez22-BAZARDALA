import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { SiteSettings } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Save, LayoutGrid, Palette, Zap } from 'lucide-react';
import { toast } from 'sonner';

const DesignSettings = () => {
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
      toast.success('Visual interface updated');
    } catch (error) {
      toast.error('Design sync failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-black uppercase text-slate-400">Loading Graphics Module...</div>;

  return (
    <div className="space-y-6">
      <Card className="rounded-none border-[#777] bg-white shadow-lg">
        <CardHeader className="bg-slate-900 text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Palette className="h-4 w-4" /> Color Protocols
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-[#9B2B2C] hover:bg-slate-800 h-8 font-black uppercase text-[9px]">
            {saving ? 'Saving...' : <><Save className="mr-2 h-3 w-3" /> Save Changes</>}
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
           <div className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-dashed border-[#777]">
              <Checkbox 
                id="theme-active"
                checked={settings.theme?.enabled || false}
                onCheckedChange={val => setSettings({...settings, theme: { ...(settings.theme || {}), enabled: !!val } as any})}
              />
              <Label htmlFor="theme-active" className="text-[10px] font-black uppercase tracking-tighter">Override System Default Aesthetics</Label>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {['primaryColor', 'secondaryColor', 'backgroundColor', 'cardColor', 'buttonColor'].map(color => (
                <div key={color} className="space-y-3 p-4 border border-[#eee]">
                   <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{color.replace(/([A-Z])/g, ' $1')}</Label>
                   <div className="flex items-center gap-4">
                      <Input 
                        type="color" 
                        value={(settings.theme as any)?.[color] || '#000000'} 
                        onChange={e => setSettings({...settings, theme: { ...(settings.theme || {}), [color]: e.target.value } as any})}
                        className="w-12 h-12 p-1 border-[#777] rounded-none cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold uppercase">{(settings.theme as any)?.[color] || '#000'}</span>
                   </div>
                </div>
              ))}
           </div>
        </CardContent>
      </Card>

      <Card className="rounded-none border-[#777] bg-white shadow-lg">
        <CardHeader className="bg-slate-900 text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" /> Component Display
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-[#9B2B2C] hover:bg-slate-800 h-8 font-black uppercase text-[9px]">
            {saving ? 'Saving...' : <><Save className="mr-2 h-3 w-3" /> Save Changes</>}
          </Button>
        </CardHeader>
        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="flex items-center gap-3 p-4 border border-[#eee]">
              <Checkbox 
                 id="show-categories"
                 checked={settings.sidebar?.showCategories || false}
                 onCheckedChange={val => setSettings({...settings, sidebar: { ...(settings.sidebar || {}), showCategories: !!val } as any})}
              />
              <Label htmlFor="show-categories" className="text-[10px] font-black uppercase">Display Mega-Menu Categories</Label>
           </div>
           <div className="flex items-center gap-3 p-4 border border-[#eee]">
              <Checkbox 
                 id="show-offer"
                 checked={settings.sidebar?.showOffer || false}
                 onCheckedChange={val => setSettings({...settings, sidebar: { ...(settings.sidebar || {}), showOffer: !!val } as any})}
              />
              <Label htmlFor="show-offer" className="text-[10px] font-black uppercase text-[#9B2B2C]">Enable Sidebar Flash Offer</Label>
           </div>
        </CardContent>
      </Card>

      <Card className="rounded-none border-[#777] bg-white shadow-lg">
        <CardHeader className="bg-slate-900 text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#9B2B2C]" /> Sidebar Flash Offer Protocol
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-[#9B2B2C] hover:bg-slate-800 h-8 font-black uppercase text-[9px]">
            {saving ? 'Saving...' : <><Save className="mr-2 h-3 w-3" /> Save Sidebar Config</>}
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase text-slate-500">Offer Header Title</Label>
              <Input 
                value={settings.sidebar?.offerTitle || ''} 
                onChange={e => setSettings({...settings, sidebar: { ...(settings.sidebar || {}), offerTitle: e.target.value } as any})}
                placeholder="e.g. EXCLUSIVE_OFFER"
                className="h-11 border-[#777] rounded-none text-xs font-bold uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase text-slate-500">Target Link URL</Label>
              <Input 
                value={settings.sidebar?.offerLink || ''} 
                onChange={e => setSettings({...settings, sidebar: { ...(settings.sidebar || {}), offerLink: e.target.value } as any})}
                placeholder="/shop or External URL"
                className="h-11 border-[#777] rounded-none text-xs"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-slate-500">Video Background URL (Direct Link)</Label>
            <Input 
              value={settings.sidebar?.offerVideoUrl || ''} 
              onChange={e => setSettings({...settings, sidebar: { ...(settings.sidebar || {}), offerVideoUrl: e.target.value } as any})}
              placeholder="https://example.com/video.mp4"
              className="h-11 border-[#777] rounded-none text-xs border-2 border-slate-900"
            />
            <p className="text-[8px] text-[#9B2B2C] font-black uppercase tracking-widest leading-relaxed">
              * Priority link // If provided, this video will play in the sidebar hub.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-slate-500">Fallback Poster / Image URL</Label>
            <Input 
              value={settings.sidebar?.offerImageUrl || ''} 
              onChange={e => setSettings({...settings, sidebar: { ...(settings.sidebar || {}), offerImageUrl: e.target.value } as any})}
              placeholder="https://example.com/poster.jpg"
              className="h-11 border-[#777] rounded-none text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignSettings;
