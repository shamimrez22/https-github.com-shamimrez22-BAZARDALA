import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { SiteSettings } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Save, Globe, Info, Share2, Plus, Trash2, Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const GeneralSettings = () => {
  const [settings, setSettings] = useState<any>({}); // Changed to any to allow manual indexing for now
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(true);
  const [showGmailPass, setShowGmailPass] = useState(true);

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
    <div className="space-y-8 pb-10">
      <div className="bg-white border border-slate-200 overflow-hidden hover:border-brand-primary transition-all">
        <div className="bg-brand-primary px-6 py-4 flex flex-row items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-brand-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">BRANDING_&_CORE_ID</span>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-8 px-5 bg-brand-primary text-slate-900 font-black uppercase text-[9px] tracking-widest hover:bg-white transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? 'SYNCING...' : 'SAVE_DELTA'}
          </button>
        </div>
        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Site Name</Label>
            <Input 
              value={settings.siteName || ''} 
              onChange={e => setSettings({...settings, siteName: e.target.value})}
              className="h-12 bg-slate-50 border-slate-200 rounded-none font-black text-sm text-slate-900 focus:border-brand-primary outline-none focus-visible:ring-0 uppercase tracking-tighter"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Site Description (English)</Label>
              <textarea 
                value={settings.siteDescription || ''} 
                onChange={e => setSettings({...settings, siteDescription: e.target.value})}
                className="w-full min-h-[140px] p-4 bg-slate-50 border border-slate-200 font-bold text-xs uppercase tracking-tight text-slate-900 focus:border-brand-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Site Description (Bangla)</Label>
              <textarea 
                value={settings.siteDescriptionBangla || ''} 
                onChange={e => setSettings({...settings, siteDescriptionBangla: e.target.value})}
                className="w-full min-h-[140px] p-4 bg-slate-50 border border-slate-200 font-bold text-xs text-slate-900 focus:border-brand-primary outline-none transition-all"
                placeholder="এসএস স্মার্ট হাট — বাংলাদেশের প্রিমিয়াম ফ্যাশন..."
              />
            </div>
          </div>
        </div>
      </div>

      <Card className="rounded-none border-[#777] bg-white shadow-lg">
        <CardHeader className="bg-brand-primary text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Mail className="h-4 w-4" /> Contact Information
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-white text-brand-primary hover:bg-slate-100 h-8 font-black uppercase text-[9px]">
            {saving ? 'Saving...' : <><Save className="mr-2 h-3 w-3" /> Save Changes</>}
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-brand-primary">WhatsApp Number (For Floating Button & Footer)</Label>
              <Input 
                value={settings.whatsappNumber || ''} 
                onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                className="h-12 border-brand-primary border-2 rounded-none font-black text-sm bg-brand-primary/5"
                placeholder="+880 1XXXXX"
              />
              <p className="text-[9px] text-slate-400 font-bold uppercase">প্লাস (+) ছাড়াই নম্বর দিন (যেমন: 8801700000000)</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-600">Contact Email</Label>
              <Input 
                value={settings.contactEmail || ''} 
                onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                className="h-12 border-[#777] rounded-none font-black text-sm"
                placeholder="info@example.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-600">Contact Phone</Label>
              <Input 
                value={settings.contactPhone || ''} 
                onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                className="h-12 border-[#777] rounded-none font-black text-sm"
                placeholder="+880 1XXX XXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-600">Contact Address</Label>
              <Input 
                value={settings.contactAddress || ''} 
                onChange={e => setSettings({...settings, contactAddress: e.target.value})}
                className="h-12 border-[#777] rounded-none font-black text-sm"
                placeholder="Dhaka, Bangladesh"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none border-[#777] bg-white shadow-lg">
        <CardHeader className="bg-brand-primary text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Social Links
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-white text-brand-primary hover:bg-slate-100 h-8 font-black uppercase text-[9px]">
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
                onClick={() => {
                  if (window.confirm('Delete this social link?')) {
                    setSettings({...settings, socialLinks: settings.socialLinks?.filter((_, idx) => idx !== i)});
                  }
                }}
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

      <Card className="rounded-none border-[#777] bg-white shadow-lg">
        <CardHeader className="bg-brand-primary text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Plus className="h-4 w-4" /> Footer Quick Links
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-white text-brand-primary hover:bg-slate-100 h-8 font-black uppercase text-[9px]">
            {saving ? 'Saving...' : <><Save className="mr-2 h-3 w-3" /> Save Changes</>}
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
           {(settings.footerSupportLinks || []).map((link, i) => (
             <div key={i} className="flex gap-3">
               <div className="flex-1">
                 <Input 
                   value={link.label} 
                   onChange={e => {
                     const newList = [...(settings.footerSupportLinks || [])];
                     newList[i].label = e.target.value;
                     setSettings({...settings, footerSupportLinks: newList});
                   }}
                   placeholder="Label (e.g. SHOP)"
                   className="h-10 border-[#777] rounded-none text-xs font-bold uppercase"
                 />
               </div>
               <div className="flex-[2]">
                 <Input 
                   value={link.url} 
                   onChange={e => {
                     const newList = [...(settings.footerSupportLinks || [])];
                     newList[i].url = e.target.value;
                     setSettings({...settings, footerSupportLinks: newList});
                   }}
                   placeholder="URL (e.g. /shop)"
                   className="h-10 border-[#777] rounded-none text-xs"
                 />
               </div>
               <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => {
                  if (window.confirm('Delete this footer link?')) {
                    setSettings({...settings, footerSupportLinks: settings.footerSupportLinks?.filter((_, idx) => idx !== i)});
                  }
                }}
                className="rounded-none h-10 w-10 shrink-0"
               >
                 <Trash2 className="h-4 w-4" />
               </Button>
             </div>
           ))}
           <Button 
            variant="outline" 
            onClick={() => setSettings({...settings, footerSupportLinks: [...(settings.footerSupportLinks || []), { label: 'NEW LINK', url: '#' }]})}
            className="w-full border-dashed border-slate-900 h-10 font-black text-[10px] uppercase"
           >
             <Plus className="mr-2 h-3 w-3" /> Add Link
           </Button>
        </CardContent>
      </Card>
      <Card className="rounded-none border-[#777] bg-white shadow-lg overflow-hidden">
        <CardHeader className="bg-[#333] text-white py-4 flex flex-row items-center justify-between border-b border-[#777]">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Lock className="h-4 w-4" /> Admin Access Control
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-brand-primary text-white hover:bg-slate-900 h-8 font-black uppercase text-[9px]">
            {saving ? 'Syncing...' : <><Save className="mr-2 h-3 w-3" /> Update Credentials</>}
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-600">Admin Username</Label>
              <Input 
                value={settings.adminCredentials?.username || ''} 
                onChange={e => setSettings({
                  ...settings, 
                  adminCredentials: { ...(settings.adminCredentials || {}), username: e.target.value }
                })}
                className="h-12 border-[#777] rounded-none font-black text-sm"
                placeholder="Admin username"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-600">Admin Password</Label>
              <div className="relative">
                <Input 
                  type={showAdminPass ? "text" : "password"}
                  value={settings.adminCredentials?.pass || ''} 
                  onChange={e => setSettings({
                    ...settings, 
                    adminCredentials: { ...(settings.adminCredentials || {}), pass: e.target.value }
                  })}
                  className="h-12 border-[#777] rounded-none font-black text-sm pr-12"
                  placeholder="Admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showAdminPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-600">Recovery Gmail (OTP এর জন্য)</Label>
              <Input 
                value={settings.adminCredentials?.adminGmail || ''} 
                onChange={e => setSettings({
                  ...settings, 
                  adminCredentials: { ...(settings.adminCredentials || {}), adminGmail: e.target.value }
                })}
                className="h-12 border-[#777] rounded-none font-black text-sm"
                placeholder="shamimrez22@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-600">Gmail App Password</Label>
              <div className="relative">
                <Input 
                  type={showGmailPass ? "text" : "password"}
                  value={settings.adminCredentials?.adminGmailPassword || ''} 
                  onChange={e => setSettings({
                    ...settings, 
                    adminCredentials: { ...(settings.adminCredentials || {}), adminGmailPassword: e.target.value }
                  })}
                  className="h-12 border-[#777] rounded-none font-black text-sm pr-12"
                  placeholder="16 Character App Password"
                />
                <button
                  type="button"
                  onClick={() => setShowGmailPass(!showGmailPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showGmailPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-600">Master Security PIN (রিকভারির জন্য)</Label>
              <Input 
                type="text"
                maxLength={6}
                value={settings.adminCredentials?.masterPin || ''} 
                onChange={e => setSettings({
                  ...settings, 
                  adminCredentials: { ...(settings.adminCredentials || {}), masterPin: e.target.value }
                })}
                className="h-12 border-[#777] rounded-none font-black text-sm"
                placeholder="Ex: 889900"
              />
            </div>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-100 flex gap-3">
             <ShieldCheck className="h-5 w-5 text-orange-400 shrink-0" />
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-orange-700 uppercase leading-relaxed font-mono">
                 নিরাপত্তা সতর্কতা: রিকভারি করতে আপনার সেট করা Gmail এবং এই Security PIN টি প্রয়োজন হবে।
               </p>
               <p className="text-[9px] font-bold text-orange-600 uppercase">
                 জিমেইল অ্যাপ পাসওয়ার্ড কীভাবে পাবেন তা জানতে গুগল সার্চ করুন "How to get Gmail App Password"।
               </p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
