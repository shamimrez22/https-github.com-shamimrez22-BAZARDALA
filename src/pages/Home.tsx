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
  Bell,
  X
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
    <div className="flex flex-col bg-white text-slate-900 pb-20 overflow-x-hidden relative">
      {/* Full Width Hero Section */}
      <section className="pt-0 pb-4 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-stretch w-full min-h-[300px] lg:h-[420px] rounded-none overflow-hidden border-2 border-[#777] bg-white">
            {/* Category Sidebar/Offer - FULL WIDTH SIDEBAR */}
            <div className="w-full lg:w-72 bg-white border-b-2 lg:border-b-0 lg:border-r-2 border-[#777] flex flex-col flex-shrink-0 overflow-hidden">
                {settings?.sidebar?.showCategories ? (
                  <>
                    <div className="bg-[#f8f8f8] p-5 flex-shrink-0 border-b-2 border-[#777]">
                      <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                        <List className="h-4 w-4" /> MENU_DIR
                      </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2 bg-white scrollbar-thin scrollbar-thumb-[#9B2B2C]/20">
                      <div className="grid grid-cols-1 lg:grid-cols-1">
                        {categories.map((cat, i) => (
                          <Link 
                            key={i} 
                            to={`/shop?cat=${cat.name.toLowerCase()}`}
                            className="flex items-center justify-between px-5 py-3 hover:bg-[#f8f8f8] transition-all group border-b border-[#777]/10"
                          >
                            <div className="flex items-center gap-4">
                              <cat.icon className="h-4 w-4 text-[#9B2B2C]" />
                              <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{cat.name}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#9B2B2C] transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white border-t-2 border-[#777] flex-shrink-0">
                       <Link to="/shop" className="block w-full py-3 bg-[#9B2B2C] text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all text-center rounded-none shadow-md">
                         ALL_CATEGORIES
                       </Link>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden group">
                    <div className="bg-[#f8f8f8] p-2 md:p-3 border-b-2 border-[#777] flex-shrink-0">
                      <h2 className="text-[9px] md:text-[11px] font-black text-[#9B2B2C] uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap className="h-3 w-3 md:h-4 md:w-4" /> {settings?.sidebar?.offerTitle || 'EXCLUSIVE_OFFER'}
                      </h2>
                    </div>
                    <Link to={settings?.sidebar?.offerLink || '/shop'} className="flex-1 relative overflow-hidden group flex flex-row lg:flex-col">
                      <div className="w-24 md:w-32 lg:w-full relative shrink-0 lg:flex-1 min-h-[80px] lg:min-h-0">
                        <img 
                          src={settings?.sidebar?.offerImageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt="Sidebar Offer"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 bg-white p-3 md:p-5 lg:border-t-2 border-[#777] shadow-lg relative flex flex-col justify-center">
                        <div className="bg-[#9B2B2C] text-white text-[7px] md:text-[8px] lg:text-[9px] font-black px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 lg:py-1.5 uppercase tracking-widest mb-1 md:mb-2 lg:mb-3 inline-block self-start">
                          PRIORITY_ACCESS
                        </div>
                        <h4 className="text-[12px] md:text-[14px] lg:text-[18px] font-black text-slate-900 uppercase leading-[1.1] tracking-tighter">
                          {settings?.sidebar?.offerTitle || 'Claim Your Premium Offer Now'}
                        </h4>
                      </div>
                    </Link>
                  </div>
                )}
            </div>
            {/* Main Image Slider */}
            <div className={`flex-1 relative bg-white overflow-hidden group h-full`}>
              <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={currentVariant.initial}
                    animate={currentVariant.animate}
                    exit={currentVariant.exit}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                  {banners[currentSlide] && (
                    <>
                      <img
                        src={banners[currentSlide].image || 'https://picsum.photos/seed/slide/1920/1080'}
                        alt={banners[currentSlide].title || 'Slide Image'}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                        <motion.div
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-white text-brand-primary px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] border border-brand-primary">New Arrival</span>
                            <div className="h-[1px] w-12 bg-white/30" />
                          </div>
                          <h2 className="text-2xl md:text-4xl font-black text-white mb-3 leading-none uppercase tracking-tighter">
                            {banners[currentSlide].title || 'PREMIUM_MANIFEST'}
                          </h2>
                          <p className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-xl mb-6 border-l-2 border-white/50 pl-3">
                            {banners[currentSlide].subtitle || 'SECURED_PRODUCT_LINE // v3.0'}
                          </p>
                          <div className="flex items-center gap-4">
                            <Link to="/shop">
                              <Button className="bg-[#9B2B2C] hover:bg-slate-900 text-white h-12 px-10 rounded-none font-black uppercase text-[11px] tracking-widest shadow-xl border-2 border-slate-900 transition-all active:scale-95">
                                SHOP_NOW
                              </Button>
                            </Link>
                            <div className="hidden md:flex flex-col text-[7px] font-black text-white/70 uppercase tracking-[0.3em] bg-black/40 px-3 py-1.5 backdrop-blur-sm border-l-2 border-[#9B2B2C]">
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
        <section className="py-6 w-full">
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10">
             <a 
              href={settings.ads.adsterra.bannerOneCode} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group relative overflow-hidden rounded-none"
            >
              <div className="bg-slate-900 h-24 md:h-32 flex items-center justify-center relative border-2 border-slate-900 hover:border-[#9B2B2C] transition-all">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                <div className="relative z-10 text-center">
                  <span className="inline-block px-4 py-1.5 bg-[#9B2B2C] text-white text-[10px] font-black uppercase tracking-[0.25em] mb-2 rounded-none">SPECIAL_PROMO</span>
                  <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter">UNLOCK EXCLUSIVE PREMIUM ACCESS</h3>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Limited Availability // Secured Dispatch</p>
                </div>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* Dynamic Floating Notice Bar */}
      {settings?.ads?.floatingNotice?.active && settings?.ads?.floatingNotice?.text && (
        <section className="py-2 w-full">
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10">
            <div 
              className="relative overflow-hidden whitespace-nowrap h-12 md:h-14 flex items-center border-y border-[#777]/10 rounded-sm"
              style={{ backgroundColor: settings.ads.floatingNotice.bgColor }}
            >
              <div 
                className="animate-marquee inline-block font-black uppercase text-[12px] md:text-[14px] tracking-[0.3em] md:tracking-widest whitespace-nowrap"
                style={{ color: settings.ads.floatingNotice.textColor }}
              >
                <span className="inline-block px-6">{settings.ads.floatingNotice.text}</span>
                <span className="inline-block px-6">{settings.ads.floatingNotice.text}</span>
                <span className="inline-block px-6">{settings.ads.floatingNotice.text}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust & Features Section / Dynamic Ad */}
      <section className="py-6 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10">
          {settings?.ads?.featuresAd?.active ? (
            <a 
              href={settings.ads.featuresAd.link || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-[#9B2B2C] rounded-none shadow-xl p-10 relative overflow-hidden flex items-center justify-center min-h-[140px] transition-all hover:scale-[1.01]">
                <div className="flex items-center gap-8 relative z-10">
                  <div className="w-20 h-20 rounded-none border-2 border-white flex items-center justify-center bg-white/10 backdrop-blur-md shadow-lg">
                    <Zap className="h-10 w-10 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-3">
                      {settings.ads.featuresAd.message}
                    </h3>
                    <p className="text-white/60 text-[12px] font-black uppercase tracking-[0.3em]">Explore custom curated offers uniquely for you</p>
                  </div>
                </div>
              </div>
            </a>
          ) : (
                <div className="bg-white border-2 border-[#777] shadow-xl grid grid-cols-2 md:grid-cols-4">
              {[
                { icon: Truck, title: 'Dispatch', desc: 'Doorstep shipping', extra: 'GLOBAL_SEAL' },
                { icon: ShieldCheck, title: 'Authenticity', desc: '100% Genuine Items', extra: 'SECURED' },
                { icon: Zap, title: 'FlashSale', desc: 'Limited time offers', extra: 'ACTIVE_NOW' },
                { icon: Star, title: 'Premium', desc: 'Elite savings', extra: 'VERIFIED' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center gap-4 p-8 hover:bg-[#f8f8f8] transition-all cursor-pointer group border-r-2 border-b-2 border-[#777] last:border-0 last:border-r-0 md:last:border-r-0 md:nth-3:border-r-2">
                  <div className="w-14 h-14 rounded-none border border-[#777] bg-white flex items-center justify-center text-[#9B2B2C] group-hover:bg-[#9B2B2C] group-hover:text-white transition-all duration-300">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-900">{item.title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Adsterra Slot 3 - Below Features */}
      {settings?.ads?.adsterra?.bannerThreeCode && (
        <section className="py-6 w-full">
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10">
             <a href={settings.ads.adsterra.bannerThreeCode} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden group">
               <div className="bg-white border-2 border-[#777] p-12 text-center shadow-xl hover:bg-slate-50 transition-all rounded-none relative overflow-hidden">
                  <span className="text-[12px] font-black uppercase text-[#9B2B2C] tracking-[0.4em] mb-4 block animate-pulse">Priority Dispatch Active</span>
                  <h4 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">ACCESS EXCLUSIVE REWARDS</h4>
                  <p className="text-[11px] font-black text-slate-400 uppercase mt-8 tracking-[0.5em]">Verified Secure Protocol // G-Channel_01 // End-to-End Encryption</p>
               </div>
             </a>
          </div>
        </section>
      )}

      {/* Curated Grid Selection */}
      <section className="py-10 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 border-b-2 border-[#9B2B2C] pb-6">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Collections_DIR</h2>
              <div className="flex items-center gap-3 mt-2">
                 <div className="w-2 h-2 bg-[#9B2B2C] rounded-none animate-pulse" />
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Browse our high-quality categories // AUTHORIZED_VIEW</p>
              </div>
            </div>
            <Link to="/shop" className="group flex items-center gap-4 bg-slate-900 text-white px-8 py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-[#9B2B2C] transition-all rounded-none shadow-lg hover:scale-[1.02] active:scale-[0.98]">
              Explore All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Devices', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400' },
              { name: 'Laptops', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=400' },
              { name: 'Watches', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' },
              { name: 'Fashion', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=400' },
              { name: 'Home', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400' },
              { name: 'Gaming', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400' },
            ].map((cat, i) => (
              <Link 
                key={i} 
                to={`/shop?cat=${cat.name.toLowerCase()}`}
                className="bg-white rounded-none border-2 border-[#777] p-2 transition-all group relative hover:shadow-lg flex flex-col items-center"
              >
                <div className="w-full aspect-square overflow-hidden mb-3 transition-all duration-700">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:grayscale transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col items-center gap-1 pb-2">
                  <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-800">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Adsterra Slot 4 - Below Categories */}
      {settings?.ads?.adsterra?.bannerFourCode && (
        <section className="py-4 w-full">
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10">
             <a href={settings.ads.adsterra.bannerFourCode} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-slate-900 rounded-none h-28 flex items-center justify-center p-6 relative overflow-hidden shadow-xl border-2 border-[#777] transition-all hover:scale-[1.01]">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Zap className="h-20 w-20 text-white" />
                   </div>
                   <div className="text-center relative z-10">
                      <h5 className="text-white text-xl md:text-2xl font-black uppercase tracking-tighter">CLICK TO GET SURPRISE GIFT!</h5>
                      <span className="text-[#9B2B2C] text-[10px] font-black uppercase tracking-[0.5em] mt-2 block animate-pulse">EXCLUSIVE_OPPORTUNITY_77</span>
                   </div>
                </div>
             </a>
          </div>
        </section>
      )}

      {/* Middle Banner Ad - Adsterra */}
      {settings?.ads?.adsterra?.bannerTwoCode && (
        <section className="py-4 w-full">
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10">
            <a 
              href={settings.ads.adsterra.bannerTwoCode} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block relative"
            >
               <div className="bg-white border-2 border-[#777] rounded-none p-10 text-center hover:bg-[#f8f8f8] transition-all relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Recommended For User_Session</h4>
                    <div className="inline-flex items-center gap-4 bg-[#9B2B2C] text-white px-10 py-4 font-black uppercase text-2xl md:text-3xl tracking-tighter shadow-xl border-2 border-slate-900">
                       DOWNLOAD_PREMIUM_CATALOG <ArrowRight className="h-8 w-8" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-8">AUTHORIZED_ACCESS_ONLY // SSL_ENCRYPTED</p>
                  </div>
               </div>
            </a>
          </div>
        </section>
      )}

      {/* High-Alert Dispatch Section (Flash Sale) - ALIGNED */}
      <section className="pb-12 pt-4 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10">
           <div className="bg-[#9B2B2C] relative overflow-hidden rounded-none border-2 border-[#777] shadow-2xl">
            {/* Subtle decorative grid background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            
            <div className="p-8 md:p-14 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 md:mb-12 gap-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="w-10 h-[2px] bg-white/40 rounded-none" />
                <span className="text-white text-[11px] font-black uppercase tracking-[0.3em]">{settings?.countdown?.text || 'FLASH SALE'}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-3">MEGA LIMITED DISPATCH</h2>
              <p className="text-white/60 text-[12px] font-black uppercase tracking-[0.2em]">Secure your favorites with authorized priority access</p>
            </div>
                
                <div className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 p-6 md:p-8 rounded-none flex flex-col items-center gap-4 w-full md:w-auto">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">TIME_LIMIT</p>
                    <div className="flex gap-4">
                      {[
                        { val: timeLeft.hrs, label: 'HR' },
                        { val: timeLeft.mins, label: 'MIN' },
                        { val: timeLeft.secs, label: 'SEC' },
                      ].map((t, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="bg-white text-[#9B2B2C] w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-xl md:text-2xl font-mono font-black border-2 border-black">{t.val}</div>
                          <span className="text-[9px] font-black text-white uppercase mt-2 tracking-widest">{t.label}</span>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 md:gap-8">
                {loadingProducts ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-3xl" />
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
        <section className="py-6 w-full">
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10">
             <a href={settings.ads.adsterra.bannerFiveCode} target="_blank" rel="noopener noreferrer" className="block relative h-40 group rounded-none overflow-hidden shadow-xl border-2 border-[#777]">
                <img 
                  src="https://images.unsplash.com/photo-1622675363311-3e1904dc1885?auto=format&fit=crop&q=80&w=1500" 
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
                  alt="Ad"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center p-8 backdrop-blur-[2px] transition-all group-hover:backdrop-blur-none group-hover:bg-slate-900/40">
                   <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none text-center">CLAIM YOUR SECRET REWARD</h3>
                   <span className="bg-[#9B2B2C] text-white px-6 py-2 text-[10px] font-black uppercase mt-6 rounded-none tracking-[0.3em] shadow-md border border-white">LIMITED_ACCESS_PROTOCOL</span>
                </div>
             </a>
          </div>
        </section>
      )}
      {/* Adsterra Slot 6 - Bottom Ad before Footer */}
      {settings?.ads?.adsterra?.bannerSixCode && (
        <section className="pt-2 pb-10 w-full">
          <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10">
             <a href={settings.ads.adsterra.bannerSixCode} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-white rounded-none p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-[#f8f8f8] transition-all shadow-xl border-2 border-[#777] group overflow-hidden relative">
                   <div className="flex items-center gap-8 relative z-10">
                      <div className="w-20 h-20 bg-slate-900 rounded-none border-2 border-slate-900 flex items-center justify-center shadow-lg group-hover:bg-[#9B2B2C] transition-all duration-500">
                        <Truck className="h-10 w-10 text-white" />
                      </div>
                      <div className="text-center md:text-left">
                        <h4 className="text-2xl font-black uppercase text-slate-800 tracking-tighter leading-none mb-2 underline underline-offset-4 decoration-[#9B2B2C]">TRACKING_STATION_HUB</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">DIRECT_LOGISTICS_PROTOCOL // ACTIVE_SESSION</p>
                      </div>
                   </div>
                   <div className="px-12 py-4 bg-slate-900 text-white font-black uppercase text-[12px] tracking-[0.25em] group-hover:bg-[#9B2B2C] transition-all rounded-none shadow-lg border-2 border-slate-900 relative z-10">
                      SYNC_DASHBOARD
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
