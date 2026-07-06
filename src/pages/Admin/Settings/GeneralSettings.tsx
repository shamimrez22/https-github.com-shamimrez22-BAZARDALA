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
      <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden hover:border-[#8B1E1E] transition-all shadow-sm">
        <div className="bg-[#ead9c4]/30 px-6 py-4 flex flex-row items-center justify-between border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-[#8B1E1E]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">BRANDING_&_CORE_ID</span>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-8 px-5 bg-[#8B1E1E] hover:bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 disabled:opacity-50 border-2 border-slate-900 shadow-sm cursor-pointer"
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
              className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Site Description (English)</Label>
              <textarea 
                value={settings.siteDescription || ''} 
                onChange={e => setSettings({...settings, siteDescription: e.target.value})}
                className="w-full min-h-[140px] p-4 bg-white border-2 border-slate-900 font-bold text-xs uppercase tracking-tight text-slate-900 focus:border-[#8B1E1E] outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Site Description (Bangla)</Label>
              <textarea 
                value={settings.siteDescriptionBangla || ''} 
                onChange={e => setSettings({...settings, siteDescriptionBangla: e.target.value})}
                className="w-full min-h-[140px] p-4 bg-white border-2 border-slate-900 font-bold text-xs text-slate-900 focus:border-[#8B1E1E] outline-none transition-all shadow-sm"
                placeholder="এসএস স্মার্ট হাট — বাংলাদেশের প্রিমিয়াম ফ্যাশন..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden hover:border-[#8B1E1E] transition-all shadow-sm">
        <div className="bg-[#ead9c4]/30 px-6 py-4 flex flex-row items-center justify-between border-b-2 border-slate-900">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#8B1E1E]" /> Contact Information
          </span>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-8 px-5 bg-[#8B1E1E] hover:bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 disabled:opacity-50 border-2 border-slate-900 shadow-sm cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-[#8B1E1E]">WhatsApp Number (For Floating Button & Footer)</Label>
              <Input 
                value={settings.whatsappNumber || ''} 
                onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
                placeholder="+880 1XXXXX"
              />
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">প্লাস (+) ছাড়াই নম্বর দিন (যেমন: 8801700000000)</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Contact Email</Label>
              <Input 
                value={settings.contactEmail || ''} 
                onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
                placeholder="info@example.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Contact Phone</Label>
              <Input 
                value={settings.contactPhone || ''} 
                onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
                placeholder="+880 1XXX XXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Contact Address</Label>
              <Input 
                value={settings.contactAddress || ''} 
                onChange={e => setSettings({...settings, contactAddress: e.target.value})}
                className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
                placeholder="Dhaka, Bangladesh"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden hover:border-[#8B1E1E] transition-all shadow-sm">
        <div className="bg-[#ead9c4]/30 px-6 py-4 flex flex-row items-center justify-between border-b-2 border-slate-900">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-[#8B1E1E]" /> Social Links
          </span>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-8 px-5 bg-[#8B1E1E] hover:bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 disabled:opacity-50 border-2 border-slate-900 shadow-sm cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <div className="p-8 space-y-4">
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
                   className="h-10 bg-white border-2 border-slate-900 rounded-none font-black text-xs text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
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
                   className="h-10 bg-white border-2 border-slate-900 rounded-none font-black text-xs text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
                 />
               </div>
               <button 
                 onClick={() => {
                   if (window.confirm('Delete this social link?')) {
                     setSettings({...settings, socialLinks: settings.socialLinks?.filter((_, idx) => idx !== i)});
                   }
                 }}
                 className="rounded-none h-10 w-10 shrink-0 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-2 border-slate-900 shadow-sm transition-all flex items-center justify-center cursor-pointer"
               >
                 <Trash2 className="h-4 w-4" />
               </button>
             </div>
           ))}
           <button 
             onClick={() => setSettings({...settings, socialLinks: [...(settings.socialLinks || []), { platform: 'NEW', url: '#' }]})}
             className="w-full bg-white hover:bg-[#ebd9c4]/20 text-slate-900 border-2 border-dashed border-slate-900 h-10 font-black text-[10px] uppercase transition-all active:scale-95 cursor-pointer shadow-sm"
           >
             <Plus className="inline mr-2 h-3 w-3" /> Add New Network
           </button>
        </div>
      </div>

      <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden hover:border-[#8B1E1E] transition-all shadow-sm">
        <div className="bg-[#ead9c4]/30 px-6 py-4 flex flex-row items-center justify-between border-b-2 border-slate-900">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#8B1E1E]" /> Footer Quick Links
          </span>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-8 px-5 bg-[#8B1E1E] hover:bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 disabled:opacity-50 border-2 border-slate-900 shadow-sm cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <div className="p-8 space-y-4">
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
                   className="h-10 bg-white border-2 border-slate-900 rounded-none font-black text-xs text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
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
                   className="h-10 bg-white border-2 border-slate-900 rounded-none font-black text-xs text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
                 />
               </div>
               <button 
                 onClick={() => {
                   if (window.confirm('Delete this footer link?')) {
                     setSettings({...settings, footerSupportLinks: settings.footerSupportLinks?.filter((_, idx) => idx !== i)});
                   }
                 }}
                 className="rounded-none h-10 w-10 shrink-0 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-2 border-slate-900 shadow-sm transition-all flex items-center justify-center cursor-pointer"
               >
                 <Trash2 className="h-4 w-4" />
               </button>
             </div>
           ))}
           <button 
             onClick={() => setSettings({...settings, footerSupportLinks: [...(settings.footerSupportLinks || []), { label: 'NEW LINK', url: '#' }]})}
             className="w-full bg-white hover:bg-[#ebd9c4]/20 text-slate-900 border-2 border-dashed border-slate-900 h-10 font-black text-[10px] uppercase transition-all active:scale-95 cursor-pointer shadow-sm"
           >
             <Plus className="inline mr-2 h-3 w-3" /> Add Link
           </button>
        </div>
      </div>

      <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden hover:border-[#8B1E1E] transition-all shadow-sm">
        <div className="bg-[#ead9c4]/30 px-6 py-4 flex flex-row items-center justify-between border-b-2 border-slate-900 border-b-[#777]">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#8B1E1E]" /> Admin Access Control
          </span>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-8 px-5 bg-[#8B1E1E] hover:bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 disabled:opacity-50 border-2 border-slate-900 shadow-sm cursor-pointer"
          >
            {saving ? 'Syncing...' : 'Update Credentials'}
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Admin Username</Label>
              <Input 
                value={settings.adminCredentials?.username || ''} 
                onChange={e => setSettings({
                  ...settings, 
                  adminCredentials: { ...(settings.adminCredentials || {}), username: e.target.value }
                })}
                className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
                placeholder="Admin username"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Admin Password</Label>
              <div className="relative">
                <Input 
                  type={showAdminPass ? "text" : "password"}
                  value={settings.adminCredentials?.pass || ''} 
                  onChange={e => setSettings({
                    ...settings, 
                    adminCredentials: { ...(settings.adminCredentials || {}), pass: e.target.value }
                  })}
                  className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm pr-12"
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
              <Label className="text-[10px] font-black uppercase text-slate-500">Recovery Gmail (OTP এর জন্য)</Label>
              <Input 
                value={settings.adminCredentials?.adminGmail || ''} 
                onChange={e => setSettings({
                  ...settings, 
                  adminCredentials: { ...(settings.adminCredentials || {}), adminGmail: e.target.value }
                })}
                className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
                placeholder="shamimrez22@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Gmail App Password</Label>
              <div className="relative">
                <Input 
                  type={showGmailPass ? "text" : "password"}
                  value={settings.adminCredentials?.adminGmailPassword || ''} 
                  onChange={e => setSettings({
                    ...settings, 
                    adminCredentials: { ...(settings.adminCredentials || {}), adminGmailPassword: e.target.value }
                  })}
                  className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm pr-12"
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
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Master Security PIN (রিকভারির জন্য)</Label>
              <Input 
                type="text"
                maxLength={6}
                value={settings.adminCredentials?.masterPin || ''} 
                onChange={e => setSettings({
                  ...settings, 
                  adminCredentials: { ...(settings.adminCredentials || {}), masterPin: e.target.value }
                })}
                className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase tracking-tighter shadow-sm"
                placeholder="Ex: 889900"
              />
            </div>
          </div>
          <div className="p-4 bg-[#ead9c4]/40 border-2 border-slate-900 flex gap-3 shadow-inner">
             <ShieldCheck className="h-5 w-5 text-[#8B1E1E] shrink-0" />
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-800 uppercase leading-relaxed font-mono">
                  নিরাপত্তা সতর্কতা: রিকভারি করতে আপনার সেট করা Gmail এবং এই Security PIN টি প্রয়োজন হবে।
                </p>
                <p className="text-[9px] font-bold text-slate-600 uppercase">
                  জিমেইল অ্যাপ পাসওয়ার্ড কীভাবে পাবেন তা জানতে গুগল সার্চ করুন "How to get Gmail App Password"।
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
