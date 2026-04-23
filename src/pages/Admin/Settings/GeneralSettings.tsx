import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { SiteSettings } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Save, Globe, Info, Share2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const GeneralSettings = () => {
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
      toast.success('General settings updated');
    } catch (error) {
      toast.error('Global save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-black uppercase text-slate-400">Loading Module...</div>;

  return (
    <div className="space-y-6">
      <Card className="rounded-none border-[#777] bg-white shadow-lg">
        <CardHeader className="bg-slate-900 text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Globe className="h-4 w-4" /> Branding & Info
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-[#9B2B2C] hover:bg-slate-800 h-8 font-black uppercase text-[9px]">
            {saving ? 'Saving...' : <><Save className="mr-2 h-3 w-3" /> Save Changes</>}
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-600">Site Branding Name</Label>
            <Input 
              value={settings.siteName || ''} 
              onChange={e => setSettings({...settings, siteName: e.target.value})}
              className="h-12 border-[#777] rounded-none font-black text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-600">Site Bio / Description</Label>
            <textarea 
              value={settings.siteDescription || ''} 
              onChange={e => setSettings({...settings, siteDescription: e.target.value})}
              className="w-full min-h-[120px] p-4 border border-[#777] font-bold text-xs uppercase"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none border-[#777] bg-white shadow-lg">
        <CardHeader className="bg-slate-900 text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Social Link Matrix
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-[#9B2B2C] hover:bg-slate-800 h-8 font-black uppercase text-[9px]">
            {saving ? 'Saving...' : <><Save className="mr-2 h-3 w-3" /> Save Changes</>}
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
           {(settings.socialLinks || []).map((link, i) => (
             <div key={i} className="flex gap-3">
               <div className="flex-1">
                 <Input 
                   value={link.platform} 
                   onChange={e => {
                     const newList = [...(settings.socialLinks || [])];
                     newList[i].platform = e.target.value;
                     setSettings({...settings, socialLinks: newList});
                   }}
                   placeholder="Platform (FB, IG)"
                   className="h-10 border-[#777] rounded-none text-xs font-bold uppercase"
                 />
               </div>
               <div className="flex-[2]">
                 <Input 
                   value={link.url} 
                   onChange={e => {
                     const newList = [...(settings.socialLinks || [])];
                     newList[i].url = e.target.value;
                     setSettings({...settings, socialLinks: newList});
                   }}
                   placeholder="URL"
                   className="h-10 border-[#777] rounded-none text-xs"
                 />
               </div>
               <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => setSettings({...settings, socialLinks: settings.socialLinks?.filter((_, idx) => idx !== i)})}
                className="rounded-none h-10 w-10 shrink-0"
               >
                 <Trash2 className="h-4 w-4" />
               </Button>
             </div>
           ))}
           <Button 
            variant="outline" 
            onClick={() => setSettings({...settings, socialLinks: [...(settings.socialLinks || []), { platform: 'NEW', url: '#' }]})}
            className="w-full border-dashed border-slate-900 h-10 font-black text-[10px] uppercase"
           >
             <Plus className="mr-2 h-3 w-3" /> Add New Network
           </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
