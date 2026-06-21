import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { SiteSettings } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Save, LayoutGrid, Palette, Zap, Upload, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';

const DesignSettings = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [progress, setProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SiteSettings);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleFileUpload = async (file: File, type: 'video' | 'image') => {
    const key = type === 'video' ? 'offerVideoUrl' : 'offerImageUrl';
    setUploading(prev => ({ ...prev, [type]: true }));
    
    // Create a unique filename
    const filename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `offers/${filename}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prev => ({ ...prev, [type]: p }));
      }, 
      (error) => {
        console.error(error);
        toast.error(`${type.toUpperCase()} upload failed`);
        setUploading(prev => ({ ...prev, [type]: false }));
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setSettings(prev => ({
            ...prev,
            sidebar: {
              ...(prev.sidebar || {}),
              [key]: downloadURL
            } as any
          }));
          toast.success(`${type.toUpperCase()} node linked successfully`);
          setUploading(prev => ({ ...prev, [type]: false }));
          setProgress(prev => ({ ...prev, [type]: 0 }));
        });
      }
    );
  };

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
        <CardHeader className="bg-brand-primary text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Palette className="h-4 w-4" /> Color Protocols
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-white text-brand-primary hover:bg-slate-100 h-8 font-black uppercase text-[9px]">
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
        <CardHeader className="bg-brand-primary text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" /> Component Display
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-white text-brand-primary hover:bg-slate-100 h-8 font-black uppercase text-[9px]">
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
              <Label htmlFor="show-offer" className="text-[10px] font-black uppercase text-brand-primary">Enable Sidebar Flash Offer</Label>
           </div>
        </CardContent>
      </Card>

      <Card className="rounded-none border-[#777] bg-white shadow-lg">
        <CardHeader className="bg-brand-primary text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-primary" /> Sidebar Flash Offer Protocol
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-white text-brand-primary hover:bg-slate-100 h-8 font-black uppercase text-[9px]">
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

          {/* Time Set Section */}
          <div className="p-5 border border-slate-200 bg-slate-50/50 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-700">Countdown Timer Control Hub</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-500">Option 1: Target End Date & Time</Label>
                <Input 
                  type="datetime-local"
                  value={settings.sidebar?.offerEndDateTime || ''}
                  onChange={e => setSettings({
                    ...settings,
                    sidebar: {
                      ...(settings.sidebar || {}),
                      offerEndDateTime: e.target.value
                    } as any
                  })}
                  className="h-11 border-[#777] rounded-none text-xs"
                />
                <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tight">
                  Sets absolute target. Live ticks down to zero (e.g. 2026-06-25 18:00). Leave blank to use looping Option 2.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-500">Option 2: Relative Looping Timer (H : M : S)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[7.5px] font-black text-slate-400 uppercase">Hours</Label>
                    <Input 
                      type="number"
                      min="0"
                      max="999"
                      value={settings.sidebar?.offerHours ?? 4}
                      onChange={e => setSettings({
                        ...settings,
                        sidebar: {
                          ...(settings.sidebar || {}),
                          offerHours: parseInt(e.target.value, 10) || 0
                        } as any
                      })}
                      className="h-10 border-[#777] rounded-none text-xs font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-[7.5px] font-black text-slate-400 uppercase">Min</Label>
                    <Input 
                      type="number"
                      min="0"
                      max="59"
                      value={settings.sidebar?.offerMinutes ?? 37}
                      onChange={e => setSettings({
                        ...settings,
                        sidebar: {
                          ...(settings.sidebar || {}),
                          offerMinutes: parseInt(e.target.value, 10) || 0
                        } as any
                      })}
                      className="h-10 border-[#777] rounded-none text-xs font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-[7.5px] font-black text-slate-400 uppercase">Sec</Label>
                    <Input 
                      type="number"
                      min="0"
                      max="59"
                      value={settings.sidebar?.offerSeconds ?? 25}
                      onChange={e => setSettings({
                        ...settings,
                        sidebar: {
                          ...(settings.sidebar || {}),
                          offerSeconds: parseInt(e.target.value, 10) || 0
                        } as any
                      })}
                      className="h-10 border-[#777] rounded-none text-xs font-bold"
                    />
                  </div>
                </div>
                <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tight">
                  Regular continuous looping relative duration when Option 1 target is unset.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Fallback Poster / Image Upload */}
            <div className="space-y-4 border p-4 bg-white border-slate-200">
              <Label className="text-[10px] font-black uppercase text-[#9B2B2C] tracking-wide flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Direct Image Upload
              </Label>
              
              <div className="flex flex-col gap-4">
                {settings.sidebar?.offerImageUrl && (
                  <div className="relative w-full h-[150px] bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                    <img 
                      src={settings.sidebar.offerImageUrl} 
                      alt="Active Promo Poster" 
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-[#00a878] text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                      ACTIVE IMAGE
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full h-16 border-2 border-dashed border-brand-primary rounded-none bg-slate-50 hover:bg-slate-100 transition-all group"
                  >
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                      {uploading.image ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{Math.round(progress.image || 0)}% SYNCING</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-slate-400 group-hover:text-brand-primary transition-colors" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Click to Upload Image</span>
                        </>
                      )}
                    </label>
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-[8px] font-bold uppercase text-slate-450">Active Image URL</Label>
                  <Input 
                    value={settings.sidebar?.offerImageUrl || ''} 
                    onChange={e => setSettings({...settings, sidebar: { ...(settings.sidebar || {}), offerImageUrl: e.target.value } as any})}
                    placeholder="Auto-filled after upload or manual override"
                    className="h-10 border-[#777] rounded-none text-[10px] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Video Background Section */}
            <div className="space-y-4 border p-4 bg-white border-slate-200">
              <Label className="text-[10px] font-black uppercase text-[#9B2B2C] tracking-wide flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5" /> Direct Video Upload
              </Label>
              
              <div className="flex flex-col gap-4">
                {settings.sidebar?.offerVideoUrl && (
                  <div className="relative w-full h-[150px] bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                    <video 
                      src={settings.sidebar.offerVideoUrl} 
                      controls 
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-brand-primary text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                      ACTIVE VIDEO
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Input 
                    type="file"
                    accept="video/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                    className="hidden"
                    id="video-upload"
                  />
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full h-16 border-2 border-dashed border-brand-primary rounded-none bg-slate-50 hover:bg-slate-100 transition-all group"
                  >
                    <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                      {uploading.video ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{Math.round(progress.video || 0)}% UPLOADING</span>
                        </div>
                      ) : (
                        <>
                          <Play className="h-5 w-5 text-slate-400 group-hover:text-brand-primary transition-colors" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Click to Upload Video</span>
                        </>
                      )}
                    </label>
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-[8px] font-bold uppercase text-slate-450">Active Video URL</Label>
                  <Input 
                    value={settings.sidebar?.offerVideoUrl || ''} 
                    onChange={e => setSettings({...settings, sidebar: { ...(settings.sidebar || {}), offerVideoUrl: e.target.value } as any})}
                    placeholder="Auto-filled after upload or manual override"
                    className="h-10 border-[#777] rounded-none text-[10px] font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignSettings;
