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
  <div className="flex-1 flex flex-col overflow-hidden group min-h-[300px] lg:min-h-0 bg-white">
    <div className="bg-[#f8f8f8] p-2 md:p-3 border-b-2 border-[#777] flex-shrink-0">
      <h2 className="text-[10px] md:text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 md:h-4 md:w-4" /> {settings?.sidebar?.offerTitle || 'EXCLUSIVE OFFER'}
      </h2>
    </div>
    <Link to={settings?.sidebar?.offerLink || '/shop'} className="flex-1 relative overflow-hidden group flex flex-col">
      <div className="w-full relative shrink-0 lg:flex-1 min-h-[140px] lg:min-h-0 overflow-hidden bg-slate-900">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 w-full h-full pointer-events-none opacity-5">
          <div className="w-full h-[1px] bg-white animate-[scanline_4s_linear_infinite]" />
        </div>
      </div>
      <div className="p-2 md:p-3 shadow-sm relative flex flex-col justify-center">
        <div className="w-full bg-brand-primary text-white text-[7px] md:text-[8px] font-black py-1 uppercase tracking-[0.3em] mb-1.5 text-center shadow-sm transform -skew-x-6">
          SPECIAL ACCESS
        </div>
        <h4 className="text-[11px] md:text-[12px] font-black text-slate-900 uppercase leading-[1.1] tracking-tighter group-hover:text-brand-primary transition-colors">
          {settings?.sidebar?.offerTitle || 'Claim Your Premium Offer Now'}
        </h4>
        <div className="h-1 w-0 bg-brand-primary mt-1.5 group-hover:w-full transition-all duration-500" />
      </div>
    </Link>
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

  // Clean horizontal slide for consistency
  const variants = [
    { initial: { x: '100%', opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: '-100%', opacity: 0 } }
  ];

  const currentVariant = variants[0];

  return (
    <div className="flex flex-col bg-white text-slate-900 pb-20 overflow-x-hidden relative">
      {/* Mobile Category Bar (Horizontal Scroll) */}
      <div className="lg:hidden w-full bg-white border-b border-[#777]/10 py-3 px-4 overflow-x-auto whitespace-nowrap scrollbar-hide flex items-center gap-4">
        {categories.map((cat, i) => (
          <Link 
            key={i} 
            to={`/shop?cat=${cat.name.toLowerCase()}`}
            className="flex flex-col items-center gap-2 group shrink-0"
          >
            <div className="w-11 h-11 rounded-full bg-[#f8f8f8] border border-[#777]/5 flex items-center justify-center p-2.5 group-hover:bg-brand-primary/10 transition-colors">
              <cat.icon className="h-4 w-4 text-brand-primary" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover:text-brand-primary">{cat.name.split(' ')[0]}</span>
          </Link>
        ))}
      </div>

      {/* Full Width Hero Section */}
      <section className="pt-2 md:pt-0 pb-1 md:pb-4 w-full">
        <div className="w-full max-w-[1536px] mx-auto px-4 md:px-16 lg:px-24 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-stretch w-full min-h-[100px] md:min-h-[280px] lg:h-[450px] rounded-none overflow-hidden border-2 border-[#777] bg-white">
            {/* Category Sidebar/Offer - HIDDEN ON MOBILE, VISIBLE ON DESKTOP */}
            <div className="hidden lg:flex lg:w-72 bg-white lg:border-r-2 border-[#777] flex-col flex-shrink-0 lg:overflow-visible">
                {settings?.sidebar?.showCategories ? (
                  <>
                    <div className="bg-[#f8f8f8] p-4 flex-shrink-0 border-b-2 border-[#777] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-5">
                         <List className="h-10 w-10 text-brand-primary" />
                      </div>
                      <h2 className="text-[12px] md:text-[14px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3 relative z-10">
                        <List className="h-5 w-5 text-brand-primary" /> CATEGORIES
                      </h2>
                    </div>
                    <div className="flex-shrink-0 lg:flex-1 overflow-y-auto py-1 bg-white scrollbar-thin scrollbar-thumb-brand-primary/20">
                      <div className="flex flex-col">
                        {categories.slice(0, 10).map((cat, i) => (
                          <Link 
                            key={i} 
                            to={`/shop?cat=${cat.name.toLowerCase()}`}
                            className="flex items-center justify-between px-6 py-3.5 hover:bg-[#f8f8f8] transition-all group border-b border-[#777]/5 last:border-0"
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
                    <div className="border-t-2 border-[#777] h-[140px] flex-shrink-0">
                       <SpecialOfferNode settings={settings} />
                    </div>
                    <div className="p-4 bg-white border-t-2 border-[#777] flex-shrink-0">
                       <Link to="/shop" className="block w-full py-3 bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all text-center rounded-none shadow-md">
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
                  {banners[currentSlide] && (
                    <img
                      src={banners[currentSlide].image || 'https://picsum.photos/seed/slide/1920/1080'}
                      alt={banners[currentSlide].title || 'Slide Image'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
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

      {settings?.ads?.adsterra?.bannerOneCode && (
        <section className="py-1 w-full">
          <div className="w-full max-w-[1536px] mx-auto px-6 md:px-16 lg:px-24">
             <a 
              href={settings.ads.adsterra.bannerOneCode} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group relative overflow-hidden rounded-none"
            >
              <div className="bg-slate-900 h-20 md:h-28 flex items-center justify-center relative border-2 border-slate-900 hover:border-brand-primary transition-all">
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
          <div className="w-full max-w-[1536px] mx-auto px-6 md:px-16 lg:px-24">
            <div 
              className="relative overflow-hidden whitespace-nowrap h-10 md:h-12 flex items-center border-y border-[#777]/10 rounded-sm"
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

      {/* Feature section removed at user request */}
      {/* Services Grid section removed at user request */}

      {settings?.ads?.adsterra?.bannerThreeCode && (
        <section className="py-3 w-full">
          <div className="w-full max-w-[1536px] mx-auto px-6 md:px-16 lg:px-24">
             <a href={settings.ads.adsterra.bannerThreeCode} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden group">
               <div className="bg-white border-2 border-[#777] p-8 text-center shadow-xl hover:bg-slate-50 transition-all rounded-none relative overflow-hidden">
                  <span className="text-[10px] font-black uppercase text-brand-primary tracking-[0.4em] mb-3 block animate-pulse">Fast Delivery Active</span>
                  <h4 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">SHOP OUR BESTSELLERS</h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-4 tracking-[0.5em]">100% Secure Shopping - Satisfaction Guaranteed</p>
               </div>
             </a>
          </div>
        </section>
      )}

      {/* Curated Grid Selection */}
      <section className="py-1 md:py-5 w-full">
        <div className="w-full max-w-[1536px] mx-auto px-6 md:px-16 lg:px-24">
          <div className="flex flex-col md:flex-row items-center justify-between mb-3 md:mb-8 gap-2 md:gap-6 border-b-2 border-brand-primary pb-2 md:pb-4">
            <div>
              <h2 className="text-sm md:text-2xl font-black uppercase tracking-tighter text-slate-900">COLLECTIONS</h2>
              <div className="flex items-center gap-3 mt-1">
                 <div className="w-1 h-1 bg-brand-primary rounded-none animate-pulse" />
                 <p className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Shop our high-quality categories</p>
              </div>
            </div>
            <Link to="/shop" className="group flex items-center gap-4 bg-slate-900 text-white px-4 md:px-6 py-2 md:py-2.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all rounded-none shadow-lg hover:scale-[1.02] active:scale-[0.98]">
              VIEW ALL <ArrowRight className="h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
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

      {settings?.ads?.adsterra?.bannerFourCode && (
        <section className="py-2 w-full">
          <div className="w-full max-w-[1536px] mx-auto px-6 md:px-16 lg:px-24">
             <a href={settings.ads.adsterra.bannerFourCode} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-slate-900 rounded-none h-24 flex items-center justify-center p-4 relative overflow-hidden shadow-xl border-2 border-[#777] transition-all hover:scale-[1.01]">
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
          <div className="w-full max-w-[1536px] mx-auto px-6 md:px-16 lg:px-24">
            <a 
              href={settings.ads.adsterra.bannerTwoCode} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block relative"
            >
               <div className="bg-white border-2 border-[#777] rounded-none p-6 text-center hover:bg-[#f8f8f8] transition-all relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Recommended For You</h4>
                    <div className="inline-flex items-center gap-3 bg-brand-primary text-white px-8 py-3 font-black uppercase text-xl md:text-2xl tracking-tighter shadow-xl border-2 border-slate-900">
                       VIEW BEST DEALS <ArrowRight className="h-6 w-6" />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">100% Secure Shopping</p>
                  </div>
               </div>
            </a>
          </div>
        </section>
      )}

      {/* High-Alert Dispatch Section (Flash Sale) - ALIGNED */}
      <section className="pb-3 pt-1 w-full text-center md:text-left">
        <div className="w-full max-w-[1536px] mx-auto px-6 md:px-16 lg:px-24">
           <div className="bg-brand-primary relative overflow-hidden rounded-none border-2 border-[#777] shadow-2xl">
            {/* Subtle decorative grid background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            
            <div className="p-4 md:p-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 gap-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                <span className="w-8 h-[1.5px] bg-white/40 rounded-none" />
                <span className="text-white text-[9px] font-black uppercase tracking-[0.3em]">{settings?.countdown?.text || 'FLASH SALE'}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1.5">FLASH SALE</h2>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Get your favorites before they are gone</p>
            </div>
                
                <div className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 p-4 md:p-6 rounded-none flex flex-col items-center gap-3 w-full md:w-auto">
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em] mb-0.5">LIMITED TIME</p>
                    <div className="flex gap-3">
                      {[
                        { val: timeLeft.hrs, label: 'HR' },
                        { val: timeLeft.mins, label: 'MIN' },
                        { val: timeLeft.secs, label: 'SEC' },
                      ].map((t, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="bg-white text-brand-primary w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-base md:text-lg font-mono font-black border-2 border-black">{t.val}</div>
                          <span className="text-[8px] font-black text-white uppercase mt-1.5 tracking-widest">{t.label}</span>
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

      {settings?.ads?.adsterra?.bannerFiveCode && (
        <section className="py-1 w-full">
          <div className="w-full max-w-[1536px] mx-auto px-6 md:px-16 lg:px-24">
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
          <div className="w-full max-w-[1536px] mx-auto px-6 md:px-16 lg:px-24">
             <a href={settings.ads.adsterra.bannerSixCode} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-white rounded-none p-5 flex flex-col md:flex-row items-center justify-between gap-5 hover:bg-[#f8f8f8] transition-all shadow-xl border-2 border-[#777] group overflow-hidden relative">
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="w-16 h-16 bg-slate-900 rounded-none border-2 border-slate-900 flex items-center justify-center shadow-lg group-hover:bg-brand-primary transition-all duration-500">
                        <Truck className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-center md:text-left">
                        <h4 className="text-xl font-black uppercase text-slate-800 tracking-tighter leading-none mb-1.5 underline underline-offset-4 decoration-brand-primary">FAST DELIVERY</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Shipment update - On the way</p>
                      </div>
                   </div>
                   <div className="px-10 py-3 bg-slate-900 text-white font-black uppercase text-[11px] tracking-[0.25em] group-hover:bg-brand-primary transition-all rounded-none shadow-lg border-2 border-slate-900 relative z-10">
                      ORDER NOW
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
