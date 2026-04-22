import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SiteSettings } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Plus, Trash2, Save, Globe, Share2, Info, Zap, Megaphone, LayoutGrid, Image as ImageIcon, Lock, User, Shield, Mail, Timer } from 'lucide-react';
import { toast } from 'sonner';

const defaultSettings: SiteSettings = {
  siteName: 'BAZAR DALA',
  footerSupportLinks: [
    { label: 'Help Center', url: '/help' },
    { label: 'How to Buy', url: '/how-to-buy' },
    { label: 'Return Policy', url: '/returns' },
    { label: 'Contact Us', url: '/contact' },
    { label: 'Terms & Conditions', url: '/terms' }
  ],
  footerCompanyLinks: [
    { label: 'About Us', url: '/about' },
    { label: 'Careers', url: '/careers' },
    { label: 'Our Blog', url: '/blog' },
    { label: 'Track Order', url: '/tracking' }
  ],
  socialLinks: [
    { platform: 'FB', url: '#' },
    { platform: 'TW', url: '#' },
    { platform: 'IG', url: '#' }
  ],
  siteDescription: 'BAZAR DALA - Your premium destination for multi-category products and deals.',
  ads: {
    featuresAd: {
      active: false,
      link: '',
      message: 'Exclusive Flash Sale'
    },
    popupAd: {
      active: false,
      link: '',
      message: 'Sign up for 10% off',
      imageUrl: ''
    },
    socialBarAd: {
      active: false,
      link: '',
      message: 'Follow us for daily updates'
    },
    globalNotice: {
      active: false,
      message: 'Maintenance scheduled tomorrow',
      type: 'info'
    },
    adsterra: {
      popunderCode: '',
      nativeBannerCode: '',
      socialBarCode: '',
      bannerOneCode: '',
      bannerTwoCode: '',
      customAdScript: ''
    },
    adminCredentials: {
      username: 'SHAMIM',
      pass: '321'
    },
    adminEmails: ['shamimrez22@gmail.com']
  },
  theme: {
    enabled: false,
    primaryColor: '#9B2B2C',
    secondaryColor: '#ead9c4',
    backgroundColor: '#f4e4d4',
    cardColor: '#ffffff',
    buttonColor: '#9B2B2C'
  },
  countdown: {
    enabled: true,
    targetDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    text: 'FLASH SALE'
  },
  sidebar: {
    showCategories: true,
    showOffer: false,
    offerImageUrl: '',
    offerLink: '',
    offerTitle: 'SPECIAL OFFER'
  }
};

