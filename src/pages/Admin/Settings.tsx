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
import { Plus, Trash2, Save, Globe, Share2, Info, Zap, Megaphone, LayoutGrid, Image as ImageIcon, Lock, User, Shield } from 'lucide-react';
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
    }
  }
};

const Settings = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
            adminCredentials: { ...defaultSettings.ads!.adminCredentials, ...(data.ads?.adminCredentials || {}) }
          }
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
    const newSettings = { ...settings };
    if (type === 'support') newSettings.footerSupportLinks.push({ label: 'New Link', url: '#' });
    if (type === 'company') newSettings.footerCompanyLinks.push({ label: 'New Link', url: '#' });
    if (type === 'social') newSettings.socialLinks.push({ platform: 'NEW', url: '#' });
    setSettings(newSettings);
  };

  const removeLink = (type: 'support' | 'company' | 'social', index: number) => {
    const newSettings = { ...settings };
    if (type === 'support') newSettings.footerSupportLinks.splice(index, 1);
    if (type === 'company') newSettings.footerCompanyLinks.splice(index, 1);
    if (type === 'social') newSettings.socialLinks.splice(index, 1);
    setSettings(newSettings);
  };

  const updateLink = (type: 'support' | 'company' | 'social', index: number, field: string, value: string) => {
    const newSettings = { ...settings };
    if (type === 'support') (newSettings.footerSupportLinks[index] as any)[field] = value;
    if (type === 'company') (newSettings.footerCompanyLinks[index] as any)[field] = value;
    if (type === 'social') (newSettings.socialLinks[index] as any)[field] = value;
    setSettings(newSettings);
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
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-[#9B2B2C] hover:bg-slate-900 text-white font-black uppercase tracking-widest px-10 h-14 rounded-none shadow-[4px_4px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          {isSaving ? 'Saving...' : <><Save className="mr-3 h-5 w-5" /> Save Changes</>}
        </Button>
      </div>

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
                    className="rounded-none border-[#777] font-black text-xs uppercase h-12 bg-[#f4e4d4]/10"
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
