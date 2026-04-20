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
  PlusCircle
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
  const [banners, setBanners] = React.useState(defaultBanners);
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);
  const [limitedOffersConfig, setLimitedOffersConfig] = React.useState({ limit: 6, productIds: [] as string[] });
  const { products, loading: loadingProducts } = useProducts();
  const navigate = useNavigate();

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
    }, 8000); // Slower cycle for legibility
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="flex flex-col bg-[#f4e4d4] text-slate-900 pb-20">
      {/* System Hero Section */}
      <section className="pt-2 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Category Sidebar */}
            <div className="w-full lg:w-72 bg-[#ead9c4] border border-[#777] shadow-sm flex-shrink-0 flex flex-col h-[300px] md:h-[450px]">
              <div className="bg-[#9B2B2C] p-3 border-b border-[#777] flex-shrink-0">
                 <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                   <List className="h-4 w-4" /> All Categories
                 </h2>
              </div>
              <div className="flex-1 overflow-y-auto py-1 bg-white/30 scrollbar-thin scrollbar-thumb-[#9B2B2C]/20">
                <div className="grid grid-cols-2 lg:grid-cols-1">
                  {categories.map((cat, i) => (
                    <Link 
                      key={i} 
                      to={`/shop?cat=${cat.name.toLowerCase()}`}
                      className="flex items-center justify-between px-4 py-2 hover:bg-[#ead9c4] transition-all group border-b border-[#777]/10"
                    >
                      <div className="flex items-center gap-3">
                        <cat.icon className="h-3.5 w-3.5 text-[#9B2B2C]" />
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">{cat.name}</span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-[#9B2B2C]" />
                    </Link>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-[#ead9c4] border-t border-[#777] flex-shrink-0">
                 <button className="w-full py-1.5 border border-[#9B2B2C] text-[#9B2B2C] text-[9px] font-black uppercase tracking-widest hover:bg-[#9B2B2C] hover:text-white transition-all">
                   Show More
                 </button>
              </div>
            </div>

            {/* Main Image Slider */}
            <div className="flex-1 relative bg-white border border-[#777] shadow-lg overflow-hidden group h-[300px] md:h-[450px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
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
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#9B2B2C] via-[#9B2B2C]/80 to-transparent p-8 md:p-12">
                        <motion.div
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-white text-[#9B2B2C] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] border border-[#9B2B2C]">New Arrival</span>
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
                              <Button className="bg-white hover:bg-[#ead9c4] text-[#9B2B2C] h-12 px-10 rounded-none font-black uppercase text-[11px] tracking-[0.2em] shadow-xl">
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
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-[#9B2B2C] border border-white/30 transition-all flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-[#9B2B2C] border border-white/30 transition-all flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

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
              <div className="bg-[#9B2B2C] border-2 border-[#777] shadow-[6px_6px_0px_#000] p-6 relative overflow-hidden flex items-center justify-center min-h-[100px] transition-all hover:bg-slate-900 active:translate-x-1 active:translate-y-1 active:shadow-none">
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
            <div className="bg-[#ead9c4] border border-[#777] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#777]/30">
              {[
                { icon: Truck, title: 'Free Delivery', desc: 'Doorstep shipping', extra: 'SEAL_VERIFIED' },
                { icon: ShieldCheck, title: 'Original Products', desc: '100% Genuine Items', extra: 'SECURED' },
                { icon: Zap, title: 'Flash Sale', desc: 'Limited time offers', extra: 'ACTIVE_NOW' },
                { icon: Star, title: 'Special Discounts', desc: 'Great savings for you', extra: 'VERIFIED' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 hover:bg-white/20 transition-all cursor-pointer group">
                  <div className="w-10 h-10 border border-[#9B2B2C] bg-white flex items-center justify-center text-[#9B2B2C] group-hover:bg-[#9B2B2C] group-hover:text-white transition-all">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-tight text-slate-900">{item.title}</h3>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.1em]">{item.desc}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <div className="w-1 h-1 bg-[#9B2B2C] rounded-full animate-pulse" />
                      <span className="text-[7px] font-black text-[#9B2B2C]/60 uppercase">{item.extra}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Curated Grid Selection */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 border-b-2 border-[#9B2B2C] pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Categories</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Browse our top collections</p>
            </div>
            <Link to="/shop" className="group flex items-center gap-2 bg-[#9B2B2C] text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all">
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
                className="bg-white border border-[#777] p-2 hover:bg-[#ead9c4] transition-all group relative"
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
                  <div className="w-4 h-[1px] bg-[#9B2B2C]/30" />
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="p-1 bg-[#9B2B2C] text-white">
                      <PlusCircle className="h-3 w-3" />
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* High-Alert Dispatch Section (Flash Sale) */}
      <section className="py-12 bg-[#9B2B2C] relative overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                <span className="w-12 h-[2px] bg-white/50" />
                <span className="text-white text-[12px] font-black uppercase tracking-[0.4em]">FLASH SALE</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4">LIMITED OFFERS</h2>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Hurry up! Secure your favorites before they're gone</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center gap-4">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Ends In</p>
                <div className="flex gap-4">
                  {[
                    { val: '04', label: 'HR' },
                    { val: '22', label: 'MIN' },
                    { val: '59', label: 'SEC' },
                  ].map((t, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="bg-white text-[#9B2B2C] w-14 h-14 flex items-center justify-center text-2xl font-mono font-black border-2 border-white/50">{t.val}</div>
                      <span className="text-[8px] font-black text-white uppercase mt-2 tracking-widest">{t.label}</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {loadingProducts ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/10 animate-pulse border border-white/20" />
              ))
            ) : featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