const Settings = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMobileView, setShowMobileView] = useState(false);

  useEffect(() => {
    if (authLoading || !isAdmin) return;

    const unsub = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        setSettings({
          ...defaultSettings,
          ...data,
          footerSupportLinks: data.footerSupportLinks || defaultSettings.footerSupportLinks,
          footerCompanyLinks: data.footerCompanyLinks || defaultSettings.footerCompanyLinks,
          socialLinks: data.socialLinks || defaultSettings.socialLinks,
          ads: {
            featuresAd: { ...defaultSettings.ads!.featuresAd, ...(data.ads?.featuresAd || {}) },
            popupAd: { ...defaultSettings.ads!.popupAd, ...(data.ads?.popupAd || {}) },
            socialBarAd: { ...defaultSettings.ads!.socialBarAd, ...(data.ads?.socialBarAd || {}) },
            globalNotice: { ...defaultSettings.ads!.globalNotice, ...(data.ads?.globalNotice || {}) },
            adsterra: { ...defaultSettings.ads!.adsterra, ...(data.ads?.adsterra || {}) },
            adminCredentials: { ...defaultSettings.ads!.adminCredentials, ...(data.ads?.adminCredentials || {}) },
            adminEmails: data.ads?.adminEmails || defaultSettings.ads!.adminEmails
          },
          theme: { ...defaultSettings.theme!, ...(data.theme || {}) },
          countdown: { ...defaultSettings.countdown!, ...(data.countdown || {}) },
          sidebar: { ...defaultSettings.sidebar!, ...(data.sidebar || {}) }
        });
      } else {
        // Init if not exists
        setDoc(doc(db, 'settings', 'site'), defaultSettings);
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error('Settings sync error:', error);
      setLoading(false);
    });
    return () => unsub();
  }, [authLoading, isAdmin]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const addLink = (type: 'support' | 'company' | 'social') => {
    if (type === 'support') {
      setSettings(prev => ({
        ...prev,
        footerSupportLinks: [...prev.footerSupportLinks, { label: 'New Link', url: '#' }]
      }));
    }
    if (type === 'company') {
      setSettings(prev => ({
        ...prev,
        footerCompanyLinks: [...prev.footerCompanyLinks, { label: 'New Link', url: '#' }]
      }));
    }
    if (type === 'social') {
      setSettings(prev => ({
        ...prev,
        socialLinks: [...prev.socialLinks, { platform: 'NEW', url: '#' }]
      }));
    }
  };

  const removeLink = (type: 'support' | 'company' | 'social', index: number) => {
    if (type === 'support') {
      setSettings(prev => ({
        ...prev,
        footerSupportLinks: prev.footerSupportLinks.filter((_, i) => i !== index)
      }));
    }
    if (type === 'company') {
      setSettings(prev => ({
        ...prev,
        footerCompanyLinks: prev.footerCompanyLinks.filter((_, i) => i !== index)
      }));
    }
    if (type === 'social') {
      setSettings(prev => ({
        ...prev,
        socialLinks: prev.socialLinks.filter((_, i) => i !== index)
      }));
    }
  };

  const updateLink = (type: 'support' | 'company' | 'social', index: number, field: string, value: string) => {
    if (type === 'support') {
      setSettings(prev => {
        const newList = [...prev.footerSupportLinks];
        (newList[index] as any)[field] = value;
        return { ...prev, footerSupportLinks: newList };
      });
    }
    if (type === 'company') {
      setSettings(prev => {
        const newList = [...prev.footerCompanyLinks];
        (newList[index] as any)[field] = value;
        return { ...prev, footerCompanyLinks: newList };
      });
    }
    if (type === 'social') {
      setSettings(prev => {
        const newList = [...prev.socialLinks];
        (newList[index] as any)[field] = value;
        return { ...prev, socialLinks: newList };
      });
    }
  };

  if (loading) return <div className="p-8 text-center font-black uppercase text-[#9B2B2C] animate-pulse">Syncing Site Protocols...</div>;

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-[#ead9c4] border border-[#777] p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md">
        <div>
          <h1 className="text-3xl font-black text-[#9B2B2C] uppercase tracking-tighter">Control <span className="text-slate-900">Center</span></h1>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#9B2B2C] rounded-full animate-pulse" />
            Website Configuration & Global Links
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Button 
            onClick={() => setShowMobileView(!showMobileView)} 
            variant="outline"
            className="border-[#9B2B2C] text-[#9B2B2C] hover:bg-[#9B2B2C] hover:text-white font-black uppercase tracking-widest px-6 h-14 rounded-none transition-all"
          >
            <Zap className="mr-3 h-5 w-5" /> {showMobileView ? 'Close Mobile View' : 'Open Mobile View'}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-[#9B2B2C] hover:bg-slate-900 text-white font-black uppercase tracking-widest px-10 h-14 rounded-none shadow-[4px_4px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            {isSaving ? 'Saving...' : <><Save className="mr-3 h-5 w-5" /> Save Changes</>}
          </Button>
        </div>
      </div>

      {showMobileView && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-[400px] h-full max-h-[800px] bg-white border-[12px] border-slate-900 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
            {/* Phone Notch/Speaker */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-slate-900 rounded-b-3xl z-20 flex items-center justify-center">
              <div className="w-16 h-1.5 bg-slate-800 rounded-full" />
            </div>
            
            <div className="absolute top-4 right-8 z-20">
              <button 
                onClick={() => setShowMobileView(false)}
                className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black"
              >
                X
              </button>
            </div>

            {/* Mobile Content Iframe */}
            <div className="flex-1 mt-6">
              <iframe 
                src="/" 
                className="w-full h-full border-none"
                title="Mobile Preview"
              />
            </div>
            
            {/* Phone Home Indicator */}
            <div className="h-6 w-full bg-slate-900 flex items-center justify-center">
              <div className="w-24 h-1 bg-white/20 rounded-full" />
            </div>
          </div>
          
          <div className="ml-8 hidden lg:block text-white max-w-xs">
             <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 border-l-4 border-brand-primary pl-4">Mobile Simulator</h2>
             <p className="text-[10px] font-bold text-white/60 uppercase leading-relaxed">
               This view shows exactly how your "Special Offer" and "Slider" will look on a mobile device. 
               We've updated the layout so that these sections remain visible and optimized for smaller screens.
             </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Support Links */}
        <Card className="rounded-none border-[#777] bg-white shadow-lg overflow-hidden">
          <CardHeader className="bg-[#9B2B2C] text-white py-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Globe className="h-4 w-4" /> Customer Support Links
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {(settings.footerSupportLinks || []).map((link, i) => (
              <div key={i} className="flex gap-2 items-end group">
                <div className="flex-1 space-y-1">
                  <Label className="text-[9px] font-black uppercase text-slate-400">Label</Label>
                  <Input 
                    value={link.label} 
                    onChange={(e) => updateLink('support', i, 'label', e.target.value)}
                    className="rounded-none border-[#777] font-bold text-xs uppercase"
                  />
                </div>
                <div className="flex-[2] space-y-1">
                  <Label className="text-[9px] font-black uppercase text-slate-400">URL PATH</Label>
                  <Input 
                    value={link.url} 
                    onChange={(e) => updateLink('support', i, 'url', e.target.value)}
                    className="rounded-none border-[#777] font-bold text-xs"
                  />
                </div>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => removeLink('support', i)}
                  className="rounded-none h-10 w-10 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              onClick={() => addLink('support')}
              className="w-full border-dashed border-[#9B2B2C] text-[#9B2B2C] hover:bg-[#9B2B2C] hover:text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-none mt-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Support Link
            </Button>
          </CardContent>
        </Card>

        {/* Company Links */}
        <Card className="rounded-none border-[#777] bg-white shadow-lg overflow-hidden">
          <CardHeader className="bg-[#9B2B2C] text-white py-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Info className="h-4 w-4" /> Company Info Links
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {(settings.footerCompanyLinks || []).map((link, i) => (
              <div key={i} className="flex gap-2 items-end group">
                <div className="flex-1 space-y-1">
                  <Label className="text-[9px] font-black uppercase text-slate-400">Label</Label>
                  <Input 
                    value={link.label} 
                    onChange={(e) => updateLink('company', i, 'label', e.target.value)}
                    className="rounded-none border-[#777] font-bold text-xs uppercase"
                  />
                </div>
                <div className="flex-[2] space-y-1">
                  <Label className="text-[9px] font-black uppercase text-slate-400">URL PATH</Label>
                  <Input 
                    value={link.url} 
                    onChange={(e) => updateLink('company', i, 'url', e.target.value)}
                    className="rounded-none border-[#777] font-bold text-xs"
                  />
                </div>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => removeLink('company', i)}
                  className="rounded-none h-10 w-10 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              onClick={() => addLink('company')}
              className="w-full border-dashed border-[#9B2B2C] text-[#9B2B2C] hover:bg-[#9B2B2C] hover:text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-none mt-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Company Link
            </Button>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="rounded-none border-[#777] bg-white shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-900 text-white py-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {(settings.socialLinks || []).map((link, i) => (
              <div key={i} className="flex gap-2 items-end group">
                <div className="flex-1 space-y-1">
                  <Label className="text-[9px] font-black uppercase text-slate-400">Platform (FB, IG...)</Label>
                  <Input 
                    value={link.platform} 
                    onChange={(e) => updateLink('social', i, 'platform', e.target.value)}
                    className="rounded-none border-[#777] font-bold text-xs uppercase"
                  />
                </div>
                <div className="flex-[2] space-y-1">
                  <Label className="text-[9px] font-black uppercase text-slate-400">Full URL</Label>
                  <Input 
                    value={link.url} 
                    onChange={(e) => updateLink('social', i, 'url', e.target.value)}
                    className="rounded-none border-[#777] font-bold text-xs"
                  />
                </div>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => removeLink('social', i)}
                  className="rounded-none h-10 w-10 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              onClick={() => addLink('social')}
              className="w-full border-dashed border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-none mt-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Social Link
            </Button>
          </CardContent>
        </Card>

        {/* Branding & Info */}
        <Card className="rounded-none border-[#777] bg-white shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-900 text-white py-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Info className="h-4 w-4" /> Branding & Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-600">Site Name</Label>
              <Input 
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="h-10 bg-white border-[#777] rounded-none font-black text-sm uppercase focus:outline-none focus:border-[#9B2B2C]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-600">Site Description (Footer)</Label>
              <textarea 
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                className="w-full min-h-[120px] p-4 bg-[#f4e4d4]/10 border border-[#777] font-bold text-xs uppercase tracking-tight focus:outline-none focus:border-[#9B2B2C]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Global Color Protocols - NEW */}
        <Card className="rounded-none border-[#777] bg-white shadow-lg overflow-hidden border-t-4 border-t-[#9B2B2C]">
          <CardHeader className="bg-[#ead9c4]/30 py-4 border-b border-[#777]">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-[#9B2B2C]" /> Global Style Protocols (থিম কালার পরিবর্তন)
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-500 font-bold uppercase">
              Control the overall visual vibe of the website.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 p-4 bg-[#f4e4d4]/20 border border-dashed border-[#9B2B2C]/30 mb-4">
              <Checkbox 
                id="theme-enabled"
                checked={settings.theme?.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  theme: { ...(prev.theme || defaultSettings.theme!), enabled: !!checked }
                }))}
              />
              <Label htmlFor="theme-enabled" className="text-xs font-black uppercase text-[#9B2B2C] cursor-pointer">
                Enable Custom Color Protocols (মাস্টার কালার সক্রিয় করুন)
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600">Primary Brand Color (মেইন কালার)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color"
                    value={settings.theme?.primaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...(prev.theme || defaultSettings.theme!), primaryColor: e.target.value }
                    }))}
                    className="w-12 h-10 p-1 rounded-none border-[#777] cursor-pointer"
                  />
                  <Input 
                    value={settings.theme?.primaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...(prev.theme || defaultSettings.theme!), primaryColor: e.target.value }
                    }))}
                    className="flex-1 h-10 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600">Secondary BG Color (বর্ডার/হেডার কালার)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color"
                    value={settings.theme?.secondaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...(prev.theme || defaultSettings.theme!), secondaryColor: e.target.value }
                    }))}
                    className="w-12 h-10 p-1 rounded-none border-[#777] cursor-pointer"
                  />
                  <Input 
                    value={settings.theme?.secondaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...(prev.theme || defaultSettings.theme!), secondaryColor: e.target.value }
                    }))}
                    className="flex-1 h-10 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600">Global Background (পেছনের কালার)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color"
                    value={settings.theme?.backgroundColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...(prev.theme || defaultSettings.theme!), backgroundColor: e.target.value }
                    }))}
                    className="w-12 h-10 p-1 rounded-none border-[#777] cursor-pointer"
                  />
                  <Input 
                    value={settings.theme?.backgroundColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...(prev.theme || defaultSettings.theme!), backgroundColor: e.target.value }
                    }))}
                    className="flex-1 h-10 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600">Button Master Color (বাটন কালার)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color"
                    value={settings.theme?.buttonColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...(prev.theme || defaultSettings.theme!), buttonColor: e.target.value }
                    }))}
                    className="w-12 h-10 p-1 rounded-none border-[#777] cursor-pointer"
                  />
                  <Input 
                    value={settings.theme?.buttonColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...(prev.theme || defaultSettings.theme!), buttonColor: e.target.value }
                    }))}
                    className="flex-1 h-10 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase text-slate-600">Card Background (কার্ডের পেছনের কালার)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color"
                    value={settings.theme?.cardColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...(prev.theme || defaultSettings.theme!), cardColor: e.target.value }
                    }))}
                    className="w-12 h-10 p-1 rounded-none border-[#777] cursor-pointer"
                  />
                  <Input 
                    value={settings.theme?.cardColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...(prev.theme || defaultSettings.theme!), cardColor: e.target.value }
                    }))}
                    className="flex-1 h-10 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200">
               <p className="text-[9px] font-bold text-blue-700 uppercase leading-relaxed tracking-wider">
                 * এই কালারগুলো শুধুমাত্র তখনই কাজ করবে যখন আপনি উপরের "Enable Custom Color Protocols" চেক বক্সে টিক দিবেন। 
                 টিক না দিলে ওয়েবসাইটের অরিজিনাল (Master) কালার ব্যবহার হবে।
               </p>
            </div>
          </CardContent>
        </Card>

        {/* Home Countdown Protocols - NEW */}
        <Card className="rounded-none border-[#777] bg-white shadow-lg overflow-hidden border-t-4 border-t-brand-primary">
          <CardHeader className="bg-slate-900 text-white py-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Timer className="h-4 w-4" /> Flash Sale Countdown (অফার এর সময় নির্ধারণ)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 p-4 bg-[#f4e4d4]/20 border border-dashed border-brand-primary/30">
              <Checkbox 
                id="countdown-enabled"
                checked={settings.countdown?.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  countdown: { ...(prev.countdown || defaultSettings.countdown!), enabled: !!checked }
                }))}
              />
              <Label htmlFor="countdown-enabled" className="text-xs font-black uppercase text-brand-primary cursor-pointer">
                Flash Sale Active (ফ্ল্যাশ সেল চালু করুন)
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600">Promotion Label (হেডিং টেকক্সট)</Label>
                <Input 
                  value={settings.countdown?.text}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    countdown: { ...(prev.countdown || defaultSettings.countdown!), text: e.target.value }
                  }))}
                  className="h-10 border-[#777] rounded-none font-black text-xs uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600">End Date & Time (অফার শেষ হওয়ার সময়)</Label>
                <Input 
                  type="datetime-local"
                  value={settings.countdown?.targetDate ? new Date(new Date(settings.countdown.targetDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    countdown: { ...(prev.countdown || defaultSettings.countdown!), targetDate: new Date(e.target.value).toISOString() }
                  }))}
                  className="h-10 border-[#777] rounded-none font-black text-xs uppercase"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200">
               <p className="text-[9px] font-bold text-amber-700 uppercase leading-relaxed tracking-wider">
                 * এখানে যে সময় দিবেন সেই সময় অনুযায়ী হোমপেজের ফ্ল্যাশ সেলের সময় কমতে থাকবে। সময় শেষ হয়ে গেলে কাউন্টডাউন জিরো হয়ে যাবে।
               </p>
            </div>
          </CardContent>
        </Card>

        {/* Home Sidebar Protocols - NEW */}
        <Card className="rounded-none border-[#777] bg-white shadow-lg overflow-hidden border-t-4 border-t-brand-primary">
          <CardHeader className="bg-[#ead9c4]/30 py-4 border-b border-[#777]">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-brand-primary" /> Sidebar Protocols (সাইডবার নিয়ন্ত্রণ)
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-500 font-bold uppercase">
              Control the left sidebar behavior (Categories vs Offers).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-[#777]/20">
                <Checkbox 
                  id="show-categories"
                  checked={settings.sidebar?.showCategories}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    sidebar: { ...(prev.sidebar || defaultSettings.sidebar!), showCategories: !!checked }
                  }))}
                />
                <Label htmlFor="show-categories" className="text-xs font-black uppercase text-slate-700 cursor-pointer">
                  Show All Categories (ক্যাটাগরি লিস্ট দেখান)
                </Label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-[#777]/20">
                <Checkbox 
                  id="show-offer"
                  checked={settings.sidebar?.showOffer}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    sidebar: { ...(prev.sidebar || defaultSettings.sidebar!), showOffer: !!checked }
                  }))}
                />
                <Label htmlFor="show-offer" className="text-xs font-black uppercase text-brand-primary cursor-pointer">
                  Show Sidebar Offer (অফার কার্ড দেখান)
                </Label>
              </div>
            </div>

            {settings.sidebar?.showOffer && (
              <div className="p-6 bg-brand-primary/5 border border-brand-primary/20 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-brand-primary mb-2">Offer Configuration (অফার সেটিংস)</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-600">Offer Title</Label>
                    <Input 
                      value={settings.sidebar?.offerTitle}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        sidebar: { ...(prev.sidebar || defaultSettings.sidebar!), offerTitle: e.target.value }
                      }))}
                      className="h-10 border-[#777] rounded-none font-black text-xs uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-600">Offer Image (সরাসরি আপলোড করুন)</Label>
                    <div className="flex flex-col gap-4">
                      {settings.sidebar?.offerImageUrl && (
                        <div className="relative w-full h-40 border border-[#777] overflow-hidden bg-slate-100">
                          <img 
                            src={settings.sidebar.offerImageUrl} 
                            className="w-full h-full object-cover" 
                            alt="Offer Preview" 
                          />
                          <button 
                            onClick={() => setSettings(prev => ({
                              ...prev,
                              sidebar: { ...(prev.sidebar || defaultSettings.sidebar!), offerImageUrl: '' }
                            }))}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-none hover:bg-red-700 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      
                      <div className="relative cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSettings(prev => ({
                                  ...prev,
                                  sidebar: { ...(prev.sidebar || defaultSettings.sidebar!), offerImageUrl: reader.result as string }
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-[#777]/30 p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                          <p className="text-[10px] font-black uppercase text-slate-500">
                            {settings.sidebar?.offerImageUrl ? 'Change Image (ইমেজ পরিবর্তন করুন)' : 'Choose Image (ইমেজ সিলেক্ট করুন)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-600">Offer Destination Link</Label>
                    <Input 
                      value={settings.sidebar?.offerLink}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        sidebar: { ...(prev.sidebar || defaultSettings.sidebar!), offerLink: e.target.value }
                      }))}
                      className="h-10 border-[#777] rounded-none font-black text-xs"
                      placeholder="/shop or https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-600">Offer Description (ছোট বিবরণ)</Label>
                    <textarea 
                      value={settings.sidebar?.offerDescription || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        sidebar: { ...(prev.sidebar || defaultSettings.sidebar!), offerDescription: e.target.value }
                      }))}
                      rows={3}
                      className="w-full bg-white border border-[#777] p-3 rounded-none font-black text-xs focus:outline-none focus:border-brand-primary"
                      placeholder="লিখুন..."
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Ads & Notices - REFACTORED */}
        <Card className="rounded-none border-[#777] bg-white shadow-lg lg:col-span-2 overflow-hidden">
          <CardHeader className="bg-slate-900 text-white py-4 border-b border-[#777]">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Megaphone className="h-4 w-4" /> Global Dispatch & Ad Control
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-[#777]/20">
              
              {/* Slot 1: Features Section */}
              <div className="p-8 space-y-6 bg-[#f4e4d4]/10">
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox 
                    id="features-ad"
                    checked={settings.ads?.featuresAd?.active}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      ads: { 
                        ...prev.ads, 
                        featuresAd: { ...(prev.ads?.featuresAd || defaultSettings.ads!.featuresAd), active: !!checked } 
                      }
                    }))}
                  />
                  <Label htmlFor="features-ad" className="text-xs font-black uppercase text-[#9B2B2C] cursor-pointer">HOME FEATURES AD (REPLACE ICONS)</Label>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase text-slate-400">Headline Message</Label>
                    <Input 
                      value={settings.ads?.featuresAd?.message || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        ads: { 
                          ...prev.ads, 
                          featuresAd: { ...(prev.ads?.featuresAd || defaultSettings.ads!.featuresAd), message: e.target.value } 
                        }
                      }))}
                      className="rounded-none border-[#777] font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase text-slate-400">Redirect Link</Label>
                    <Input 
                      value={settings.ads?.featuresAd?.link || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        ads: { 
                          ...prev.ads, 
                          featuresAd: { ...(prev.ads?.featuresAd || defaultSettings.ads!.featuresAd), link: e.target.value } 
                        }
                      }))}
                      className="rounded-none border-[#777] font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 2: Popup Ad */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox 
                    id="popup-ad"
                    checked={settings.ads?.popupAd?.active}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      ads: { 
                        ...prev.ads, 
                        popupAd: { ...(prev.ads?.popupAd || defaultSettings.ads!.popupAd), active: !!checked } 
                      }
                    }))}
                  />
                  <Label htmlFor="popup-ad" className="text-xs font-black uppercase text-[#9B2B2C] cursor-pointer">POPUP PROMO AD (PPUNDAR)</Label>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase text-slate-400">Popup Headline</Label>
                    <Input 
                      value={settings.ads?.popupAd?.message || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        ads: { 
                          ...prev.ads, 
                          popupAd: { ...(prev.ads?.popupAd || defaultSettings.ads!.popupAd), message: e.target.value } 
                        }
                      }))}
                      className="rounded-none border-[#777] font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase text-slate-400">Image URL</Label>
                    <Input 
                      value={settings.ads?.popupAd?.imageUrl || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        ads: { 
                          ...prev.ads, 
                          popupAd: { ...(prev.ads?.popupAd || defaultSettings.ads!.popupAd), imageUrl: e.target.value } 
                        }
                      }))}
                      className="rounded-none border-[#777] font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 3: Social Bar Notice */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox 
                    id="social-ad"
                    checked={settings.ads?.socialBarAd?.active}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      ads: { 
                        ...prev.ads, 
                        socialBarAd: { ...(prev.ads?.socialBarAd || defaultSettings.ads!.socialBarAd), active: !!checked } 
                      }
                    }))}
                  />
                  <Label htmlFor="social-ad" className="text-xs font-black uppercase text-[#9B2B2C] cursor-pointer">SOCIAL BAR NOTICE (SOCAILBAR)</Label>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase text-slate-400">Notice Text</Label>
                    <Input 
                      value={settings.ads?.socialBarAd?.message || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        ads: { 
                          ...prev.ads, 
                          socialBarAd: { ...(prev.ads?.socialBarAd || defaultSettings.ads!.socialBarAd), message: e.target.value } 
                        }
                      }))}
                      className="rounded-none border-[#777] font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 4: Global Header Notice */}
              <div className="p-8 space-y-6 bg-[#f4e4d4]/10">
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox 
                    id="global-notice"
                    checked={settings.ads?.globalNotice?.active}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      ads: { 
                        ...prev.ads, 
                        globalNotice: { ...(prev.ads?.globalNotice || defaultSettings.ads!.globalNotice), active: !!checked } 
                      }
                    }))}
                  />
                  <Label htmlFor="global-notice" className="text-xs font-black uppercase text-[#9B2B2C] cursor-pointer">GLOBAL HEADER NOTICE (SET NOTISH)</Label>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase text-slate-400">Announcement Message</Label>
                    <textarea 
                      value={settings.ads?.globalNotice?.message || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        ads: { 
                          ...prev.ads, 
                          globalNotice: { ...(prev.ads?.globalNotice || defaultSettings.ads!.globalNotice), message: e.target.value } 
                        }
                      }))}
                      className="w-full min-h-[60px] p-2 bg-white border border-[#777] font-bold text-xs uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adsterra Integration */}
        <Card className="rounded-none border-[#777] bg-white shadow-lg lg:col-span-2 overflow-hidden">
          <CardHeader className="bg-slate-900 text-white py-4 border-b border-[#777]">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Plus className="h-4 w-4" /> Adsterra Integration (External Monetization)
            </CardTitle>
            <CardDescription className="text-[10px] text-white/60 font-bold uppercase">
              Paste your full Adsterra script tags here. These will be injected into the storefront.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Popunder Script</Label>
                <textarea 
                  value={settings.ads?.adsterra?.popunderCode || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ads: { 
                      ...prev.ads, 
                      adsterra: { ...(prev.ads?.adsterra || (defaultSettings.ads!.adsterra as any)), popunderCode: e.target.value } 
                    }
                  }))}
                  placeholder="Paste <script>...</script> for Popunder"
                  className="w-full min-h-[100px] p-4 bg-[#f4e4d4]/10 border border-[#777] font-mono text-[10px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Social Bar Script</Label>
                <textarea 
                  value={settings.ads?.adsterra?.socialBarCode || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ads: { 
                      ...prev.ads, 
                      adsterra: { ...(prev.ads?.adsterra || (defaultSettings.ads!.adsterra as any)), socialBarCode: e.target.value } 
                    }
                  }))}
                  placeholder="Paste <script>...</script> for Social Bar"
                  className="w-full min-h-[100px] p-4 bg-[#f4e4d4]/10 border border-[#777] font-mono text-[10px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Native Banner Script / Unit</Label>
                <textarea 
                  value={settings.ads?.adsterra?.nativeBannerCode || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ads: { 
                      ...prev.ads, 
                      adsterra: { ...(prev.ads?.adsterra || (defaultSettings.ads!.adsterra as any)), nativeBannerCode: e.target.value } 
                    }
                  }))}
                  placeholder="Paste <script>...</script> and container for Native Banner"
                  className="w-full min-h-[100px] p-4 bg-[#f4e4d4]/10 border border-[#777] font-mono text-[10px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Banner Ad Slot 1 (Top)</Label>
                  <textarea 
                    value={settings.ads?.adsterra?.bannerOneCode || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      ads: { 
                        ...prev.ads, 
                        adsterra: { ...(prev.ads?.adsterra || (defaultSettings.ads!.adsterra as any)), bannerOneCode: e.target.value } 
                      }
                    }))}
                    placeholder="Paste banner script for Slot 1"
                    className="w-full min-h-[100px] p-4 bg-[#f4e4d4]/10 border border-[#777] font-mono text-[10px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Banner Ad Slot 2 (Bottom)</Label>
                  <textarea 
                    value={settings.ads?.adsterra?.bannerTwoCode || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      ads: { 
                        ...prev.ads, 
                        adsterra: { ...(prev.ads?.adsterra || (defaultSettings.ads!.adsterra as any)), bannerTwoCode: e.target.value } 
                      }
                    }))}
                    placeholder="Paste banner script for Slot 2"
                    className="w-full min-h-[100px] p-4 bg-[#f4e4d4]/10 border border-[#777] font-mono text-[10px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Custom Script / Header Header Ad</Label>
                <textarea 
                  value={settings.ads?.adsterra?.customAdScript || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ads: { 
                      ...prev.ads, 
                      adsterra: { ...(prev.ads?.adsterra || (defaultSettings.ads!.adsterra as any)), customAdScript: e.target.value } 
                    }
                  }))}
                  placeholder="Paste any other custom ad script or tracking code"
                  className="w-full min-h-[120px] p-4 bg-[#f4e4d4]/10 border border-[#777] font-mono text-[10px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Credentials */}
        <Card className="rounded-none border-[#777] bg-white shadow-lg lg:col-span-2 overflow-hidden border-t-4 border-t-[#9B2B2C]">
          <CardHeader className="bg-[#f4e4d4]/30 py-4 border-b border-[#777]">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#9B2B2C]" /> Admin Access Configuration (লগইন তথ্য পরিবর্তন)
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-500 font-bold uppercase">
              Change your administrative username and password. Keep these secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2">
                    <User className="h-3 w-3" /> New Admin Username (ইউজারনেম)
                  </Label>
                  <Input 
                    value={settings.ads?.adminCredentials?.username || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      ads: { 
                        ...prev.ads, 
                        adminCredentials: { ...(prev.ads?.adminCredentials || defaultSettings.ads!.adminCredentials!), username: e.target.value } 
                      }
                    }))}
                    placeholder="Enter new username"
                    className="rounded-none border-[#777] font-black text-xs h-12 bg-[#f4e4d4]/10"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2">
                    <Lock className="h-3 w-3" /> New Admin Password (পাসওয়ার্ড)
                  </Label>
                  <Input 
                    type="text"
                    value={settings.ads?.adminCredentials?.pass || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      ads: { 
                        ...prev.ads, 
                        adminCredentials: { ...(prev.ads?.adminCredentials || defaultSettings.ads!.adminCredentials!), pass: e.target.value } 
                      }
                    }))}
                    placeholder="Enter new password"
                    className="rounded-none border-[#777] font-black text-xs h-12 bg-[#f4e4d4]/10"
                  />
                  <p className="text-[9px] font-bold text-slate-400 uppercase italic">* আপনি কি টাইপ করছেন দেখার সুবিধার জন্য এটি সাধারণ টেক্সট মুডে রাখা হয়েছে।</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-[#777]/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2">
                    <Mail className="h-3 w-3" /> Authorized Google Admin Emails (অ্যাডমিন জিমেইল তালিকা)
                  </Label>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                    List of Google accounts that can access the Admin Panel and recover access.
                  </p>
                </div>
                <Button 
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    ads: { 
                      ...prev.ads, 
                      adminEmails: [...(prev.ads?.adminEmails || []), ''] 
                    }
                  }))}
                  variant="outline"
                  size="sm"
                  className="rounded-none border-[#777] h-8 text-[9px] font-black uppercase tracking-widest px-4 hover:bg-[#9B2B2C] hover:text-white transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <Plus className="mr-2 h-3 w-3" /> Add Email
                </Button>
              </div>

              <div className="space-y-3">
                {(settings.ads?.adminEmails || []).map((email, i) => (
                  <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const newEmails = [...(settings.ads?.adminEmails || [])];
                        newEmails[i] = e.target.value;
                        setSettings(prev => ({
                          ...prev,
                          ads: { ...prev.ads, adminEmails: newEmails }
                        }));
                      }}
                      placeholder="admin@gmail.com"
                      className="rounded-none border-[#777] font-bold text-xs h-10 bg-white"
                    />
                    <Button 
                      onClick={() => {
                        const newEmails = (settings.ads?.adminEmails || []).filter((_, idx) => idx !== i);
                        setSettings(prev => ({
                          ...prev,
                          ads: { ...prev.ads, adminEmails: newEmails }
                        }));
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-none border border-transparent hover:border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {(settings.ads?.adminEmails || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#777]/30 bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">No authorized emails defined. Only the primary account will work.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 p-4 bg-red-50 border border-red-200 flex items-start gap-4">
               <Info className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
               <p className="text-[10px] font-bold text-red-700 uppercase leading-relaxed">
                 সতর্কতা: ইউজারনেম এবং পাসওয়ার্ড পরিবর্তন করলে আপনাকে পুনরায় নতুন তথ্য দিয়ে লগইন করতে হতে পারে। দয়া করে নতুন তথ্যগুলো মনে রাখুন অথবা কোথাও সেভ করে রাখুন।
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
