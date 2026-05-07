import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Heart, Menu, X, LogOut, ShoppingBasket, Zap, ArrowRight, Facebook, Instagram, MessageSquare, Youtube, Mail, MapPin, Phone, Lock, AlertCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
import { auth, googleProvider, db } from '../../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { Badge } from '../ui/badge';
import { SiteSettings } from '../../types';
import { useSettings } from '../../context/SettingsContext';

export const UserLayout: React.FC = () => {
  const { user, profile, isAdmin, loginAdmin, loginWithGoogle } = useAuth();
  const { items } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showPopup, setShowPopup] = React.useState(false);
  
  // Admin Login Dialog State
  const [isAdminLoginOpen, setIsAdminLoginOpen] = React.useState(false);
  const [adminUser, setAdminUser] = React.useState('');
  const [adminPass, setAdminPass] = React.useState('');
  const [adminView, setAdminView] = React.useState<'login' | 'forgot'>('login');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

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

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    if (loginAdmin(adminUser, adminPass)) {
      toast.success('অ্যাডমিন হিসেবে সফলভাবে লগইন করেছেন');
      setIsAdminLoginOpen(false);
      navigate('/admin');
    } else {
      toast.error('ভুল ইউজারনেম বা পাসওয়ার্ড');
    }
    setIsLoggingIn(false);
  };

  const handleAdminGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Google এর মাধ্যমে সফলভাবে লগইন করেছেন');
      setIsAdminLoginOpen(false);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      toast.error('Google লগইন ব্যর্থ হয়েছে');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-white text-slate-900 font-sans overflow-x-hidden transition-all duration-300"
      style={{ 
        paddingTop: settings?.ads?.topScrollingNotice?.active 
          ? (window.innerWidth < 768 ? '96px' : '120px') 
          : (window.innerWidth < 768 ? '64px' : '84px') 
      }}
    >
      {/* Top Stack (Fixed) */}
      <div className="fixed top-0 left-0 right-0 z-[100] w-full flex flex-col bg-white shadow-sm">
        {/* Banner Notice (Topmost) */}
        {settings?.ads?.bannerNotice?.active && (
          <div className="h-[24px] w-full bg-brand-primary text-white flex items-center justify-center px-4 md:px-10 relative overflow-hidden shrink-0 border-b border-white/10">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] relative z-10 animate-pulse">
               {settings.ads.bannerNotice.text}
             </p>
          </div>
        )}

        {/* Header Navigation */}
        <header className="w-full border-b-2 border-slate-900 bg-white transition-all shadow-md shrink-0">
          <div className="w-full max-w-[1536px] mx-auto px-4 md:px-16 lg:px-24 h-12 md:h-16 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
                <div 
                  onClick={() => setIsAdminLoginOpen(true)}
                  className="bg-brand-primary text-white p-1.5 md:p-2.5 rounded-none shadow-lg border-2 border-slate-900 group-hover:rotate-6 transition-transform duration-500"
                >
                  <ShoppingBasket className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <Link to="/" className="text-xs sm:text-base md:text-2xl font-black tracking-tighter text-brand-primary uppercase flex items-center gap-1.5 md:gap-3 shrink-0">
                  <div className="whitespace-nowrap underline underline-offset-4 decoration-slate-900 font-black">
                    <span>{(settings?.siteName || 'BAZAR DALA').split(' ')[0]}</span>
                    <span className="text-slate-800 group-hover:text-brand-primary transition-colors">
                      {' '}<span>{(settings?.siteName || 'BAZAR DALA').split(' ').slice(1).join(' ')}</span>
                    </span>
                  </div>
                </Link>
              </div>
              <nav className="hidden xl:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Link to="/" onMouseEnter={() => import('../../pages/Home')} className="hover:text-brand-primary transition-colors relative group py-2">
                  HOME
                </Link>
                <Link to="/shop" onMouseEnter={() => import('../../pages/Shop')} className="hover:text-brand-primary transition-colors relative group py-2">
                  SHOP
                </Link>
                <Link to="/tracking" className="hover:text-brand-primary transition-colors relative group py-2">
                  TRACKING
                </Link>
              </nav>
            </div>

            <div className="flex-1 max-w-lg mx-12 hidden lg:block">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                <Input
                  placeholder="LOOKING_FOR_SOMETHING?"
                  className="pl-14 bg-white border-2 border-slate-900 rounded-none h-12 text-[12px] font-black uppercase tracking-widest focus-visible:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-5">
              <Link to="/cart" className="relative group">
                <div className="p-2 md:p-3 bg-white border-2 border-slate-900 rounded-none group-hover:bg-brand-primary/10 transition-all text-slate-900 group-hover:text-brand-primary shadow-sm">
                  <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] md:h-6 md:min-w-[24px] bg-brand-primary text-white text-[9px] md:text-[10px] font-black flex items-center justify-center px-1 md:px-1.5 rounded-none border-2 border-slate-900 shadow-md">
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
                    <DropdownMenuGroup className="space-y-1">
                      <DropdownMenuLabel className="p-5 border-b-2 border-slate-900 mb-2">
                        <div className="flex flex-col">
                          <p className="text-[12px] font-black uppercase tracking-widest text-slate-800">{user.displayName}</p>
                          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase opacity-60">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-[11px] font-black uppercase p-4 rounded-none border-2 border-transparent focus:border-slate-900 focus:bg-[#f8f8f8] cursor-pointer">
                        <User className="mr-4 h-5 w-5 text-brand-primary" />
                        <span>MY_DASHBOARD</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-900 h-[2px] my-2" />
                      <DropdownMenuItem onClick={handleLogout} className="text-[11px] font-black uppercase p-4 rounded-none border-2 border-transparent focus:border-slate-900 focus:bg-red-600 focus:text-white cursor-pointer">
                        <LogOut className="mr-4 h-5 w-5" />
                        <span>END_SESSION</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleLogin} className="bg-slate-900 hover:bg-brand-primary text-white rounded-none h-10 md:h-12 px-3 md:px-8 text-[11px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all border-2 border-slate-900">
                  <span className="hidden sm:inline">AUTH_LOGIN</span>
                  <User className="sm:hidden h-5 w-5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden bg-white border-2 border-slate-900 rounded-none h-10 w-10 md:h-12 md:w-12 hover:bg-slate-900 hover:text-white transition-all text-brand-primary"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <Menu className="h-5 w-5 md:h-6 md:w-6" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Global Top Scrolling Notice */}
        {settings?.ads?.topScrollingNotice?.active && (
          <div 
            className="h-[32px] md:h-[40px] w-full relative overflow-hidden whitespace-nowrap flex items-center border-b border-slate-900/10 shrink-0"
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
          </div>
        )}

        {/* Global Notice Banner (Embedded in Sticky Stack) */}
        <AnimatePresence>
          {settings?.ads?.globalNotice?.active && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full flex justify-center bg-[#f3f4f6]"
            >
              <div className="w-full bg-brand-primary shadow-lg text-white py-2 px-8 relative overflow-hidden rounded-none border-b-2 border-slate-900">
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
          <div className="w-full flex justify-center bg-[#f3f4f6]">
            <div className="w-full bg-white shadow-lg text-slate-800 py-3 px-4 md:px-10 border-b-2 border-slate-900 rounded-none flex flex-row items-center justify-between gap-2 md:gap-6 overflow-hidden relative">
              <div className="flex items-center gap-2 md:gap-4 relative z-10">
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-brand-primary" />
                <p className="text-[8px] md:text-[12px] font-black uppercase tracking-widest text-left">
                  {settings.ads.socialBarAd.message}
                </p>
              </div>
              {settings.ads.socialBarAd.link && (
                <Link 
                  to={settings.ads.socialBarAd.link} 
                  className="relative z-10 bg-slate-900 text-white text-[8px] md:text-[9px] font-black uppercase px-3 md:px-6 py-1.5 md:py-2 rounded-none hover:bg-brand-primary transition-all shadow-md active:scale-95 border-2 border-slate-900 shrink-0"
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
              className="fixed right-0 top-0 bottom-0 w-[280px] z-[60] lg:hidden bg-white shadow-2xl border-l-2 border-slate-900 overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-brand-primary border-b-2 border-slate-900 flex items-center justify-between">
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
                <Link to="/tracking" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between group p-3 border-b border-slate-100 hover:text-brand-primary">
                  TRACKING <ArrowRight className="h-4 w-4" />
                </Link>
              </nav>
            </motion.div>
          </>
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

      {/* Admin Login Dialog */}
      <Dialog open={isAdminLoginOpen} onOpenChange={setIsAdminLoginOpen}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none w-full max-w-md [&>button]:text-white">
          <div className="bg-[#ead9c4] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden font-sans">
            <div className="bg-brand-primary p-4 text-white flex items-center justify-between border-b-2 border-slate-900">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <ShoppingBasket className="h-4 w-4" /> সিকিউর লগইন
              </h2>
            </div>

            <div className="p-8 bg-white/40">
              {adminView === 'login' ? (
                <>
                  <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-none bg-[#ead9c4] border-2 border-slate-900 flex items-center justify-center text-brand-primary shadow-[4px_4px_0px_0px_rgba(0,188,188,1)]">
                      <Lock className="h-8 w-8" />
                    </div>
                  </div>
                  
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">ইউজারনেম</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary" />
                        <Input
                          type="text"
                          value={adminUser}
                          onChange={(e) => setAdminUser(e.target.value)}
                          className="pl-12 bg-white border-2 border-slate-900 text-slate-900 rounded-none h-14 font-black text-xs focus-visible:ring-0 focus-visible:border-brand-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                          placeholder="ADMIN_ID"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">পাসওয়ার্ড</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary" />
                        <Input
                          type="password"
                          value={adminPass}
                          onChange={(e) => setAdminPass(e.target.value)}
                          className="pl-12 bg-white border-2 border-slate-900 text-slate-900 rounded-none h-14 font-black text-xs focus-visible:ring-0 focus-visible:border-brand-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoggingIn}
                      className="w-full h-14 bg-slate-900 hover:bg-brand-primary text-white font-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,188,188,1)] uppercase tracking-[0.3em] text-xs transition-all active:translate-y-1 active:shadow-none"
                    >
                      {isLoggingIn ? 'প্রসেসিং...' : 'লগইন করুন'}
                    </Button>
                  </form>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-slate-900/10"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                      <span className="bg-[#ead9c4]/20 px-4 text-slate-400">OR RECOVER VIA</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAdminGoogleLogin}
                    variant="outline"
                    className="w-full h-14 border-2 border-slate-900 bg-white text-slate-900 font-black rounded-none uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:bg-slate-50"
                  >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale" alt="Google" />
                    GOOGLE ADMIN RECOVERY
                  </Button>

                  <div className="mt-8 text-center pt-4 border-t border-slate-900/10">
                    <button 
                      onClick={() => setAdminView('forgot')}
                      className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline flex items-center justify-center gap-2 mx-auto"
                    >
                      <AlertCircle className="h-3 w-3" /> পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-8 py-4 px-2 text-center">
                  <div className="w-16 h-16 rounded-none bg-red-50 border-2 border-red-200 flex items-center justify-center text-red-500 mx-auto mb-4">
                    <Lock className="h-8 w-8" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900">অ্যাডমিন রিকভারি প্রোটোকল</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                    আপনার রেজিস্টার্ড <span className="text-brand-primary">Google Account</span> দিয়ে সরাসরি লগইন করতে পারেন।
                  </p>

                  <Button 
                    onClick={handleAdminGoogleLogin}
                    className="w-full h-14 bg-brand-primary hover:bg-slate-900 text-white font-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3"
                  >
                    <Mail className="h-4 w-4" /> গুগল দিয়ে লগইন
                  </Button>

                  <button 
                    onClick={() => setAdminView('login')}
                    className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" /> ব্যাক টু লগইন
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="bg-black pt-10 pb-8 relative overflow-hidden text-white mt-auto border-t border-slate-900">
        <div className="w-full max-w-[1536px] mx-auto px-6 md:px-16 lg:px-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-brand-primary flex items-center justify-center text-black font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                  {(settings?.siteName || 'SS').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight leading-none uppercase">{settings?.siteName || 'SS SMART HAAT'}</h3>
                  <p className="text-[9px] font-black tracking-[0.2em] text-brand-primary mt-1 uppercase">PREMIUM MARKET PLACE</p>
                </div>
              </Link>
              
              <div className="space-y-5">
                <p className="text-slate-400 text-[11px] font-medium leading-relaxed uppercase tracking-wide">
                  {settings?.siteDescription || 'YOUR CURATED DESTINATION FOR SMART FASHION AND MODERN MARKETPLACE ESSENTIALS.'}
                </p>
                {settings?.siteDescriptionBangla && (
                  <div className="border-l-2 border-brand-primary pl-4">
                    <p className="text-slate-200 text-[13px] leading-relaxed font-medium">
                      {settings.siteDescriptionBangla}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {(settings?.socialLinks || []).map((social, i) => {
                   const platform = social.platform.toUpperCase();
                   let Icon = Mail;
                   if (platform.includes('FB')) Icon = Facebook;
                   else if (platform.includes('IG')) Icon = Instagram;
                   else if (platform.includes('WA')) Icon = MessageSquare;
                   else if (platform.includes('YT')) Icon = Youtube;

                   return (
                    <a 
                      key={i} 
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-all bg-slate-900/50 rounded-sm"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                   );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-brand-primary font-black mb-8 uppercase tracking-[0.2em] text-[12px]">
                SHOPPING_UNIT
              </h4>
              <ul className="space-y-4 text-[13px] font-black text-white uppercase tracking-widest">
                {(settings?.footerSupportLinks || [
                  { label: 'CLOTHING', url: '/shop' },
                  { label: 'FOOTWEAR', url: '/shop' },
                  { label: 'ACCESSORIES', url: '/shop' }
                ]).map((link, i) => (
                  <li key={i}>
                    <Link to={link.url} className="hover:text-brand-primary transition-colors inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-brand-primary font-black mb-8 uppercase tracking-[0.2em] text-[12px]">
                GET_IN_TOUCH
              </h4>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-5 w-5 text-brand-primary shrink-0" />
                  <div>
                    <span className="block text-[9px] font-black text-brand-primary tracking-widest mb-1 uppercase opacity-60">ELECTRONIC_MAIL</span>
                    <span className="text-[13px] font-black break-all">{settings?.contactEmail || 'INFO.SMARTHAAT38@GMAIL.COM'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-brand-primary shrink-0" />
                  <div>
                    <span className="block text-[9px] font-black text-brand-primary tracking-widest mb-1 uppercase opacity-60">LOCATION_BASE</span>
                    <span className="text-[13px] font-black uppercase">{settings?.contactAddress || 'DHAKA, BANGLADESH'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-brand-primary font-black mb-8 uppercase tracking-[0.2em] text-[12px]">
                EMERGENCY_LINK
              </h4>
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-brand-primary" />
                <div>
                  <span className="block text-[9px] font-black text-brand-primary tracking-widest mb-1 uppercase opacity-60">VOICE_SUPPORT</span>
                  <span className="text-[16px] font-black tracking-tighter text-white">
                    {settings?.contactPhone || '+880 1XXX XXXXXX'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] opacity-60">
              © 2026 {(settings?.siteName || 'SS_SMART_HAAT').replace(/ /g, '_').toUpperCase()} // TERMINAL_FOOTER_01
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
                className="absolute top-6 right-6 z-20 p-3 bg-white border-2 border-slate-900 rounded-none text-slate-800 hover:bg-brand-primary hover:text-white transition-all shadow-lg"
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
                     <span className="inline-block px-5 py-1.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-none shadow-md border border-white italic">
                       PRIVATE_OFFER_NODE
                     </span>
                     <h2 className="text-3xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none italic underline decoration-brand-primary decoration-4">
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
                           className="bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-none hover:bg-brand-primary transition-all text-sm shadow-xl active:scale-95 border-2 border-slate-900"
                         >
                           REDEEM_SPEC_PROTOCOL
                         </Link>
                       )}
                       <button 
                         onClick={() => {
                           setShowPopup(false);
                           sessionStorage.setItem('popup_displayed', 'true');
                         }}
                         className="text-[11px] font-black uppercase text-slate-400 hover:text-brand-primary tracking-[0.3em] transition-colors italic"
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
