import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Heart, Menu, X, LogOut, ShoppingBasket } from 'lucide-react';
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
        setTimeout(() => setShowPopup(true), 1500);
      }
    }
  }, [settings]);

  React.useEffect(() => {
    // Inject Adsterra Scripts - Optimized to prevent reloading/stuck
    const ads = settings?.ads?.adsterra;
    if (ads) {
      const injectScript = (id: string, code: string) => {
        if (!code || code.trim() === '') return;
        
        // Better check: if container exists AND has the same code, don't re-inject
        const existing = document.getElementById(id);
        if (existing && existing.getAttribute('data-code') === btoa(code)) return;

        // Remove old if code changed
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = id;
        container.setAttribute('data-code', btoa(code));
        container.innerHTML = code;
        
        const scripts = Array.from(container.getElementsByTagName('script'));
        scripts.forEach(oldScript => {
          const s = document.createElement('script');
          if (oldScript.src) {
            s.src = oldScript.src;
          } else {
            s.innerHTML = oldScript.innerHTML;
          }
          // Copy other attributes
          Array.from(oldScript.attributes).forEach(attr => s.setAttribute(attr.name, attr.value));
          document.body.appendChild(s);
        });
        
        if (id !== 'adsterra-popunder-wrap') {
            document.body.appendChild(container);
        }
      };

      if (ads.popunderCode) injectScript('adsterra-popunder-wrap', ads.popunderCode);
      if (ads.socialBarCode) injectScript('adsterra-socialbar-wrap', ads.socialBarCode);
      if (ads.customAdScript) injectScript('adsterra-custom-wrap', ads.customAdScript);
    }
  }, [settings?.ads?.adsterra?.popunderCode, settings?.ads?.adsterra?.socialBarCode, settings?.ads?.adsterra?.customAdScript]);

  // Helper for Banner Injection
  const injectAdIntoRef = (ref: React.RefObject<HTMLDivElement | null>, code?: string) => {
    if (ref.current && code) {
      ref.current.innerHTML = '';
      const container = document.createElement('div');
      container.innerHTML = code;
      const scriptList = Array.from(container.getElementsByTagName('script'));
      ref.current.appendChild(container);
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
    }
  };

  // Re-run injections when settings change
  React.useEffect(() => {
    injectAdIntoRef(nativeAdRef, settings?.ads?.adsterra?.nativeBannerCode);
    injectAdIntoRef(bannerOneRef, settings?.ads?.adsterra?.bannerOneCode);
    injectAdIntoRef(bannerTwoRef, settings?.ads?.adsterra?.bannerTwoCode);
  }, [settings]);

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
    <div className="min-h-screen flex flex-col bg-[#f4e4d4] text-slate-900 font-sans">
      {/* Global Notice Banner */}
      {settings?.ads?.globalNotice?.active && (
        <div className="bg-slate-900 text-white py-2 px-4 relative overflow-hidden group border-b border-[#9B2B2C]/30">
          <div className="absolute inset-0 bg-[#9B2B2C]/5 animate-pulse pointer-events-none" />
          <div className="container mx-auto flex items-center justify-center gap-4 relative z-10">
            <div className="w-1.5 h-1.5 bg-[#9B2B2C] rounded-full animate-ping" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">
              {settings.ads.globalNotice.message}
            </p>
            <div className="w-1.5 h-1.5 bg-[#9B2B2C] rounded-full animate-ping" />
          </div>
        </div>
      )}

      {/* Social Bar Ad (SOCAILBAR) */}
      {settings?.ads?.socialBarAd?.active && (
        <div className="bg-[#9B2B2C] text-white py-1.5 border-b border-black/10">
          <div className="container mx-auto px-4 flex items-center justify-center gap-4">
             <p className="text-[9px] font-black uppercase tracking-[0.25em]">
               {settings.ads.socialBarAd.message}
             </p>
             {settings.ads.socialBarAd.link && (
               <Link 
                 to={settings.ads.socialBarAd.link} 
                 className="text-[9px] font-black underline bg-white text-[#9B2B2C] px-2 py-0.5 hover:bg-slate-900 hover:text-white transition-all"
               >
                 EXPLORE
               </Link>
             )}
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-[#777] bg-[#ead9c4]/95 backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="text-2xl font-black tracking-tighter text-[#9B2B2C] uppercase group flex items-center gap-3">
              <div className="bg-[#9B2B2C] text-white p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingBasket className="h-6 w-6" />
              </div>
              <div>
                {(settings?.siteName || 'BAZAR DALA').split(' ')[0]}
                <span className="text-slate-900 group-hover:text-[#9B2B2C] transition-colors">
                  {' '}{(settings?.siteName || 'BAZAR DALA').split(' ').slice(1).join(' ')}
                </span>
              </div>
            </Link>
            <nav className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-[#9B2B2C]">
              <Link to="/" className="hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-[#9B2B2C] pb-1">HOME</Link>
              <Link to="/shop" className="hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-[#9B2B2C] pb-1">SHOP</Link>
              <Link to="/tracking" className="hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-[#9B2B2C] pb-1">TRACK ORDER</Link>
            </nav>
          </div>

          <div className="flex-1 max-w-lg mx-12 hidden xl:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B2B2C]" />
              <Input
                placeholder="Search products..."
                className="pl-12 bg-white/50 border-[#777] rounded-none h-11 text-xs font-bold uppercase tracking-tight focus-visible:ring-0 focus-visible:border-[#9B2B2C] placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative group">
              <div className="p-2 border border-[#777] bg-white group-hover:bg-[#ead9c4] transition-all">
                <ShoppingCart className="h-5 w-5 text-[#9B2B2C]" />
              </div>
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 h-5 min-w-[20px] bg-[#9B2B2C] text-white text-[10px] font-black flex items-center justify-center px-1 border border-white">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-1 border border-[#777] bg-white hover:bg-[#ead9c4] transition-all">
                    <div className="w-8 h-8 overflow-hidden grayscale">
                      <img
                        src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-[#777] rounded-none p-0 shadow-xl">
                  <DropdownMenuLabel className="bg-[#ead9c4] p-4 border-b border-[#777]">
                    <div className="flex flex-col space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none text-[#9B2B2C]">{user.displayName}</p>
                      <p className="text-[9px] font-bold leading-none text-slate-500 mt-1">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <div className="p-1 bg-[#f4e4d4]/10">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-[10px] font-black uppercase p-3 focus:bg-[#ead9c4]">
                      <User className="mr-3 h-4 w-4 text-[#9B2B2C]" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="text-[10px] font-black uppercase p-3 focus:bg-[#9B2B2C] focus:text-white">
                        <Menu className="mr-3 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#777]/20" />
                    <DropdownMenuItem onClick={handleLogout} className="text-[10px] font-black uppercase p-3 text-red-600 focus:bg-red-50">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} className="bg-[#9B2B2C] hover:bg-slate-900 text-white rounded-none h-10 px-8 text-[11px] font-black uppercase tracking-widest shadow-lg">
                Login
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden border border-[#777] bg-white rounded-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="text-[#9B2B2C]" /> : <Menu className="text-[#9B2B2C]" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-[#ead9c4] border-b border-[#777] overflow-hidden"
          >
            <nav className="flex flex-col p-6 gap-6 text-[11px] font-black uppercase tracking-widest">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="border-l-2 border-[#9B2B2C] pl-4 hover:bg-white/30 py-2">HOME</Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="border-l-2 border-[#9B2B2C] pl-4 hover:bg-white/30 py-2">SHOP</Link>
              <Link to="/tracking" onClick={() => setIsMenuOpen(false)} className="border-l-2 border-[#9B2B2C] pl-4 hover:bg-white/30 py-2">TRACK ORDER</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner Ad Slot 1 (Top) */}
      {settings?.ads?.adsterra?.bannerOneCode && (
        <div className="bg-white border-b border-[#777] py-4 flex justify-center overflow-hidden">
          <div ref={bannerOneRef} className="min-h-[90px] flex items-center justify-center" />
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Banner Ad Slot 2 (Bottom) */}
      {settings?.ads?.adsterra?.bannerTwoCode && (
        <div className="bg-white border-t border-b border-[#777] py-6 flex justify-center overflow-hidden">
          <div ref={bannerTwoRef} className="min-h-[90px] flex items-center justify-center" />
        </div>
      )}

      {/* Native Banner Ad Placement */}
      {settings?.ads?.adsterra?.nativeBannerCode && (
        <div className="container mx-auto px-4 py-8">
           <div 
             ref={nativeAdRef}
             className="flex justify-center border border-dashed border-slate-300 p-4 bg-white/50 min-h-[100px]"
           />
        </div>
      )}

      <footer className="bg-[#ead9c4] border-t border-[#777] pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-8">
              <h3 className="text-[#9B2B2C] text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
                <ShoppingBasket className="h-8 w-8" />
                <div>
                  {(settings?.siteName || 'BAZAR DALA').split(' ')[0]}
                  <span className="text-slate-900">
                    {' '}{(settings?.siteName || 'BAZAR DALA').split(' ').slice(1).join(' ')}
                  </span>
                </div>
              </h3>
              <p className="text-slate-600 text-[11px] font-bold uppercase leading-relaxed tracking-wider">
                {settings?.siteDescription || "Bangladesh’s premium online shop. Quality products, fast delivery, and secure payments."}
              </p>
              <div className="flex gap-4">
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
                    className="w-10 h-10 border border-[#777] bg-white flex items-center justify-center text-[#9B2B2C] hover:bg-[#9B2B2C] hover:text-white transition-all cursor-pointer font-black grayscale hover:grayscale-0"
                  >
                    <span className="text-xs uppercase">{social.platform.slice(0, 1)}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[#9B2B2C] font-black mb-8 uppercase tracking-[0.2em] text-[11px] border-b border-[#9B2B2C]/20 pb-3">Customer Support</h4>
              <ul className="space-y-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                {(settings?.footerSupportLinks || [
                  { label: 'Help Center', url: '/help' },
                  { label: 'How to Buy', url: '/how-to-buy' },
                  { label: 'Return Policy', url: '/returns' },
                  { label: 'Contact Us', url: '/contact' },
                  { label: 'Terms & Conditions', url: '/terms' }
                ]).map((link, i) => (
                  <li key={i}><Link to={link.url} className="hover:text-[#9B2B2C] transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[#9B2B2C] font-black mb-8 uppercase tracking-[0.2em] text-[11px] border-b border-[#9B2B2C]/20 pb-3">Our Company</h4>
              <ul className="space-y-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                {(settings?.footerCompanyLinks || [
                  { label: 'About Us', url: '/about' },
                  { label: 'Careers', url: '/careers' },
                  { label: 'Our Blog', url: '/blog' },
                  { label: 'Track Order', url: '/tracking' }
                ]).map((link, i) => (
                  <li key={i}><Link to={link.url} className="hover:text-[#9B2B2C] transition-colors">{link.label}</Link></li>
                ))}
                <li><Link to="/admin/login" className="text-slate-400 hover:text-[#9B2B2C] transition-colors">Admin Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#9B2B2C] font-black mb-8 uppercase tracking-[0.2em] text-[11px] border-b border-[#9B2B2C]/20 pb-3">Newsletter</h4>
              <p className="text-[10px] font-bold text-slate-600 uppercase mb-6 leading-relaxed">Subscribe for latest products and offers.</p>
              <div className="space-y-3">
                <Input placeholder="Enter your email" className="bg-white/50 border-[#777] rounded-none focus-visible:ring-0 focus-visible:border-[#9B2B2C] text-[10px] font-bold uppercase" />
                <Button className="w-full bg-[#9B2B2C] hover:bg-slate-900 text-white font-black uppercase text-[10px] rounded-none h-10 tracking-widest">Subscribe</Button>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-[#777]/30 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">© 2026 {settings?.siteName?.toUpperCase() || 'BAZAR DALA'} // ALL RIGHTS RESERVED</p>
            <div className="flex items-center gap-10 grayscale opacity-40 hover:opacity-100 transition-all">
              <span className="text-[10px] font-black text-slate-400">VISA</span>
              <span className="text-[10px] font-black text-slate-400">MASTERCARD</span>
              <span className="text-[10px] font-black text-slate-400">BKASH</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Popup Ad (PPUNDAR) */}
      <AnimatePresence>
        {showPopup && settings?.ads?.popupAd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPopup(false);
                sessionStorage.setItem('popup_displayed', 'true');
              }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white border-2 border-black shadow-[15px_15px_0px_#9B2B2C] p-0 overflow-hidden"
            >
              <button 
                onClick={() => {
                  setShowPopup(false);
                  sessionStorage.setItem('popup_displayed', 'true');
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-black text-white hover:bg-[#9B2B2C] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex flex-col">
                {settings.ads.popupAd.imageUrl && (
                  <div className="w-full aspect-video grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden border-b-2 border-black">
                    <img 
                      src={settings.ads.popupAd.imageUrl} 
                      alt="Promotion"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-8 space-y-6 text-center">
                   <div className="inline-block px-3 py-1 bg-[#9B2B2C] text-white text-[9px] font-black uppercase tracking-[0.4em] mb-2">
                     URGENT_DISPATCH_NOTICE
                   </div>
                   <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                     {settings.ads.popupAd.message}
                   </h2>
                   <div className="flex flex-col gap-3 pt-4">
                     {settings.ads.popupAd.link && (
                       <Link 
                         to={settings.ads.popupAd.link}
                         onClick={() => {
                           setShowPopup(false);
                           sessionStorage.setItem('popup_displayed', 'true');
                         }}
                         className="bg-black text-white font-black uppercase tracking-widest py-5 hover:bg-[#9B2B2C] transition-all text-xs"
                       >
                         Redeem Offer Now
                       </Link>
                     )}
                     <button 
                       onClick={() => {
                         setShowPopup(false);
                         sessionStorage.setItem('popup_displayed', 'true');
                       }}
                       className="text-[10px] font-black uppercase text-slate-400 hover:text-black tracking-widest transition-colors"
                     >
                       Dismiss Message
                     </button>
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
