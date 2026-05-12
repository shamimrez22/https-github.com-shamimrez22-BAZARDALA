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
  Bell as NotificationIcon,
  X as XIcon
} from 'lucide-react';

import { collection, getDocs, getDoc, query, orderBy, limit, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { SiteSettings } from '../types';

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

const SpecialOfferNode = ({ settings }: { settings: any }) => (
  <div className="flex-1 flex flex-col overflow-hidden group min-h-[300px] lg:min-h-0 bg-slate-900 border-0">
    <SmartLink to={settings?.sidebar?.offerLink || '/shop'} className="flex-1 relative overflow-hidden group">
      {/* Background Media */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          key={settings?.sidebar?.offerVideoUrl}
          poster={settings?.sidebar?.offerImageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-[3000ms] ease-out group-hover:scale-125 scale-110 opacity-100"
        >
          {settings?.sidebar?.offerVideoUrl ? (
            <source src={settings.sidebar.offerVideoUrl} type="video/mp4" />
          ) : (
            <>
              <source src="https://v1.nitrocdn.com/fMvOidVjXoEVErQZzGNoSvhzYxRzUuXz/assets/static/optimized/rev-8656606/wp-content/uploads/2021/10/product-video-loop.mp4" type="video/mp4" />
              <source src="https://assets.mixkit.co/videos/preview/mixkit-shoes-on-a-red-background-1234-large.mp4" type="video/mp4" />
            </>
          )}
        </video>
        {/* Dynamic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent group-hover:opacity-0 transition-opacity duration-700" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col justify-between p-4 md:p-6 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-brand-primary p-1.5 rounded-none shadow-lg">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md">
            {settings?.sidebar?.offerTitle || 'EXCLUSIVE OFFER'}
          </h2>
        </div>

        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <div className="inline-block bg-white text-brand-primary text-[7px] md:text-[8px] font-black py-1 px-4 uppercase tracking-[0.4em] mb-2 shadow-xl transform -skew-x-12">
            SPECIAL ACCESS
          </div>
          <h4 className="text-[14px] md:text-[18px] font-black text-white uppercase leading-tight tracking-tighter drop-shadow-2xl">
            {settings?.sidebar?.offerSubtitle || 'Claim Your Premium Offer Now'}
          </h4>
          <div className="h-1 w-0 bg-brand-primary mt-3 group-hover:w-full transition-all duration-700" />
        </div>
      </div>
    </SmartLink>
  </div>
);

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
    const fetchInitialData = async () => {
      try {
        const bannersPromise = getDocs(query(collection(db, 'slider_banners'), orderBy('createdAt', 'desc')));
        const configPromise = getDoc(doc(db, 'settings', 'limited_offers'));
        
        const [bannersSnap, configSnap] = await Promise.all([bannersPromise, configPromise]);
        
        if (!bannersSnap.empty) {
          setBanners(bannersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any);
        }
        if (configSnap.exists()) {
          setLimitedOffersConfig(configSnap.data() as any);
        }
      } catch (error) {
        console.error('Error fetching initial Home data:', error);
      }
    };
    
    fetchInitialData();
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

  // Clean horizontal slide for consistency
  const variants = [
    { initial: { x: '100%', opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: '-100%', opacity: 0 } }
  ];

  const currentVariant = variants[0];

  return (
    <div className="flex flex-col bg-white text-slate-900 pb-20 overflow-x-hidden relative">
      {/* Full Width Hero Section */}
      <section className="pt-0 md:pt-0 pb-1 md:pb-4 w-full">
        <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4 overflow-hidden">
<div className="flex flex-col lg:flex-row items-stretch w-full min-h-[140px] md:min-h-[260px] lg:h-[400px] rounded-none overflow-hidden border-b border-slate-100 bg-white">
            {/* Category Sidebar/Offer - HIDDEN ON MOBILE, VISIBLE ON DESKTOP */}
            <div className="hidden lg:flex lg:w-72 bg-white flex-col flex-shrink-0 lg:overflow-visible">
                {settings?.sidebar?.showCategories ? (
                  <>
                    <div className="bg-[#f8f8f8] p-4 flex-shrink-0 border-b border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-5">
                         <List className="h-10 w-10 text-brand-primary" />
                      </div>
                      <h2 className="text-[12px] md:text-[14px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3 relative z-10">
                        <List className="h-5 w-5 text-brand-primary" /> CATEGORIES
                      </h2>
                    </div>
                    <div className="flex-shrink-0 lg:flex-1 overflow-y-auto py-1 bg-white scrollbar-thin scrollbar-thumb-brand-primary/20" data-lenis-prevent>
                      <div className="flex flex-col">
                        {categories.slice(0, 10).map((cat, i) => (
                          <Link 
                            key={i} 
                            to={`/shop?cat=${cat.name.toLowerCase()}`}
                            className="flex items-center justify-between px-6 py-3.5 hover:bg-[#f8f8f8] transition-all group border-b border-slate-50 last:border-0"
                          >
                            <div className="flex items-center gap-4">
                              <cat.icon className="h-4 w-4 text-brand-primary" />
                              <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{cat.name}</span>
                            </div>
                            <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-brand-primary transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>
                    {/* Offer visible below categories on desktop */}
                    <div className="border-t border-slate-100 h-[140px] flex-shrink-0">
                       <SpecialOfferNode settings={settings} />
                    </div>
                    <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
                       <Link to="/shop" className="block w-full py-2 bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all text-center rounded-none">
                         VIEW ALL
                       </Link>
                    </div>
                  </>
                ) : (
                  <SpecialOfferNode settings={settings} />
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
                  <SmartLink to={banners[currentSlide]?.link || '/shop'} className="block h-full w-full">
                    {banners[currentSlide] && (
                        <img
                          src={banners[currentSlide].image || 'https://picsum.photos/seed/slide/1920/1080'}
                          alt={banners[currentSlide].title || 'Slide Image'}
                          loading="eager"
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                    )}
                  </SmartLink>
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

      {settings?.ads?.adsterra?.bannerOneCode && (
        <section className="py-1 w-full">
          <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
             <a 
              href={settings.ads.adsterra.bannerOneCode} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group relative overflow-hidden rounded-none"
            >
              <div className="bg-slate-900 h-20 md:h-28 flex items-center justify-center relative hover:bg-black transition-all">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                <div className="relative z-10 text-center">
                  <span className="inline-block px-4 py-1 bg-brand-primary text-white text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] mb-1 rounded-none">SPECIAL OFFER</span>
                  <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tighter">GET EXCLUSIVE DISCOUNTS</h3>
                  <p className="text-white/30 text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] mt-0.5">Limited Time Offer - Fast Delivery</p>
                </div>
              </div>
            </a>
          </div>
        </section>
      )}

      {settings?.ads?.floatingNotice?.active && settings?.ads?.floatingNotice?.text && (
        <section className="py-2 w-full">
          <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
            <SmartLink 
              to={settings.ads.floatingNotice.link}
              className="relative overflow-hidden whitespace-nowrap h-8 md:h-10 flex items-center border-y border-slate-900/5 bg-slate-50 hover:opacity-90 block"
              style={{ backgroundColor: settings.ads.floatingNotice.bgColor }}
            >
              <div 
                className="animate-marquee inline-block font-bold uppercase text-[9px] md:text-[11px] tracking-[0.3em] whitespace-nowrap"
                style={{ color: settings.ads.floatingNotice.textColor }}
              >
                <span className="inline-block px-8">{settings.ads.floatingNotice.text}</span>
                <span className="inline-block px-8">{settings.ads.floatingNotice.text}</span>
                <span className="inline-block px-8">{settings.ads.floatingNotice.text}</span>
              </div>
            </SmartLink>
          </div>
        </section>
      )}

      {/* Feature section removed at user request */}
      {/* Services Grid section removed at user request */}

      {settings?.ads?.adsterra?.bannerThreeCode && (
        <section className="py-3 w-full">
          <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
             <a href={settings.ads.adsterra.bannerThreeCode} target="_blank" rel="noopener noreferrer" className="block relative h-full group">
               <div className="bg-brand-primary p-8 text-center hover:opacity-90 transition-all rounded-none relative overflow-hidden">
                  <span className="text-[10px] font-black uppercase text-white tracking-[0.4em] mb-3 block animate-pulse">Fast Delivery Active</span>
                  <h4 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">SHOP OUR BESTSELLERS</h4>
                  <p className="text-[9px] font-black text-white/50 uppercase mt-4 tracking-[0.5em]">100% Secure Shopping - Satisfaction Guaranteed</p>
               </div>
             </a>

          </div>
        </section>
      )}

      {/* Curated Grid Selection */}
      <section className="py-2 md:py-6 w-full bg-[#fcfcfc]">
        <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-2 md:mb-4 gap-2 md:gap-6 border-b border-brand-primary/20 pb-1.5 md:pb-2">
            <div className="text-center md:text-left">
              <h2 className="text-sm md:text-lg font-black uppercase tracking-tighter text-slate-900 leading-none">THE_COLLECTIONS</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-0.5">
                 <div className="w-1 h-1 bg-brand-primary rounded-none animate-pulse" />
                 <p className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Inventory Catalog</p>
              </div>
            </div>
            <Link to="/shop" className="hidden md:flex group items-center gap-3 bg-slate-900 text-white px-5 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] hover:bg-brand-primary transition-all rounded-none active:scale-[0.98]">
              CATALOG_DIR <ArrowRight className="h-3 w-3 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-8">
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
                className="flex flex-col items-center group gap-2"
              >
                <div className="w-full aspect-square overflow-hidden bg-white border border-[#777]/10 transition-all group-hover:border-brand-primary/40 relative shadow-sm">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 grayscale-[0.2] group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 py-2 bg-slate-900/10 group-hover:bg-brand-primary/10 transition-colors" />
                </div>
                <h3 className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-primary transition-colors text-center">{cat.name}</h3>
              </Link>
            ))}
          </div>

          <div className="mt-4 md:hidden">
            <Link to="/shop" className="w-full flex items-center justify-center gap-4 bg-slate-900 text-white py-2 text-[8px] font-black uppercase tracking-[0.2em] rounded-none shadow-xl active:scale-95 transition-all">
               VIEW_ALL_COLLECTIONS <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {settings?.ads?.adsterra?.bannerFourCode && (
        <section className="py-2 w-full">
          <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
             <a href={settings.ads.adsterra.bannerFourCode} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-slate-900 rounded-none h-24 flex items-center justify-center p-4 relative overflow-hidden transition-all hover:bg-black">
                   <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Zap className="h-16 w-16 text-white" />
                   </div>
                   <div className="text-center relative z-10">
                      <h5 className="text-white text-lg md:text-xl font-black uppercase tracking-tighter">SHOP NEW ARRIVALS</h5>
                      <span className="text-brand-primary text-[9px] font-black uppercase tracking-[0.5em] mt-1 block animate-pulse">HOT DEALS</span>
                   </div>
                </div>
             </a>

          </div>
        </section>
      )}

      {settings?.ads?.adsterra?.bannerTwoCode && (
        <section className="py-2 w-full">
          <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
            <a 
              href={settings.ads.adsterra.bannerTwoCode} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block relative"
            >
               <div className="bg-white border-2 border-[#777] rounded-none p-6 text-center hover:bg-[#f8f8f8] transition-all relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Recommended For You</h4>
                    <div className="inline-flex items-center gap-3 bg-brand-primary text-white px-7 py-2.5 font-black uppercase text-xl md:text-2xl tracking-tighter shadow-xl border-2 border-slate-900">
                       VIEW BEST DEALS <ArrowRight className="h-6 w-6" />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">100% Secure Shopping</p>
                  </div>
               </div>
            </a>
          </div>
        </section>
      )}

      {/* High-Alert Dispatch Section (Flash Sale - Spreadsheet / XL Edition) */}
      <section className="pb-12 pt-6 w-full">
        <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
           {/* Spreadsheet Container */}
           <div className="bg-white border border-slate-300 rounded-none overflow-hidden shadow-sm">
            {/* XL Header Bar */}
            <div className="bg-brand-primary px-4 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-tight">Sheet1: Live_Inventory</span>
                </div>
                <div className="h-4 w-[1px] bg-white/20" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{settings?.countdown?.text || 'SALE_DISPATCH'}</span>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="p-0">
              {/* Data Controls / Timer Section */}
              <div className="flex flex-col lg:flex-row border-b border-slate-100">
                <div className="flex-1 p-6 md:p-10 bg-slate-50/50">
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">FLASH SALE</h2>
                    <p className="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em]">{settings?.countdown?.text || 'Limited time inventory clearance'}</p>
                  </div>
                </div>
                
                <div className="lg:w-auto p-6 md:px-12 flex flex-col justify-center items-center bg-white border-l border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">EXPIRATION_TIMER</p>
                    <div className="flex gap-3">
                      {[
                        { val: timeLeft.hrs, label: 'H' },
                        { val: timeLeft.mins, label: 'M' },
                        { val: timeLeft.secs, label: 'S' },
                      ].map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="bg-slate-900 text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-lg md:text-xl font-mono font-black">{t.val}</div>
                          {i < 2 && <span className="text-slate-300 font-black">:</span>}
                        </div>
                      ))}
                    </div>
                </div>
              </div>

              
              {/* The "Sheet" Grid */}
              <div className="p-2 md:p-4 bg-white grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 border-collapse items-stretch">
                {loadingProducts ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-slate-50 animate-pulse border border-slate-100" />
                  ))
                ) : featuredProducts.map((product) => (
                  <div key={product.id} className="border border-slate-100 p-1 hover:bg-slate-50 transition-colors group">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
           </div>
        </div>
      </section>

      {settings?.ads?.adsterra?.bannerFiveCode && (
        <section className="py-1 w-full">
          <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
             <a href={settings.ads.adsterra.bannerFiveCode} target="_blank" rel="noopener noreferrer" className="block relative h-32 group rounded-none overflow-hidden shadow-xl border-2 border-[#777]">
                <img 
                  src="https://images.unsplash.com/photo-1622675363311-3e1904dc1885?auto=format&fit=crop&q=80&w=1500" 
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
                  alt="Ad"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center p-6 backdrop-blur-[2px] transition-all group-hover:backdrop-blur-none group-hover:bg-slate-900/40">
                   <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none text-center">SHOP LIMITED OFFERS</h3>
                   <span className="bg-brand-primary text-white px-5 py-1.5 text-[9px] font-black uppercase mt-4 rounded-none tracking-[0.3em] shadow-md border border-white">EXCLUSIVE DEALS</span>
                </div>
             </a>
          </div>
        </section>
      )}
      {settings?.ads?.adsterra?.bannerSixCode && (
        <section className="pt-0.5 pb-2 w-full">
          <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
             <a href={settings.ads.adsterra.bannerSixCode} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-white rounded-none p-5 flex flex-col md:flex-row items-center justify-between gap-5 hover:bg-[#f8f8f8] transition-all border border-slate-100 group overflow-hidden relative">
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="w-16 h-16 bg-slate-900 rounded-none flex items-center justify-center group-hover:bg-brand-primary transition-all duration-500">
                        <Truck className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-center md:text-left">
                        <h4 className="text-xl font-black uppercase text-slate-800 tracking-tighter leading-none mb-1.5 underline underline-offset-4 decoration-brand-primary">FAST DELIVERY</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Shipment update - On the way</p>
                      </div>
                   </div>
                   <button 
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/shop');
                      }}
                      className="px-8 py-2 bg-slate-900 text-white font-black uppercase text-[11px] tracking-[0.25em] group-hover:bg-brand-primary transition-all rounded-none relative z-10 active:scale-95"
                   >
                      ORDER NOW
                   </button>
                </div>
             </a>

          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
