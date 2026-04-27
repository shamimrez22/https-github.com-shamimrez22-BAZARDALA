import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Heart, Menu, X, LogOut, ShoppingBasket, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { auth, googleProvider, db } from '../../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { Badge } from '../ui/badge';
import { SiteSettings } from '../../types';
import { useSettings } from '../../context/SettingsContext';

export const UserLayout: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const { items } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showPopup, setShowPopup] = React.useState(false);
  const nativeAdRef = React.useRef<HTMLDivElement>(null);
  const bannerOneRef = React.useRef<HTMLDivElement>(null);
  const bannerTwoRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Handle Popup show
    if (settings?.ads?.popupAd?.active) {
      const alreadyShown = sessionStorage.getItem('popup_displayed');
      if (!alreadyShown) {
        setTimeout(() => setShowPopup(true), 500);
      }
    }
  }, [settings]);

  // Helper for Banner Injection
  const injectAdIntoRef = (ref: React.RefObject<HTMLDivElement | null>, code?: string) => {
    if (ref.current && code) {
      // Clear previous content
      ref.current.innerHTML = '';
      
      const container = document.createElement('div');
      container.innerHTML = code;
      const scriptList = Array.from(container.getElementsByTagName('script'));
      
      // Append non-script content
      const nonScriptContent = Array.from(container.childNodes).filter(node => node.nodeName !== 'SCRIPT');
      nonScriptContent.forEach(node => ref.current?.appendChild(node));

      // Append and execute scripts
      scriptList.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        if (oldScript.src) {
           newScript.src = oldScript.src;
        } else {
           newScript.innerHTML = oldScript.innerHTML;
        }
        ref.current?.appendChild(newScript);
      });
    } else if (ref.current) {
        ref.current.innerHTML = '';
    }
  };

  // Re-run injections when settings change
  React.useEffect(() => {
    const ads = settings?.ads?.adsterra;
    if (ads?.enabled) {
      injectAdIntoRef(nativeAdRef, ads.nativeBannerCode);
      injectAdIntoRef(bannerOneRef, ads.bannerOneCode);
      injectAdIntoRef(bannerTwoRef, ads.bannerTwoCode);
    } else {
      [nativeAdRef, bannerOneRef, bannerTwoRef].forEach(ref => {
        if (ref.current) ref.current.innerHTML = '';
      });
    }
    
    return () => {
        [nativeAdRef, bannerOneRef, bannerTwoRef].forEach(ref => {
            if (ref.current) ref.current.innerHTML = '';
        });
    };
  }, [
    settings?.ads?.adsterra?.enabled,
    settings?.ads?.adsterra?.nativeBannerCode, 
    settings?.ads?.adsterra?.bannerOneCode, 
    settings?.ads?.adsterra?.bannerTwoCode
  ]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans overflow-x-hidden pt-[88px] md:pt-[104px]">
      {/* Top Stack (Fixed) */}
      <div className="fixed top-0 left-0 right-0 z-[60] w-full flex flex-col bg-white">
        {/* Banner Notice (Topmost) */}
        {settings?.ads?.bannerNotice?.active && (
          <div className="h-[24px] w-full bg-[#1F6F5F] text-white flex items-center justify-center px-4 md:px-10 relative overflow-hidden shrink-0">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] relative z-10 animate-pulse">
               {settings.ads.bannerNotice.text}
             </p>
          </div>
        )}

        {/* Header Navigation */}
        <header className="w-full border-b-2 border-slate-900 bg-white transition-all shadow-sm shrink-0">
          <div className="w-full px-4 md:px-8 lg:px-12 h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Link to="/" className="text-lg md:text-2xl font-black tracking-tighter text-[#9B2B2C] uppercase group flex items-center gap-2 md:gap-3">
                <div className="bg-[#9B2B2C] text-white p-1.5 md:p-2.5 rounded-none shadow-lg border-2 border-slate-900 group-hover:rotate-6 transition-transform duration-500">
                  <ShoppingBasket className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="whitespace-nowrap underline underline-offset-4 decoration-slate-900 font-black">
                  <span className="xs:inline md:inline">{(settings?.siteName || 'BAZAR DALA').split(' ')[0]}</span>
                  <span className="text-slate-800 group-hover:text-[#9B2B2C] transition-colors">
                    {' '}<span className="hidden sm:inline">{(settings?.siteName || 'BAZAR DALA').split(' ').slice(1).join(' ')}</span>
                  </span>
                </div>
              </Link>
              <nav className="hidden xl:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Link to="/" onMouseEnter={() => import('../../pages/Home')} className="hover:text-[#9B2B2C] transition-colors relative group py-2">
                  HOME
                </Link>
                <Link to="/shop" onMouseEnter={() => import('../../pages/Shop')} className="hover:text-[#9B2B2C] transition-colors relative group py-2">
                  SHOP
                </Link>
                <Link to="/tracking" className="hover:text-[#9B2B2C] transition-colors relative group py-2">
                  TRACKING
                </Link>
              </nav>
            </div>

            <div className="flex-1 max-w-lg mx-12 hidden lg:block">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#9B2B2C] transition-colors" />
                <Input
                  placeholder="LOOKING_FOR_SOMETHING?"
                  className="pl-14 bg-[#f8f8f8] border-2 border-slate-900 rounded-none h-12 text-[12px] font-black uppercase tracking-widest focus-visible:ring-0 shadow-inner placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-5">
              <Link to="/cart" className="relative group">
                <div className="p-2 md:p-3 bg-[#f8f8f8] border-2 border-slate-900 rounded-none group-hover:bg-[#9B2B2C]/10 transition-all text-slate-900 group-hover:text-[#9B2B2C]">
                  <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] md:h-6 md:min-w-[24px] bg-[#9B2B2C] text-white text-[9px] md:text-[10px] font-black flex items-center justify-center px-1 md:px-1.5 rounded-none border-2 border-slate-900 shadow-md">
                    {items.length}
                  </span>
                )}
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 md:gap-3 p-1 rounded-none border-2 border-transparent hover:border-slate-900 transition-all">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-none overflow-hidden shadow-sm border-2 border-slate-900 bg-[#f8f8f8]">
                        <img
                          src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-white border-4 border-slate-900 rounded-none p-2 shadow-2xl mt-4 overflow-hidden">
                    <DropdownMenuLabel className="p-5 border-b-2 border-slate-900 mb-2">
                      <div className="flex flex-col">
                        <p className="text-[12px] font-black uppercase tracking-widest text-slate-800">{user.displayName}</p>
                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase opacity-60">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <div className="space-y-1">
                      <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-[11px] font-black uppercase p-4 rounded-none border-2 border-transparent focus:border-slate-900 focus:bg-[#f8f8f8] cursor-pointer">
                        <User className="mr-4 h-5 w-5 text-[#9B2B2C]" />
                        <span>MY_DASHBOARD</span>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => navigate('/admin')} className="text-[11px] font-black uppercase p-4 rounded-none border-2 border-transparent focus:border-slate-900 focus:bg-[#9B2B2C] focus:text-white cursor-pointer transition-colors">
                          <Menu className="mr-4 h-5 w-5" />
                          <span>ADMIN_CONSOLE</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-slate-900 h-[2px] my-2" />
                      <DropdownMenuItem onClick={handleLogout} className="text-[11px] font-black uppercase p-4 rounded-none border-2 border-transparent focus:border-slate-900 focus:bg-red-600 focus:text-white cursor-pointer">
                        <LogOut className="mr-4 h-5 w-5" />
                        <span>END_SESSION</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleLogin} className="bg-slate-900 hover:bg-[#9B2B2C] text-white rounded-none h-10 md:h-12 px-3 md:px-8 text-[11px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all border-2 border-slate-900">
                  <span className="hidden sm:inline">AUTH_LOGIN</span>
                  <User className="sm:hidden h-5 w-5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden bg-[#f8f8f8] border-2 border-slate-900 rounded-none h-10 w-10 md:h-12 md:w-12 hover:bg-slate-900 hover:text-white transition-all text-[#9B2B2C]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <Menu className="h-5 w-5 md:h-6 md:w-6" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Global Notice Banner (Embedded in Sticky Stack) */}
        <AnimatePresence>
          {settings?.ads?.globalNotice?.active && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full flex justify-center bg-white"
            >
              <div className="w-full bg-[#9B2B2C] shadow-lg text-white py-2 px-8 relative overflow-hidden rounded-none border-b-2 border-slate-900">
                <div className="flex items-center justify-center gap-5 relative z-10">
                  <div className="w-2 h-2 bg-white rounded-none animate-ping hidden sm:block" />
                  <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.25em] text-center">
                    {settings.ads.globalNotice.message}
                  </p>
                  <div className="w-2 h-2 bg-white rounded-none animate-ping hidden sm:block" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Bar Ad (Embedded in Sticky Stack) */}
        {settings?.ads?.socialBarAd?.active && (
          <div className="w-full flex justify-center bg-white">
            <div className="w-full bg-[#f8f8f8] shadow-lg text-slate-800 py-3 px-4 md:px-10 border-b-2 border-slate-900 rounded-none flex flex-row items-center justify-between gap-2 md:gap-6 overflow-hidden relative">
              <div className="flex items-center gap-2 md:gap-4 relative z-10">
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-[#9B2B2C]" />
                <p className="text-[8px] md:text-[12px] font-black uppercase tracking-widest text-left">
                  {settings.ads.socialBarAd.message}
                </p>
              </div>
              {settings.ads.socialBarAd.link && (
                <Link 
                  to={settings.ads.socialBarAd.link} 
                  className="relative z-10 bg-slate-900 text-white text-[8px] md:text-[9px] font-black uppercase px-3 md:px-6 py-1.5 md:py-2 rounded-none hover:bg-[#9B2B2C] transition-all shadow-md active:scale-95 border-2 border-slate-900 shrink-0"
                >
                  LINK
                </Link>
              )}
            </div>
          </div>
        )}
      </div>


      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-24 z-[55] lg:hidden bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-50 overflow-hidden"
          >
            <nav className="flex flex-col p-8 gap-5 text-[14px] font-black uppercase tracking-[0.2em] text-slate-800">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between group p-2">
                HOME <ArrowRight className="h-5 w-5 text-brand-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between group p-2">
                SHOP <ArrowRight className="h-5 w-5 text-brand-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </Link>
              <Link to="/tracking" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between group p-2">
                TRACKING <ArrowRight className="h-5 w-5 text-brand-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Banner Ads Section */}
      <div className="flex flex-col gap-6 py-10 bg-slate-50/20">
        {settings?.ads?.adsterra?.bannerOneCode && (
          <div className="flex justify-center overflow-hidden px-4">
             <div ref={bannerOneRef} className="min-h-[90px] w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-slate-50 flex items-center justify-center p-4" />
          </div>
        )}
        {settings?.ads?.adsterra?.bannerTwoCode && (
          <div className="flex justify-center overflow-hidden px-4">
             <div ref={bannerTwoRef} className="min-h-[90px] w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-slate-50 flex items-center justify-center p-4" />
          </div>
        )}
      </div>

      <footer className="bg-white pt-16 pb-12 relative overflow-hidden border-t-4 border-slate-900">
        <div className="w-full px-8 md:px-20 lg:px-40 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Link to="/" className="text-[#9B2B2C] text-2xl font-black tracking-tighter uppercase flex items-center gap-4">
                <div className="w-12 h-12 bg-[#9B2B2C] rounded-none border-2 border-slate-900 flex items-center justify-center text-white shadow-lg">
                  <ShoppingBasket className="h-6 w-6" />
                </div>
                <div className="underline underline-offset-4 decoration-slate-900 font-black">
                  {(settings?.siteName || 'BAZAR DALA').split(' ')[0]}
                  <span className="text-slate-900">
                    {' '}{(settings?.siteName || 'BAZAR DALA').split(' ').slice(1).join(' ')}
                  </span>
                </div>
              </Link>
              <p className="text-slate-500 text-[12px] font-black uppercase leading-relaxed tracking-wide mt-4 border-l-4 border-slate-900 pl-4">
                {settings?.siteDescription || "Bangladesh’s most Trusted & Premium curation of global brands and essential lifestyles."}
              </p>
              <div className="flex gap-3">
                {(settings?.socialLinks || [
                  { platform: 'FB', url: '#' },
                  { platform: 'TW', url: '#' },
                  { platform: 'IG', url: '#' }
                ]).map(social => (
                  <a 
                    key={social.platform} 
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-none bg-[#f8f8f8] border-2 border-slate-900 flex items-center justify-center text-slate-900 hover:bg-[#9B2B2C] hover:text-white transition-all shadow-md"
                  >
                    <span className="text-[10px] font-black">{social.platform}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-slate-900 font-black mb-8 uppercase tracking-[0.25em] text-[12px] flex items-center gap-3">
                <div className="w-2 h-2 bg-[#9B2B2C] rounded-none" />
                CORE_LOGISTICS
              </h4>
              <ul className="space-y-4 text-[12px] font-black text-slate-400 uppercase tracking-widest">
                {[
                  { label: 'CENTRAL_UNIT', url: '/help' },
                  { label: 'ACQUISITION', url: '/how-to-buy' },
                  { label: 'REVERSAL', url: '/returns' },
                  { label: 'COMMS_LINK', url: '/contact' },
                  { label: 'LEGAL_NODE', url: '/terms' }
                ].map((link, i) => (
                  <li key={i}><Link to={link.url} className="hover:text-[#9B2B2C] transition-colors hover:translate-x-2 inline-block"> {link.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-black mb-8 uppercase tracking-[0.25em] text-[12px] flex items-center gap-3">
                <div className="w-2 h-2 bg-[#9B2B2C] rounded-none" />
                LEGACY_RECORDS
              </h4>
              <ul className="space-y-4 text-[12px] font-black text-slate-400 uppercase tracking-widest">
                {[
                  { label: 'MANIFESTO', url: '/about' },
                  { label: 'TALENT_SEARCH', url: '/careers' },
                  { label: 'KNOWLEDGE_BASE', url: '/blog' },
                  { label: 'LOGISTICS_TRACK', url: '/tracking' }
                ].map((link, i) => (
                  <li key={i}><Link to={link.url} className="hover:text-[#9B2B2C] transition-colors hover:translate-x-2 inline-block"> {link.label}</Link></li>
                ))}
                <li><Link to="/admin/login" className="text-slate-300 hover:text-[#9B2B2C] transition-colors">ADMIN_CORE</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-black mb-8 uppercase tracking-[0.25em] text-[12px] flex items-center gap-3">
                <div className="w-2 h-2 bg-[#9B2B2C] rounded-none" />
                SYNC_DROPS
              </h4>
              <p className="text-[12px] font-black text-slate-400 mb-6 leading-relaxed">Join 50k+ savvy shoppers for exclusive early access to major drops.</p>
              <div className="space-y-3">
                <Input placeholder="NODE_ACCESS_ID" className="h-12 bg-[#f8f8f8] border-2 border-slate-900 rounded-none focus-visible:ring-0 text-[11px] font-black uppercase tracking-widest shadow-inner placeholder:text-slate-400" />
                <Button className="w-full bg-slate-900 hover:bg-[#9B2B2C] text-white font-black uppercase text-[11px] rounded-none h-12 tracking-widest shadow-lg transition-all border-2 border-slate-900">CONNECT_UPLINK</Button>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t-2 border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-loose opacity-60">© 2026 {settings?.siteName?.toUpperCase() || 'BAZAR DALA'} // DESIGNED_FOR_PROTOCOL_X</p>
            <div className="flex items-center gap-10 opacity-30 grayscale saturate-0">
               <div className="w-10 h-4 bg-slate-200" />
               <div className="w-10 h-4 bg-slate-100" />
               <div className="w-10 h-4 bg-slate-200" />
            </div>
          </div>
        </div>
      </footer>

      {/* Modern Popup Ad */}
      <AnimatePresence>
        {showPopup && settings?.ads?.popupAd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPopup(false);
                sessionStorage.setItem('popup_displayed', 'true');
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl cursor-pointer"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white rounded-none shadow-2xl p-0 overflow-hidden border-4 border-slate-900"
            >
              <button 
                onClick={() => {
                  setShowPopup(false);
                  sessionStorage.setItem('popup_displayed', 'true');
                }}
                className="absolute top-6 right-6 z-20 p-3 bg-white border-2 border-slate-900 rounded-none text-slate-800 hover:bg-[#9B2B2C] hover:text-white transition-all shadow-lg"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="flex flex-col">
                {settings.ads.popupAd.imageUrl && (
                  <div className="w-full aspect-[4/3] overflow-hidden group border-b-4 border-slate-900">
                    <img 
                      src={settings.ads.popupAd.imageUrl} 
                      alt="Promotion"
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 grayscale group-hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-10 md:p-14 space-y-8 text-center relative z-10 bg-white">
                   <div className="bg-white rounded-none p-10 shadow-xl space-y-6 relative z-10 border-2 border-slate-900">
                     <span className="inline-block px-5 py-1.5 bg-[#9B2B2C] text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-none shadow-md border border-white italic">
                       PRIVATE_OFFER_NODE
                     </span>
                     <h2 className="text-3xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none italic underline decoration-[#9B2B2C] decoration-4">
                       {settings.ads.popupAd.message}
                     </h2>
                     <div className="flex flex-col gap-4 pt-6">
                       {settings.ads.popupAd.link && (
                         <Link 
                           to={settings.ads.popupAd.link}
                           onClick={() => {
                             setShowPopup(false);
                             sessionStorage.setItem('popup_displayed', 'true');
                           }}
                           className="bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-none hover:bg-[#9B2B2C] transition-all text-sm shadow-xl active:scale-95 border-2 border-slate-900"
                         >
                           REDEEM_SPEC_PROTOCOL
                         </Link>
                       )}
                       <button 
                         onClick={() => {
                           setShowPopup(false);
                           sessionStorage.setItem('popup_displayed', 'true');
                         }}
                         className="text-[11px] font-black uppercase text-slate-400 hover:text-[#9B2B2C] tracking-[0.3em] transition-colors italic"
                       >
                         DISMISS_MANIFEST
                       </button>
                     </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
