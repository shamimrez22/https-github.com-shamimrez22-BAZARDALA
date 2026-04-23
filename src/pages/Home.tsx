import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Zap, 
  Truck, 
  ChevronLeft, 
  ChevronRight,
  Smartphone,
  Watch,
  Laptop,
  Shirt,
  Home as HomeIcon,
  Gamepad2,
  Baby,
  HeartPulse,
  Car,
  MoreHorizontal,
  List,
  PlusCircle,
  Bell
} from 'lucide-react';

import { collection, getDocs, getDoc, query, orderBy, limit, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { SiteSettings } from '../types';

const defaultBanners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000',
    title: 'Mega Sale 2026',
    subtitle: 'Up to 70% Off on Electronics',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000',
    title: 'Fashion Week',
    subtitle: 'New Summer Collection is Here',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=2000',
    title: 'Smart Home',
    subtitle: 'Modern Living Essentials',
    color: 'from-emerald-500 to-teal-600'
  }
];

const categories = [
  { name: 'Electronic Devices', icon: Smartphone },
  { name: 'Electronic Accessories', icon: Watch },
  { name: 'TV & Home Appliances', icon: Laptop },
  { name: 'Health & Beauty', icon: HeartPulse },
  { name: 'Babies & Toys', icon: Baby },
  { name: 'Groceries & Pets', icon: HomeIcon },
  { name: 'Home & Lifestyle', icon: Shirt },
  { name: 'Women\'s Fashion', icon: Shirt },
  { name: 'Men\'s Fashion', icon: Shirt },
  { name: 'Watches & Accessories', icon: Watch },
  { name: 'Automotive & Motorbike', icon: Car },
  { name: 'More Categories', icon: MoreHorizontal },
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [variantIndex, setVariantIndex] = React.useState(0);
  const [banners, setBanners] = React.useState(defaultBanners);
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);
  const [limitedOffersConfig, setLimitedOffersConfig] = React.useState({ limit: 6, productIds: [] as string[] });
  const { products, loading: loadingProducts } = useProducts();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState({ hrs: '00', mins: '00', secs: '00' });
  const [hasClicked, setHasClicked] = useState(false);
  const [showSocialBar, setShowSocialBar] = useState(false);

  // Handle "Popunder" link on first interaction
  const handleGlobalClick = () => {
    if (!hasClicked && settings?.ads?.adsterra?.popunderCode) {
       window.open(settings.ads.adsterra.popunderCode, '_blank');
       setHasClicked(true);
    }
  };

  useEffect(() => {
    // Show social bar after delay
    const timer = setTimeout(() => setShowSocialBar(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!settings?.countdown?.enabled || !settings?.countdown?.targetDate) {
      return;
    }

    const timer = setInterval(() => {
      const target = new Date(settings.countdown!.targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hrs: '00', mins: '00', secs: '00' });
        clearInterval(timer);
        return;
      }

      const hrs = Math.floor((difference / (1000 * 60 * 60))).toString().padStart(2, '0');
      const mins = Math.floor((difference / (1000 * 60)) % 60).toString().padStart(2, '0');
      const secs = Math.floor((difference / 1000) % 60).toString().padStart(2, '0');

      setTimeLeft({ hrs, mins, secs });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings?.countdown?.enabled, settings?.countdown?.targetDate]);

  // Slice first 6 products for the flash sale if no manual selection exists
  const featuredProducts = React.useMemo(() => {
    if (!limitedOffersConfig.productIds || limitedOffersConfig.productIds.length === 0) {
      return products.slice(0, limitedOffersConfig.limit || 6);
    }
    
    // Get manually selected products in order, then limit
    const selected = limitedOffersConfig.productIds
      .map(id => products.find(p => p.id === id))
      .filter(p => p !== undefined) as any[];
      
    return selected.slice(0, limitedOffersConfig.limit || 6);
  }, [products, limitedOffersConfig]);

  React.useEffect(() => {
    const fetchBanners = async () => {
      try {
        const q = query(collection(db, 'slider_banners'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const fetchedBanners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBanners(fetchedBanners as any);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };
    
    fetchBanners();
  }, []);

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SiteSettings);
      }
    }, (error) => {
      console.error('Home settings sync error:', error);
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    const fetchLimitedConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'settings', 'limited_offers'));
        if (configDoc.exists()) {
          setLimitedOffersConfig(configDoc.data() as any);
        }
      } catch (error) {
        console.error('Error fetching limited config:', error);
      }
    };
    fetchLimitedConfig();
  }, []);

  React.useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
      setVariantIndex(Math.floor(Math.random() * 10));
    }, 4000); // Faster cycle
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setVariantIndex(Math.floor(Math.random() * 10));
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setVariantIndex(Math.floor(Math.random() * 10));
  };

  // Optimized variants for performance (static fade on mobile)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const variants = isMobile ? [
    { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
  ] : [
    { initial: { x: '100%', opacity: 0 }, animate: { x: 0, opacity: 1, scale: 1 }, exit: { x: '-100%', opacity: 0 } }, 
    { initial: { y: '100%', opacity: 0 }, animate: { y: 0, opacity: 1, scale: 1 }, exit: { y: '-100%', opacity: 0 } }, 
    { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 1.2, opacity: 0 } },
    { initial: { filter: 'blur(20px)', opacity: 0 }, animate: { filter: 'blur(0px)', opacity: 1 }, exit: { filter: 'blur(20px)', opacity: 0 } }
  ];

  const variantIndexToUse = isMobile ? 0 : variantIndex % variants.length;
  const currentVariant = variants[variantIndexToUse];

  return (
    <div className="flex flex-col bg-brand-bg text-slate-900 pb-20 overflow-x-hidden relative" onClick={handleGlobalClick}>
      {/* Social Bar Adsterra Floating Pop */}
      <AnimatePresence>
        {showSocialBar && settings?.ads?.adsterra?.socialBarCode && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 right-10 z-[100] w-72"
          >
            <div className="bg-white border-2 border-brand-primary shadow-[6px_6px_0px_#9B2B2C] p-4 relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSocialBar(false); }}
                className="absolute -top-3 -right-3 w-6 h-6 bg-brand-primary text-white text-[10px] rounded-full flex items-center justify-center font-black"
              >
                X
              </button>
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 bg-brand-primary flex-shrink-0 flex items-center justify-center animate-pulse">
                   <Bell className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                   <p className="text-[9px] font-black uppercase text-brand-primary tracking-widest">New Notification</p>
                   <p className="text-[11px] font-black text-slate-800 uppercase leading-tight">Claim Your Premium Discount Now!</p>
                </div>
              </div>
              <a 
                href={settings.ads.adsterra.socialBarCode} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-3 block w-full bg-slate-900 text-white text-center py-2 text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all"
              >
                Accept Offer
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* System Hero Section */}
      <section className="pt-2 pb-4">
        <div className="container mx-auto">
          <div className="flex flex-row gap-5 items-start">
            {/* Category Sidebar/Offer - PERMANENT DESKTOP VIEW */}
            <div className="w-80 bg-brand-secondary border border-[#777] shadow-sm flex flex-col h-[480px] flex-shrink-0 overflow-hidden">
                {settings?.sidebar?.showCategories ? (
                  <>
                    <div className="bg-brand-primary p-3 border-b border-[#777] flex-shrink-0">
                      <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <List className="h-4 w-4" /> All Categories
                      </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto py-1 bg-white/30 scrollbar-thin scrollbar-thumb-brand-primary/20">
                      <div className="grid grid-cols-2 lg:grid-cols-1">
                        {categories.map((cat, i) => (
                          <Link 
                            key={i} 
                            to={`/shop?cat=${cat.name.toLowerCase()}`}
                            className="flex items-center justify-between px-4 py-2 hover:bg-brand-secondary transition-all group border-b border-[#777]/10"
                          >
                            <div className="flex items-center gap-3">
                              <cat.icon className="h-3.5 w-3.5 text-brand-primary" />
                              <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">{cat.name}</span>
                            </div>
                            <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-brand-primary" />
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-brand-secondary border-t border-[#777] flex-shrink-0">
                       <Link to="/shop" className="block w-full py-1.5 border border-brand-primary text-brand-primary text-[9px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all text-center">
                         Show More
                       </Link>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden group">
                    <div className="bg-brand-primary p-3 border-b border-[#777] flex-shrink-0">
                      <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap className="h-4 w-4" /> {settings?.sidebar?.offerTitle || 'EXCLUSIVE_OFFER'}
                      </h2>
                    </div>
                    <Link to={settings?.sidebar?.offerLink || '/shop'} className="flex-1 relative overflow-hidden group flex flex-col">
                      <div className="flex-1 min-h-0 relative">
                        <img 
                          src={settings?.sidebar?.offerImageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt="Sidebar Offer"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-brand-primary/20 group-hover:bg-transparent transition-all duration-300" />
                      </div>
                      <div className="bg-white/95 p-4 border-t-2 border-brand-primary shadow-xl">
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">Flash Deal // v1.0</p>
                        <h4 className="text-[12px] font-black text-slate-900 uppercase leading-tight tracking-tight">
                          {settings?.sidebar?.offerTitle || 'Claim Your Premium Offer Now'}
                        </h4>
                      </div>
                    </Link>
                  </div>
                )}
            </div>

            {/* Main Image Slider */}
            <div className={`flex-1 relative bg-white border border-[#777] shadow-lg overflow-hidden group h-[480px]`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={currentVariant.initial}
                  animate={currentVariant.animate}
                  exit={currentVariant.exit}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  {banners[currentSlide] && (
                    <>
                      <img
                        src={banners[currentSlide].image || 'https://picsum.photos/seed/slide/1920/1080'}
                        alt={banners[currentSlide].title || 'Slide Image'}
                        className="w-full h-full object-cover grayscale opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                        <motion.div
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-white text-brand-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] border border-brand-primary">New Arrival</span>
                            <div className="h-[1px] w-20 bg-white/30" />
                          </div>
                          <h2 className="text-3xl md:text-6xl font-black text-white mb-4 leading-none uppercase tracking-tighter">
                            {banners[currentSlide].title || 'PREMIUM_MANIFEST'}
                          </h2>
                          <p className="text-white/80 text-[11px] md:text-sm font-bold uppercase tracking-widest max-w-xl mb-8 border-l-2 border-white/50 pl-4">
                            {banners[currentSlide].subtitle || 'SECURED_PRODUCT_LINE // v3.0'}
                          </p>
                          <div className="flex items-center gap-4">
                            <Link to="/shop">
                              <Button className="bg-white hover:bg-brand-secondary text-brand-primary h-12 px-10 rounded-none font-black uppercase text-[11px] tracking-[0.2em] shadow-xl">
                                Shop Now
                              </Button>
                            </Link>
                            <div className="hidden md:flex flex-col text-[8px] font-black text-white/50 uppercase tracking-[0.3em]">
                              <span>Product ID // {currentSlide + 1024}</span>
                              <span>Verified Store</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Slider Meta Controls */}
              <div className="absolute top-6 right-6 flex items-center gap-4">
                 <div className="flex gap-2">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-12 h-1 dark:bg-white/20 transition-all ${
                          currentSlide === i ? 'bg-white h-1.5' : 'bg-white/30 hover:bg-white/60'
                        }`}
                      />
                    ))}
                 </div>
              </div>
              
              <button 
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-brand-primary border border-white/30 transition-all flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-brand-primary border border-white/30 transition-all flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Banner Ad - Adsterra */}
      {settings?.ads?.adsterra?.bannerOneCode && (
        <section className="py-2">
          <div className="container mx-auto px-4">
            <a 
              href={settings.ads.adsterra.bannerOneCode} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group relative overflow-hidden"
            >
              <div className="bg-[#1a1a1a] border-2 border-brand-primary h-24 md:h-32 flex items-center justify-center relative shadow-[8px_8px_0px_#9B2B2C] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #9B2B2C, #9B2B2C 10px, transparent 10px, transparent 20px)' }} />
                <div className="relative z-10 text-center">
                  <span className="inline-block px-3 py-1 bg-brand-primary text-white text-[8px] font-black uppercase tracking-[0.3em] mb-2">Exclusive Offer</span>
                  <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter italic">CLICK HERE TO UNLOCK PREMIUM DEALS</h3>
                  <p className="text-white/40 text-[7px] font-bold uppercase tracking-[0.4em] mt-1">Managed Dispatch // Protocol_77 // Authorized Access</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
                   <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center animate-bounce">
                      <Zap className="h-6 w-6 text-brand-primary fill-brand-primary" />
                   </div>
                </div>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* Dynamic Floating Notice Bar */}
      {settings?.ads?.floatingNotice?.active && settings?.ads?.floatingNotice?.text && (
        <section className="py-0.5 md:py-1">
          <div 
            className="relative overflow-hidden whitespace-nowrap h-8 md:h-10 flex items-center border-y border-[#777]/10"
            style={{ backgroundColor: settings.ads.floatingNotice.bgColor }}
          >
            <div 
              className="animate-marquee inline-block font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-widest whitespace-nowrap"
              style={{ color: settings.ads.floatingNotice.textColor }}
            >
              <span className="inline-block px-4">{settings.ads.floatingNotice.text}</span>
              <span className="inline-block px-4">{settings.ads.floatingNotice.text}</span>
              <span className="inline-block px-4">{settings.ads.floatingNotice.text}</span>
              <span className="inline-block px-4">{settings.ads.floatingNotice.text}</span>
              <span className="inline-block px-4">{settings.ads.floatingNotice.text}</span>
              <span className="inline-block px-4">{settings.ads.floatingNotice.text}</span>
              <span className="inline-block px-4">{settings.ads.floatingNotice.text}</span>
              <span className="inline-block px-4">{settings.ads.floatingNotice.text}</span>
            </div>
          </div>
        </section>
      )}

      {/* Trust & Features Section / Dynamic Ad */}
      <section className="py-1">
        <div className="container mx-auto px-4">
          {settings?.ads?.featuresAd?.active ? (
            <a 
              href={settings.ads.featuresAd.link || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-brand-primary border-2 border-[#777] shadow-[6px_6px_0px_#000] p-6 relative overflow-hidden flex items-center justify-center min-h-[100px] transition-all hover:bg-slate-900 active:translate-x-1 active:translate-y-1 active:shadow-none">
                <div className="absolute top-0 right-0 p-1 bg-white/10 text-white/20 text-[6px] font-black uppercase tracking-[0.5em] h-full flex items-center gap-10 [writing-mode:vertical-rl]">
                   DISPATCH_AD_ACTIVE // PROTOCOL_77 // DISPATCH_AD_ACTIVE // PROTOCOL_77
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-12 h-12 border border-white/30 flex items-center justify-center bg-white/10">
                    <Zap className="h-6 w-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                      {settings.ads.featuresAd.message}
                    </h3>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Click to explore custom offer // Limited Time</p>
                  </div>
                </div>
              </div>
            </a>
          ) : (
            <div className="bg-brand-secondary border border-[#777] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#777]/30">
              {[
                { icon: Truck, title: 'Free Delivery', desc: 'Doorstep shipping', extra: 'SEAL_VERIFIED' },
                { icon: ShieldCheck, title: 'Original Products', desc: '100% Genuine Items', extra: 'SECURED' },
                { icon: Zap, title: 'Flash Sale', desc: 'Limited time offers', extra: 'ACTIVE_NOW' },
                { icon: Star, title: 'Special Discounts', desc: 'Great savings for you', extra: 'VERIFIED' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 hover:bg-white/20 transition-all cursor-pointer group">
                  <div className="w-10 h-10 border border-brand-primary bg-white flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-tight text-slate-900">{item.title}</h3>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.1em]">{item.desc}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <div className="w-1 h-1 bg-brand-primary rounded-full animate-pulse" />
                      <span className="text-[7px] font-black text-brand-primary/60 uppercase">{item.extra}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Adsterra Slot 3 - Below Features */}
      {settings?.ads?.adsterra?.bannerThreeCode && (
        <section className="py-4">
          <div className="container mx-auto px-4">
             <a href={settings.ads.adsterra.bannerThreeCode} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden group">
               <div className="bg-[#ead9c4] border-2 border-brand-primary p-6 text-center shadow-lg hover:bg-white transition-all">
                  <span className="text-[10px] font-black uppercase text-brand-primary tracking-[0.4em] mb-2 block">Premium Channel Active</span>
                  <h4 className="text-2xl font-black text-slate-900 uppercase">ACCESS EXCLUSIVE DISCOUNTS</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-2">Verified Dispatch // Global Port_32</p>
               </div>
             </a>
          </div>
        </section>
      )}

      {/* Curated Grid Selection */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 border-b-2 border-brand-primary pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Categories</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Browse our top collections</p>
            </div>
            <Link to="/shop" className="group flex items-center gap-2 bg-brand-primary text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all">
              Shop All <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Smartphones', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400' },
              { name: 'Laptops', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=400' },
              { name: 'Watches', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' },
              { name: 'Fashion', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=400' },
              { name: 'Home Appliances', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400' },
              { name: 'Gaming', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400' },
            ].map((cat, i) => (
              <Link 
                key={i} 
                to={`/shop?cat=${cat.name.toLowerCase()}`}
                className="bg-brand-card border border-[#777] p-2 hover:bg-brand-secondary transition-all group relative"
              >
                <div className="aspect-square border border-[#777]/30 overflow-hidden mb-3 grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-tight text-slate-800">{cat.name}</h3>
                  <div className="w-4 h-[1px] bg-brand-primary/30" />
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="p-1 bg-brand-primary text-white">
                      <PlusCircle className="h-3 w-3" />
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Adsterra Slot 4 - Below Categories */}
      {settings?.ads?.adsterra?.bannerFourCode && (
        <section className="py-4">
          <div className="container mx-auto px-4">
             <a href={settings.ads.adsterra.bannerFourCode} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-slate-900 border-2 border-slate-700 h-28 flex items-center justify-center p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Zap className="h-20 w-20 text-white" />
                   </div>
                   <div className="text-center">
                      <h5 className="text-white text-xl font-black uppercase italic tracking-tighter">CLICK TO GET SURPRISE GIFT!</h5>
                      <span className="text-brand-primary text-[8px] font-bold uppercase tracking-[0.5em] mt-2 block animate-pulse">Limited Period Opportunity_77</span>
                   </div>
                </div>
             </a>
          </div>
        </section>
      )}

      {/* Middle Banner Ad - Adsterra */}
      {settings?.ads?.adsterra?.bannerTwoCode && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <a 
              href={settings.ads.adsterra.bannerTwoCode} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block relative"
            >
               <div className="bg-brand-secondary border-4 border-dashed border-[#777] p-8 text-center hover:border-brand-primary transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary/20" />
                  <div className="relative z-10">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-4">Recommended For You</h4>
                    <div className="inline-flex items-center gap-4 bg-brand-primary text-white px-8 py-3 font-black uppercase text-xl md:text-2xl tracking-tighter hover:scale-105 transition-transform shadow-xl">
                       DOWNLOAD PREMIUM CATALOG <ArrowRight className="h-6 w-6" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-6">Secure Connection // SSL_ENCRYPTED // High Priority</p>
                  </div>
               </div>
            </a>
          </div>
        </section>
      )}

      {/* High-Alert Dispatch Section (Flash Sale) - ALIGNED */}
      <section className="pb-12 pt-4">
        <div className="container mx-auto px-4">
           <div className="bg-brand-primary relative overflow-hidden border-2 border-brand-primary shadow-xl">
            {/* Subtle decorative grid background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <div className="p-12 relative z-10">
              <div className="flex flex-row items-center justify-between mb-16 gap-8 text-left">
                <div>
                  <div className="flex items-center justify-start gap-4 mb-3">
                    <span className="w-12 h-[2px] bg-white/50" />
                    <span className="text-white text-[12px] font-black uppercase tracking-[0.4em]">{settings?.countdown?.text || 'FLASH SALE'}</span>
                  </div>
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">LIMITED OFFERS</h2>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Hurry up! Secure your favorites before they're gone</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center gap-4">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Ends In</p>
                    <div className="flex gap-4">
                      {[
                        { val: timeLeft.hrs, label: 'HR' },
                        { val: timeLeft.mins, label: 'MIN' },
                        { val: timeLeft.secs, label: 'SEC' },
                      ].map((t, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="bg-white text-brand-primary w-14 h-14 flex items-center justify-center text-2xl font-mono font-black border-2 border-white/50">{t.val}</div>
                          <span className="text-[8px] font-black text-white uppercase mt-2 tracking-widest">{t.label}</span>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-6 px-1 md:px-2">
                {loadingProducts ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-white/10 animate-pulse border border-white/20" />
                  ))
                ) : featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
           </div>
        </div>
      </section>

      {/* Adsterra Slot 5 - Below Flash Sale */}
      {settings?.ads?.adsterra?.bannerFiveCode && (
        <section className="py-6">
          <div className="container mx-auto px-4">
             <a href={settings.ads.adsterra.bannerFiveCode} target="_blank" rel="noopener noreferrer" className="block relative h-40 border-4 border-slate-900 group">
                <img 
                  src="https://images.unsplash.com/photo-1622675363311-3e1904dc1885?auto=format&fit=crop&q=80&w=1500" 
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  alt="Ad"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-primary/40 flex flex-col items-center justify-center p-8">
                   <h3 className="text-4xl font-black text-white uppercase tracking-tighter shadow-sm">SPECIAL BONUS LINK</h3>
                   <span className="bg-white text-brand-primary px-4 py-1 text-[10px] font-black uppercase mt-4">Authorized Access Only</span>
                </div>
             </a>
          </div>
        </section>
      )}
      {/* Adsterra Slot 6 - Bottom Ad before Footer */}
      {settings?.ads?.adsterra?.bannerSixCode && (
        <section className="pt-2 pb-10">
          <div className="container mx-auto px-4">
             <a href={settings.ads.adsterra.bannerSixCode} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-brand-secondary border border-slate-300 p-4 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-900 transition-all group shadow-sm">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-brand-primary flex items-center justify-center border-2 border-slate-900 group-hover:border-white transition-all">
                        <Truck className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black uppercase text-slate-800 group-hover:text-white transition-colors">Track Global Shipments</h4>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white/60 transition-colors">Official Dispatch Protocol Active_42</p>
                      </div>
                   </div>
                   <div className="px-10 py-3 bg-brand-primary text-white font-black uppercase text-xs tracking-[0.2em] group-hover:bg-white group-hover:text-slate-900 transition-all">
                      Check Status Now
                   </div>
                </div>
             </a>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
