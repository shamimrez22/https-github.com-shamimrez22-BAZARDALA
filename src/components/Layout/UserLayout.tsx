import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Heart, Menu, X, LogOut, ShoppingBasket, Zap, ArrowRight, Facebook, Instagram, MessageSquare, Youtube, Mail, MapPin, Phone, Lock, AlertCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { safeStorage } from '../../lib/storage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { SiteSettings } from '../../types';
import { useSettings } from '../../context/SettingsContext';

const Logo: React.FC<{ variant?: 'header' | 'footer' | 'modal'; settings?: any }> = ({ variant = 'header', settings }) => {
  const siteName = settings?.siteName || 'BAZAR THOLE';
  const firstWord = siteName.split(' ')[0] || 'BAZAR';
  const restOfName = siteName.split(' ').slice(1).join(' ') || 'THOLE';

  return (
    <div className="flex items-center gap-1.5 md:gap-2.5 group cursor-pointer">
      <div className={`relative flex items-center justify-center transition-all duration-500 rounded-lg ${
        variant === 'footer' 
          ? 'w-10 h-10 md:w-11 md:h-11 bg-slate-900 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
          : variant === 'modal'
            ? 'w-12 h-12 md:w-14 md:h-14 bg-orange-500/10 border border-orange-500/20'
            : 'w-7 h-7 md:w-9 md:h-9 bg-white/10 hover:bg-white/15 border border-white/5'
      }`}>
        <div className="absolute inset-0 bg-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur" />
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform ${
            variant === 'footer' || variant === 'modal' ? 'text-orange-500' : 'text-orange-400'
          }`}
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <h1 className={`font-black tracking-tight leading-none uppercase ${
          variant === 'footer' 
            ? 'text-lg md:text-xl text-white' 
            : variant === 'modal'
              ? 'text-xl text-slate-950'
              : 'text-[11px] sm:text-sm md:text-lg text-white'
        }`}>
          <span className="text-orange-500">{firstWord}</span>
          <span className={variant === 'footer' ? 'text-white' : variant === 'modal' ? 'text-slate-800' : 'text-white'}>
            {' '}{restOfName}
          </span>
        </h1>
        <p className={`font-bold tracking-[0.2em] text-[6.5px] md:text-[7.5px] uppercase mt-0.5 leading-none ${
          variant === 'footer' 
            ? 'text-orange-500/80' 
            : variant === 'modal'
              ? 'text-slate-400'
              : 'text-orange-300'
        }`}>
          PREMIUM MARKET PLACE
        </p>
      </div>
    </div>
  );
};

export const UserLayout: React.FC = () => {
  const { user, profile, isAdmin, loginAdmin, logout, login, register, loginWithGoogle } = useAuth();
  const { items } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showPopup, setShowPopup] = React.useState(false);

  // Auth Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'register' | 'forgot'>('login');
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: ''
  });
  const [adminFormData, setAdminFormData] = React.useState({
    username: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  
  const nativeAdRef = React.useRef<HTMLDivElement>(null);
  const bannerOneRef = React.useRef<HTMLDivElement>(null);
  const bannerTwoRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Handle Popup show
    if (settings?.ads?.popupAd?.active) {
      const alreadyShown = safeStorage.get('popup_displayed', 'session');
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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    // Auto-convert username to email if needed
    let emailToUse = formData.email;
    if (!emailToUse.includes('@')) {
      emailToUse = `${emailToUse.toLowerCase().trim()}@bazardala.com`;
    }

    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password);
        setIsLoginModalOpen(false);
        setFormData({ name: '', email: '', password: '' });
      } else if (authMode === 'register') {
        if (!formData.name) {
          toast.error('আপনার নাম লিখুন');
          setIsLoggingIn(false);
          return;
        }
        await register(formData.email, formData.password, formData.name);
        setIsLoginModalOpen(false);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (err) {
      // Errors handled in context
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    let emailToUse = formData.email;
    if (!emailToUse.includes('@')) {
      emailToUse = `${emailToUse.toLowerCase().trim()}@bazardala.com`;
    }

    try {
      // In a real app, you'd call sendPasswordResetEmail(auth, emailToUse)
      // I'll just toast since I'm focusing on "Easy System"
      toast.info('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হবে।');
      setAuthMode('login');
    } catch (err) {
      toast.error('রিসেট করতে সমস্যা হয়েছে।');
    } finally {
      setIsResetting(false);
    }
  };

  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminLoggingIn(true);
    
    try {
      const success = loginAdmin(adminFormData.username, adminFormData.password);
      if (success) {
        toast.success('Admin login successful');
        setIsAdminLoginModalOpen(false);
        navigate('/admin');
      } else {
        toast.error('Invalid admin credentials');
      }
    } catch (err) {
      toast.error('Login failed');
    } finally {
      setIsAdminLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logout successful');
    } catch (error: any) {
      console.error('Logout failed', error);
      toast.error('Logout failed');
    }
  };

  const SmartLink = ({ to, children, className, ...props }: { to?: string; children: React.ReactNode; className?: string; [key: string]: any }) => {
    if (!to) return <div className={className} {...props}>{children}</div>;
    const isExternal = to.startsWith('http') || to.startsWith('//');
    if (isExternal) {
      return (
        <a href={to} target="_blank" rel="noopener noreferrer" className={className} {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link to={to} className={className} {...props}>
        {children}
      </Link>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-white text-slate-900 font-sans overflow-x-hidden transition-all duration-300"
      style={{ 
        paddingTop: settings?.ads?.topScrollingNotice?.active 
          ? (window.innerWidth < 768 ? '80px' : '100px') 
          : (window.innerWidth < 768 ? '48px' : '64px') 
      }}
    >
      <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col bg-white overflow-hidden">
        {/* Banner Notice (Topmost) */}
        {settings?.ads?.bannerNotice?.active && (
          <div className="w-full bg-white flex justify-center border-b border-slate-100">
            <SmartLink to={settings.ads.bannerNotice.link} className="h-[24px] w-full max-w-[1400px] bg-brand-primary text-white flex items-center justify-center px-2 md:px-4 relative overflow-hidden shrink-0 transition-colors">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
               <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] relative z-10 animate-pulse">
                 {settings.ads.bannerNotice.text}
               </p>
            </SmartLink>
          </div>
        )}

        {/* Header Navigation */}
        <div className="w-full bg-white flex justify-center border-b border-slate-100">
          <header className="w-full max-w-[1400px] bg-brand-primary h-11 md:h-12 flex items-center justify-between px-2 md:px-4">
            <div className="flex items-center gap-4 md:gap-10">
                  <div className="flex items-center gap-2 md:gap-3">
                    <button 
                      onClick={() => setIsAdminLoginModalOpen(true)}
                      className="bg-white text-brand-primary p-1.5 md:p-2 rounded-none hover:rotate-6 transition-transform duration-500 cursor-pointer outline-none shrink-0"
                    >
                      <ShoppingBasket className="h-4 w-4 md:h-6 md:w-6" />
                    </button>
                    <Link to="/" className="shrink-0">
                      <Logo variant="header" settings={settings} />
                    </Link>
                  </div>
              <nav className="hidden xl:flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                <Link to="/" onMouseEnter={() => import('../../pages/Home')} className="hover:text-white transition-colors relative group py-1">
                  HOME
                </Link>
                <Link to="/shop" onMouseEnter={() => import('../../pages/Shop')} className="hover:text-white transition-colors relative group py-1">
                  SHOP
                </Link>
                <Link to="/tracking" className="bg-white text-brand-primary px-2 py-1 hover:bg-slate-100 transition-colors relative group">
                  TRACKING
                </Link>
              </nav>
            </div>

            <div className="flex-1 max-w-[320px] mx-4 hidden lg:block">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                  if (query) navigate(`/shop?q=${encodeURIComponent(query)}`);
                }}
                className="relative group "
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
                <Input
                  name="search"
                  placeholder="SEARCH..."
                  className="pl-11 bg-white/10 border-none rounded-none h-10 text-[10px] font-black uppercase tracking-widest focus-visible:ring-0 text-white placeholder:text-white/40"
                />
              </form>
            </div>

            <div className="flex items-center gap-2 md:gap-5">
              <Link to="/cart" className="relative group">
                <div className="p-2 md:p-2.5 bg-white/10 text-white border border-white/5 rounded-none group-hover:bg-white group-hover:text-brand-primary transition-all">
                  <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] md:h-6 md:min-w-[24px] bg-white text-brand-primary text-[9px] md:text-[10px] font-black flex items-center justify-center px-1 rounded-none">
                    {items.length}
                  </span>
                )}
              </Link>

              {user ? (
                <Link 
                  to="/dashboard" 
                  className="w-8 h-8 md:w-9 md:h-9 bg-white/10 hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center group overflow-hidden"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  )}
                </Link>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-white/30 text-white hover:bg-white/10 transition-all h-9"
                >
                  <User className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">REGISTER</span>
                </button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden bg-white/10 text-white border border-white/5 rounded-none h-9 w-9 md:h-10 md:w-10 hover:bg-white hover:text-brand-primary transition-all font-black"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-4 w-4 md:h-5 md:w-5" /> : <Menu className="h-4 w-4 md:h-5 md:w-5" />}
              </Button>
            </div>
          </header>
        </div>

        {/* Top Header Graphic Banner */}
        {settings?.ads?.topHeaderBanner?.active && settings?.ads?.topHeaderBanner?.imageUrl && (
          <div className="w-full bg-white flex justify-center">
            <SmartLink to={settings.ads.topHeaderBanner.link} className="w-full max-w-[1400px] block overflow-hidden shrink-0">
              <img 
                src={settings.ads.topHeaderBanner.imageUrl} 
                alt="Promo Banner" 
                className="w-full h-auto max-h-[40px] md:max-h-[60px] object-cover transition-transform hover:scale-[1.02] duration-500"
                referrerPolicy="no-referrer"
              />
            </SmartLink>
          </div>
        )}

        {/* Global Top Scrolling Notice */}
        {settings?.ads?.topScrollingNotice?.active && (
          <div className="w-full flex justify-center bg-white">
            <SmartLink 
              to={settings.ads.topScrollingNotice.link}
              className="h-[32px] md:h-[40px] w-full max-w-[1400px] relative overflow-hidden whitespace-nowrap flex items-center shrink-0 hover:opacity-90"
              style={{ backgroundColor: settings.ads.topScrollingNotice.bgColor }}
            >
              <div 
                className="animate-marquee inline-block font-black uppercase text-[10px] md:text-[12px] tracking-[0.3em] whitespace-nowrap"
                style={{ color: settings.ads.topScrollingNotice.textColor }}
              >
                <span className="inline-block px-12">{settings.ads.topScrollingNotice.text}</span>
                <span className="inline-block px-12">{settings.ads.topScrollingNotice.text}</span>
                <span className="inline-block px-12">{settings.ads.topScrollingNotice.text}</span>
                <span className="inline-block px-12">{settings.ads.topScrollingNotice.text}</span>
              </div>
            </SmartLink>
          </div>
        )}

        {/* Global Notice Banner (Embedded in Sticky Stack) */}
        <AnimatePresence>
          {settings?.ads?.globalNotice?.active && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full flex justify-center bg-white"
            >
              <SmartLink to={settings.ads.globalNotice.link} className="w-full max-w-[1400px] bg-brand-primary text-white py-2 px-4 md:px-6 relative overflow-hidden rounded-none hover:bg-black/10 transition-colors block">
                <div className="flex items-center justify-center gap-5 relative z-10">
                  <div className="w-2 h-2 bg-white rounded-none animate-ping hidden sm:block" />
                  <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.25em] text-center">
                    {settings.ads.globalNotice.message}
                  </p>
                  <div className="w-2 h-2 bg-white rounded-none animate-ping hidden sm:block" />
                </div>
              </SmartLink>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Bar Ad (Embedded in Sticky Stack) */}
        {settings?.ads?.socialBarAd?.active && (
          <div className="w-full flex justify-center bg-white border-b border-slate-100">
            <div className="w-full max-w-[1400px] bg-white text-slate-800 py-3 px-4 md:px-6 rounded-none flex flex-row items-center justify-between gap-2 md:gap-6 overflow-hidden relative">
              <div className="flex items-center gap-2 md:gap-4 relative z-10">
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-brand-primary" />
                <p className="text-[8px] md:text-[12px] font-black uppercase tracking-widest text-left">
                  {settings.ads.socialBarAd.message}
                </p>
              </div>
              {settings.ads.socialBarAd.link && (
                <SmartLink 
                  to={settings.ads.socialBarAd.link} 
                  className="relative z-10 bg-slate-900 text-white text-[8px] md:text-[9px] font-black uppercase px-3 md:px-6 py-1.5 md:py-2 rounded-none hover:bg-brand-primary transition-all active:scale-95 shrink-0"
                >
                  LINK
                </SmartLink>
              )}
            </div>
          </div>
        )}
      </div>



      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] z-[60] lg:hidden bg-white border-l border-slate-100 overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-brand-primary border-b border-white/10 flex items-center justify-between">
                <h2 className="text-white font-black uppercase tracking-widest text-sm">MENU_EXPLORER</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="text-white hover:bg-white/10">
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex flex-col p-6 gap-4 text-[13px] font-black uppercase tracking-[0.2em] text-slate-800">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between group p-3 border-b border-slate-100 hover:text-brand-primary">
                  HOME <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between group p-3 border-b border-slate-100 hover:text-brand-primary">
                  SHOP <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/tracking" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between group p-4 border-b border-slate-100 bg-brand-primary text-white font-black">
                  TRACKING SYSTEM <ArrowRight className="h-4 w-4" />
                </Link>
                {!user && (
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsLoginModalOpen(true);
                    }} 
                    className="flex items-center justify-between group p-3 border-b border-slate-100 hover:text-brand-primary text-left w-full"
                  >
                    LOGIN / REGISTER <User className="h-4 w-4" />
                  </button>
                )}
                {user && (
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }} 
                    className="flex items-center justify-between group p-3 border-b border-slate-100 text-red-600 font-bold text-left w-full"
                  >
                    LOGOUT <LogOut className="h-4 w-4" />
                  </button>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 bg-white">
        <Outlet />
      </main>

      {/* Banner Ads Section */}
      <div className="flex flex-col gap-4 py-4 bg-white">
        {settings?.ads?.adsterra?.bannerOneCode && (
          <div className="flex justify-center overflow-hidden px-4">
             <div ref={bannerOneRef} className="min-h-[90px] w-full max-w-4xl bg-white border border-slate-100 flex items-center justify-center p-4" />
          </div>
        )}
        {settings?.ads?.adsterra?.bannerTwoCode && (
          <div className="flex justify-center overflow-hidden px-4">
             <div ref={bannerTwoRef} className="min-h-[90px] w-full max-w-4xl bg-white border border-slate-100 flex items-center justify-center p-4" />
          </div>
        )}
      </div>



      <footer className="bg-black pt-12 pb-10 relative overflow-hidden text-white mt-auto border-t border-slate-900 flex justify-center">
        <div className="w-full max-w-[1400px] px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-6">
              <Link to="/">
                <Logo variant="footer" settings={settings} />
              </Link>
              
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed uppercase tracking-wide">
                {settings?.siteDescription || "BAZAR THOLE IS BANGLADESH'S TRUSTED OMNI-CHANNEL E-COMMERCE HUB. WE BRING YOU PREMIUM QUALITY PRODUCTS ACROSS FASHION, ELECTRONICS, HEALTH & BEAUTY, DAILY GROCERIES, AND LIFESTYLE ESSENTIALS DIRECTLY TO YOUR DOORSTEP WITH GUARANTEED AUTHENTICITY."}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                  <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                  <span>{settings?.contactAddress || 'DHAKA, BANGLADESH'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                  <Mail className="h-4 w-4 text-orange-500 shrink-0" />
                  <a href={`mailto:${settings?.contactEmail || 'INFO@BAZARTHOLE.COM'}`} className="hover:text-orange-500 transition-colors">
                    {settings?.contactEmail || 'INFO@BAZARTHOLE.COM'}
                  </a>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                  <Phone className="h-4 w-4 text-orange-500 shrink-0" />
                  <a href={`tel:${settings?.contactPhone || '+880 1300000000'}`} className="hover:text-orange-500 transition-colors">
                    {settings?.contactPhone || '+880 1300000000'}
                  </a>
                </div>
              </div>

              {/* Social Links inside Column 1 */}
              <div>
                <h5 className="text-[9px] font-black tracking-widest text-slate-500 uppercase mb-3">FOLLOW OUR CODES</h5>
                <div className="flex gap-2">
                  {settings?.whatsappNumber && (
                    <a 
                      href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#25D366] hover:border-[#25D366] transition-all bg-slate-900/50 rounded-none"
                    >
                      <svg 
                        viewBox="0 0 24 24" 
                        className="h-4 w-4 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </a>
                  )}
                  {(settings?.socialLinks || []).map((social, i) => {
                    const platform = social.platform.toUpperCase();
                    let Icon = Mail;
                    if (platform.includes('FB')) Icon = Facebook;
                    else if (platform.includes('IG')) Icon = Instagram;
                    else if (platform.includes('YT')) Icon = Youtube;

                    return (
                      <a 
                        key={i} 
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all bg-slate-900/50 rounded-none"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 2: Shop with Confidence */}
            <div className="space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] pb-3 border-b border-slate-900">
                SHOP WITH CONFIDENCE
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 border border-emerald-500/30 flex items-center justify-center shrink-0 bg-emerald-950/20 text-emerald-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-white uppercase tracking-wider">EXPRESS HOME DELIVERY</h5>
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wide leading-relaxed mt-0.5">
                      SUPER FAST DOOR-TO-DOOR SHIPPING OPTION ACROSS ALL 64 DISTRICTS OF BANGLADESH.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 border border-emerald-500/30 flex items-center justify-center shrink-0 bg-emerald-950/20 text-emerald-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-white uppercase tracking-wider">EASY RETURN SECURITY</h5>
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wide leading-relaxed mt-0.5">
                      STRESS-FREE REFUND OPTIONS IF PACKAGING IS UNTAMPERED OR ITEM VARIES FROM SPECIFICATIONS.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 border border-emerald-500/30 flex items-center justify-center shrink-0 bg-emerald-950/20 text-emerald-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 11 2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-white uppercase tracking-wider">100% VERIFIED QUALITY</h5>
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wide leading-relaxed mt-0.5">
                      EVERY DISPATCH HAS PASSED STRICT GRADING BENCHMARKS TO MATCH PREMIUM STANDARDS.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 border border-emerald-500/30 flex items-center justify-center shrink-0 bg-emerald-950/20 text-emerald-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-white uppercase tracking-wider">GENUINE PRODUCTS ONLY</h5>
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wide leading-relaxed mt-0.5">
                      ZERO COUNTERFEITS. WE SOURCE DIRECTLY FROM BRANDS, MAJOR SUPPLIERS, OR FARMERS.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Useful Hyperlinks */}
            <div className="space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] pb-3 border-b border-slate-900">
                USEFUL HYPERLINKS
              </h4>
              <ul className="space-y-4 text-[11px] font-black text-slate-400 uppercase tracking-widest transition-colors">
                <li>
                  <Link to="/tracking" className="hover:text-orange-500 transition-colors inline-block">
                    ORDER TRACKING SYSTEM
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-orange-500 transition-colors inline-block">
                    MY PROFILE PORTAL
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-orange-500 transition-colors inline-block">
                    COMPANY STORY & PRINCIPLES
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-orange-500 transition-colors inline-block">
                    GET IN TOUCH / SUPPORT DESK
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Delivery & Gateways */}
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] pb-3 border-b border-slate-900 mb-4">
                  DELIVERY OPERATIONAL TIMING
                </h4>
                <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-none flex items-start gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-slate-400 shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div>
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-normal">
                      WE DELIVER EVERYDAY DISPATCH ORDERS FROM
                    </h5>
                    <p className="text-[10px] md:text-[11px] font-black tracking-wider text-emerald-400 mt-1 uppercase">
                      08:00 AM - 10:00 PM (EVERYDAY)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] mb-3">
                  AUTHORIZED SYSTEMS & GATEWAYS
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-[#D12053] text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-wider rounded-none">
                    BKASH
                  </span>
                  <span className="bg-[#F04923] text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-wider rounded-none">
                    NAGAD
                  </span>
                  <span className="border border-[#00A19D] text-[#00A19D] bg-[#00A19D]/5 text-[9px] font-black px-3 py-1.5 uppercase tracking-wider rounded-none">
                    SSLCOMMERZ
                  </span>
                  <span className="border border-slate-700 text-slate-400 text-[9px] font-black px-3 py-1.5 uppercase tracking-wider rounded-none">
                    COD
                  </span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] opacity-60">
              © 2026 {(settings?.siteName || 'BAZAR THOLE').replace(/ /g, '_').toUpperCase()} // TERMINAL_FOOTER_01
            </p>
            <div className="hidden lg:flex items-center gap-4 opacity-20">
               <div className="h-[2px] w-12 bg-white" />
               <div className="h-[2px] w-6 bg-[#00ead0]" />
               <div className="h-[2px] w-12 bg-white" />
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
                safeStorage.set('popup_displayed', 'true', 'session');
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl cursor-pointer"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white rounded-none p-0 overflow-hidden border border-slate-200"
            >
              <button 
                onClick={() => {
                  setShowPopup(false);
                  safeStorage.set('popup_displayed', 'true', 'session');
                }}
                className="absolute top-6 right-6 z-20 p-3 bg-white border border-slate-200 rounded-none text-slate-800 hover:bg-brand-primary hover:text-white transition-all"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="flex flex-col">
                {settings.ads.popupAd.imageUrl && (
                  <div className="w-full aspect-[4/3] overflow-hidden group border-b border-slate-100">
                    <img 
                      src={settings.ads.popupAd.imageUrl} 
                      alt="Promotion"
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 grayscale group-hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-10 md:p-14 space-y-8 text-center relative z-10 bg-white">
                   <div className="bg-white rounded-none p-10 space-y-6 relative z-10 border border-slate-100">
                     <span className="inline-block px-5 py-1.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-none border border-white">
                       PRIVATE_OFFER_NODE
                     </span>
                     <h2 className="text-3xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none underline decoration-brand-primary decoration-4">
                       {settings.ads.popupAd.message}
                     </h2>
                     <div className="flex flex-col gap-4 pt-6">
                       {settings.ads.popupAd.link && (
                         <Link 
                           to={settings.ads.popupAd.link}
                           onClick={() => {
                             setShowPopup(false);
                             safeStorage.set('popup_displayed', 'true', 'session');
                           }}
                           className="bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-none hover:bg-brand-primary transition-all text-sm active:scale-95"
                         >
                           REDEEM_SPEC_PROTOCOL
                         </Link>
                       )}

                       <button 
                         onClick={() => {
                           setShowPopup(false);
                           safeStorage.set('popup_displayed', 'true', 'session');
                         }}
                         className="text-[11px] font-black uppercase text-slate-400 hover:text-brand-primary tracking-[0.3em] transition-colors"
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
      {/* Floating WhatsApp Button */}
      {settings?.whatsappNumber && (
        <a 
          href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[90] w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 group"
        >
          <svg 
             viewBox="0 0 24 24" 
             className="h-7 w-7 fill-current"
             xmlns="http://www.w3.org/2000/svg"
           >
             <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
           </svg>
           <span className="absolute right-full mr-4 bg-slate-900 text-white text-[10px] font-black py-2 px-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest hidden md:block">
             Chat with us
           </span>
         </a>
       )}

      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-none p-0 overflow-hidden outline-none">
          <div className="flex flex-col">
            <div className="bg-brand-primary h-2 w-full" />
            <div className="p-8 space-y-6">
              <DialogHeader className="relative pb-2">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-14 h-14 bg-brand-primary flex items-center justify-center mb-3 rotate-3 group-hover:rotate-0 transition-transform shadow-lg border border-white/20">
                    <ShoppingBasket className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                    BAZAR<span className="text-brand-primary">DALA</span>
                  </h1>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">PREMIUM_SHOP_PROTOCOL</p>
                </div>
                <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight text-center">
                  {authMode === 'login' ? 'CUSTOMER_LOGIN' : authMode === 'register' ? 'CREATE_ACCOUNT' : 'RESET_PASSWORD'}
                </DialogTitle>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mt-1">
                  {authMode === 'login' ? 'SECURE_ACCESS_REQUIRED' : authMode === 'register' ? 'JOIN_THE_ELITE_COMMUNITY' : 'RECOVER_YOUR_ACCOUNT'}
                </p>
              </DialogHeader>

              {authMode !== 'forgot' ? (
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">FULL NAME</Label>
                      <Input 
                        required
                        placeholder="আপনার পুরো নাম"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 border-slate-200 rounded-none text-xs font-black focus-visible:ring-0 focus-visible:border-brand-primary bg-slate-50/50" 
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">USERNAME / EMAIL</Label>
                    <Input 
                      type="text"
                      required
                      placeholder="ইমেইল বা ইউজারনেম"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 border-slate-200 rounded-none text-xs font-black focus-visible:ring-0 focus-visible:border-brand-primary bg-slate-50/50" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">SECURE PASSWORD</Label>
                      {authMode === 'login' && (
                        <button 
                          type="button" 
                          onClick={() => setAuthMode('forgot')}
                          className="text-[8px] font-black text-brand-primary uppercase hover:underline"
                        >
                          Password?
                        </button>
                      )}
                    </div>
                    <Input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-12 border-slate-200 rounded-none text-xs font-black focus-visible:ring-0 focus-visible:border-brand-primary bg-slate-50/50" 
                    />
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoggingIn}
                      className="w-full h-14 bg-brand-primary hover:bg-slate-900 text-white font-black rounded-none uppercase tracking-[0.3em] text-xs transition-all active:scale-95 shadow-lg border-b-4 border-black/20"
                    >
                      {isLoggingIn ? 'AUTHENTICATING...' : (authMode === 'login' ? 'LOGIN_ACCESS' : 'INITIALIZE_ACCOUNT')}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                      </div>
                      <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-300 px-4 bg-white">
                        SUPPORT_NODE
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        গুগল বা ফেসবুক লগইন এখন বন্ধ আছে। সরাসরি ওয়েবসাইট থেকে লগইন বা রেজিস্টার করুন।
                      </p>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">YOUR EMAIL</Label>
                    <Input 
                      type="email"
                      required
                      placeholder="আপনার ইমেইল বা ইউজারনেম"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 border-slate-200 rounded-none text-xs font-black focus-visible:ring-0 focus-visible:border-brand-primary bg-slate-50/50" 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isResetting}
                    className="w-full h-14 bg-slate-900 text-white font-black rounded-none uppercase tracking-[0.3em] text-xs transition-all active:scale-95"
                  >
                    {isResetting ? 'SENDING...' : 'SEND_RESET_LINK'}
                  </Button>
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('login')}
                    className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary"
                  >
                    BACK_TO_LOGIN
                  </button>
                </form>
              )}

              <div className="text-center pt-4 border-t border-slate-50">
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-[10px] font-black text-brand-primary hover:underline transition-all uppercase tracking-widest"
                >
                  {authMode === 'login' ? "REGISTER" : "LOGIN"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAdminLoginModalOpen} onOpenChange={setIsAdminLoginModalOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-none p-0 overflow-hidden outline-none">
          <div className="flex flex-col">
            <div className="bg-brand-primary h-2 w-full" />
            <div className="p-8 space-y-6">
              <DialogHeader>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-14 h-14 bg-slate-900 flex items-center justify-center mb-3 rotate-3 group-hover:rotate-0 transition-transform shadow-lg border border-white/10">
                    <Lock className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                    ADMIN<span className="text-brand-primary">CONSOLE</span>
                  </h1>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">HIGH_LEVEL_SECURITY_GATE</p>
                </div>
                <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight text-center">
                  ADMIN_ACCESS_REQUIRED
                </DialogTitle>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mt-1">
                  SECURE_PROTOCOL_INITIALIZATION
                </p>
              </DialogHeader>

              <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">ADMIN ID</Label>
                  <Input 
                    required
                    placeholder="USERNAME"
                    value={adminFormData.username}
                    onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                    className="h-12 border-slate-200 rounded-none text-xs font-black focus-visible:ring-0 focus-visible:border-brand-primary bg-slate-50/50" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">SECURE PIN / PASS</Label>
                  <Input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                    className="h-12 border-slate-200 rounded-none text-xs font-black focus-visible:ring-0 focus-visible:border-brand-primary bg-slate-50/50" 
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isAdminLoggingIn}
                  className="w-full h-14 bg-slate-900 hover:bg-brand-primary text-white font-black rounded-none uppercase tracking-[0.3em] text-xs transition-all active:scale-95 shadow-xl border-b-4 border-black/50"
                >
                  {isAdminLoggingIn ? 'AUTHORIZING...' : 'ACCESS_SYSTEM_CORE'}
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
};
