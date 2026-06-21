import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  List,
  Leaf,
  Fish,
  Beef,
  ShoppingBag,
  Milk,
  Croissant,
  CupSoda,
  Home as HomeIcon,
  Zap,
  Truck
} from 'lucide-react';

import { collection, onSnapshot, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { SiteSettings, Product } from '../types';
import { safeStorage } from '../lib/storage';

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
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
    title: 'Daily Fresh Bazar',
    subtitle: 'Fresh Vegetables & Groceries',
    link: '/shop'
  }
];

const categories = [
  { name: 'Vegetables', icon: Leaf, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300' },
  { name: 'Fruits (ফলমূল)', icon: Leaf, img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=300' },
  { name: 'Fish (মাছ)', icon: Fish, img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=300' },
  { name: 'Meat (মাংস)', icon: Beef, img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=300' },
  { name: 'Grocery', icon: ShoppingBag, img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=300' },
  { name: 'Organic Honey (মধু)', icon: ShoppingBag, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=300' },
  { name: 'Dairy Products', icon: Milk, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300' },
  { name: 'Bakery & Breads', icon: Croissant, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300' },
  { name: 'Spices (মসলা)', icon: ShoppingBag, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300' },
  { name: 'Beverages', icon: CupSoda, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300' },
  { name: 'Cooking Essentials', icon: ShoppingBag, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300' },
  { name: 'Dry Fish (শুটকি)', icon: Fish, img: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=300' },
  { name: 'Snacks & Sweets', icon: Croissant, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=300' },
  { name: 'Baby Care (শিশুর)', icon: ShoppingBag, img: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=300' },
  { name: 'Household', icon: HomeIcon, img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=300' },
  { name: 'Personal Care', icon: HomeIcon, img: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=300' }
];

// Beautiful high-fidelity default products matching the screenshot exactly
const defaultProducts: Product[] = [
  {
    id: 'default-mango',
    name: 'BANGLA TAZA MANGO (মিষ্টি আম)',
    price: 80,
    oldPrice: 120,
    category: 'vegetables',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600'],
    description: 'Fresh and sweet mangoes directly from local organic orchards.',
    ratings: 5,
    discountPercentage: 33,
    createdAt: new Date()
  },
  {
    id: 'default-banana',
    name: 'FRESH PREMIUM BANANA (সবরি কলা)',
    price: 60,
    oldPrice: 80,
    category: 'vegetables',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=600'],
    description: 'Fresh organic yellow premium high grade table bananas.',
    ratings: 5,
    discountPercentage: 25,
    createdAt: new Date()
  },
  {
    id: 'default-apple',
    name: 'SELECT FRESH RED APPLE (মিষ্টি লাল আপেল)',
    price: 180,
    oldPrice: 220,
    category: 'vegetables',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=600'],
    description: 'Crisp, sweet, and selection-grade fresh red delicious apples.',
    ratings: 5,
    discountPercentage: 18,
    createdAt: new Date()
  },
  {
    id: 'default-cucumber',
    name: 'FRESH GREEN CUCUMBER (শশা)',
    price: 40,
    oldPrice: 60,
    category: 'vegetables',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1449300079324-96422037e465?auto=format&fit=crop&q=80&w=600'],
    description: 'Fresh and cool crunchy green cucumbers.',
    ratings: 5,
    discountPercentage: 33,
    createdAt: new Date()
  },
  {
    id: 'default-potato',
    name: 'DESH POTATO (গোল আলু)',
    price: 35,
    oldPrice: 50,
    category: 'vegetables',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600'],
    description: 'Premium organic homegrown potatoes.',
    ratings: 5,
    discountPercentage: 30,
    createdAt: new Date()
  },
  {
    id: 'default-currymeat',
    name: 'FRESH COCO CURRY MEAT (কারি খাসি মাংস)',
    price: 850,
    oldPrice: 950,
    category: 'meat',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=600'],
    description: 'Fresh healthy mutton curry cut meat.',
    ratings: 5,
    discountPercentage: 11,
    createdAt: new Date()
  },
  {
    id: 'default-spinach',
    name: 'FRESH RED SPINACH (লাল শাক)',
    price: 20,
    oldPrice: 30,
    category: 'vegetables',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=600'],
    description: 'Fresh red organic spinach bunch.',
    ratings: 5,
    discountPercentage: 33,
    createdAt: new Date()
  }
];

const SpecialOfferNode = ({ settings }: { settings: SiteSettings | null }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 37, seconds: 25 });

  useEffect(() => {
    if (!settings?.sidebar?.offerEndDateTime) {
      // relative countdown mode
      const defaultH = settings?.sidebar?.offerHours ?? 4;
      const defaultM = settings?.sidebar?.offerMinutes ?? 37;
      const defaultS = settings?.sidebar?.offerSeconds ?? 25;
      
      setTimeLeft({ hours: defaultH, minutes: defaultM, seconds: defaultS });

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          let s = prev.seconds - 1;
          let m = prev.minutes;
          let h = prev.hours;
          if (s < 0) {
            s = 59;
            m -= 1;
          }
          if (m < 0) {
            m = 59;
            h -= 1;
          }
          if (h < 0) {
            // Loop pattern
            h = defaultH;
            m = defaultM;
            s = defaultS;
          }
          return { hours: h, minutes: m, seconds: s };
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    // absolute date-time mode
    const calculateTimeLeft = () => {
      const difference = +new Date(settings.sidebar.offerEndDateTime!) - +new Date();
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      return { hours, minutes, seconds };
    };

    // Initial update
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [
    settings?.sidebar?.offerEndDateTime,
    settings?.sidebar?.offerHours,
    settings?.sidebar?.offerMinutes,
    settings?.sidebar?.offerSeconds
  ]);

  const promoImage = settings?.sidebar?.offerImageUrl || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=400';
  const promoLink = settings?.sidebar?.offerLink || '/shop';

  return (
    <div className="relative w-full h-[350px] overflow-hidden select-none group border border-slate-200 bg-white flex flex-col">
      <SmartLink to={promoLink} className="block w-full h-full relative">
        {/* Background Image full span */}
        <img
          src={promoImage}
          alt={settings?.sidebar?.offerTitle || 'Special Offer'}
          className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Safe Dark Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15 z-10" />

        {/* Top-Left Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-[#092d1d] border border-emerald-500/30 px-3 py-1.5 shadow-lg">
          <Zap className="h-3 w-3 text-emerald-400 fill-emerald-400 animate-pulse" />
          <span className="text-white text-[9px] font-black uppercase tracking-wider">
            SPECIAL OFFER
          </span>
        </div>

        {/* Top-Right Badge */}
        <div className="absolute top-4 right-4 z-20 bg-[#00a878] text-white text-[9px] font-black px-3 py-1.5 tracking-wider uppercase shadow-lg">
          -15% OFF
        </div>

        {/* Bottom Elements */}
        <div className="absolute bottom-4 inset-x-4 z-20 flex flex-col items-start">
          {/* Slashed/Skewed Tag */}
          <div className="inline-block transform -skew-x-12 bg-[#00aa81] px-3 py-1 shadow-md select-none">
            <span className="block transform skew-x-12 text-white font-black text-[9px] uppercase tracking-widest italic">
              SPECIAL OFFER
            </span>
          </div>

          {/* Banner Title */}
          <h3 className="mt-2 text-white font-black text-xs md:text-sm tracking-wide uppercase select-none leading-tight drop-shadow-md">
            {settings?.sidebar?.offerTitle || 'TAP TO APPLY COUPON DISCOUNT!'}
          </h3>

          {/* Real-time ticking Countdown */}
          <div className="w-full mt-3 border border-white/15 bg-black/40 backdrop-blur-xs flex items-center px-3 py-2">
            <span className="text-[8px] font-black tracking-widest text-[#00a878] uppercase mr-2.5">
              ENDS IN:
            </span>
            <div className="flex items-center gap-1 text-[10.5px] font-black tracking-wider leading-none">
              <span className="text-[#00ffcc] font-mono">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-white text-[8px] font-black px-0.5">H</span>
              <span className="text-white/40">:</span>
              <span className="text-[#00ffcc] font-mono">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-white text-[8px] font-black px-0.5">M</span>
              <span className="text-white/40">:</span>
              <span className="text-[#00ffcc] font-mono">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-white text-[8px] font-black px-0.5">S</span>
            </div>
          </div>
        </div>
      </SmartLink>
    </div>
  );
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [banners, setBanners] = useState<any[]>(() => {
    const cached = safeStorage.get('cached_banners');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed.length > 0 ? parsed : defaultBanners;
      } catch (e) {
        return defaultBanners;
      }
    }
    return defaultBanners;
  });
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const { products, loading: loadingProducts } = useProducts();

  const categoriesScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollCats = (dir: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const amt = dir === 'left' ? -240 : 240;
      categoriesScrollRef.current.scrollBy({ left: amt, behavior: 'smooth' });
    }
  };

  // Keep a reliable display array of items, falling back to gorgeous defaults
  const displayProducts = React.useMemo(() => {
    if (!products || products.length === 0) {
      return defaultProducts;
    }
    // Blend defaults at the end if we have fewer items, to keep layout extra full
    if (products.length < 6) {
      return [...products, ...defaultProducts.slice(0, 6 - products.length)];
    }
    return products;
  }, [products]);

  const topSelling = React.useMemo(() => displayProducts.slice(0, 6), [displayProducts]);
  const flashSell = React.useMemo(() => {
    if (displayProducts.length > 6) {
      return displayProducts.slice(1, 7);
    }
    return displayProducts.slice(0, 6);
  }, [displayProducts]);
  const specialOffers = React.useMemo(() => {
    if (displayProducts.length > 7) {
      return displayProducts.slice(2, 8);
    }
    // Use red spinach for special offers if available in default list
    const defaults = [...displayProducts];
    const redSpinach = defaultProducts.find(p => p.id === 'default-spinach');
    if (redSpinach && !defaults.some(d => d.id === 'default-spinach')) {
      defaults.push(redSpinach);
    }
    return defaults.slice(0, 6);
  }, [displayProducts]);

  useEffect(() => {
    // Realtime banner listener
    const unsub = onSnapshot(
      query(collection(db, 'slider_banners'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedBanners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBanners(fetchedBanners);
          safeStorage.set('cached_banners', JSON.stringify(fetchedBanners));
        } else {
          setBanners(defaultBanners);
        }
      },
      (error) => {
        console.error('Banners sync error:', error);
        setBanners(defaultBanners);
      }
    );

    // Realtime settings listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SiteSettings);
      }
    }, (error) => {
      console.error('Home settings sync error:', error);
    });

    // Realtime categories listener
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        setDbCategories(list);
      } else {
        setDbCategories([]);
      }
    }, (error) => {
      console.error('Home categories listen error:', error);
    });

    return () => {
      unsub();
      unsubSettings();
      unsubCategories();
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    const el = categoriesScrollRef.current;
    if (!el) return;

    const autoScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 160, behavior: 'smooth' });
      }
    };

    const count = dbCategories.length > 0 ? dbCategories.length : categories.length;
    if (count <= 1) return;

    const timer = setInterval(autoScroll, 2500);
    return () => {
      clearInterval(timer);
    };
  }, [dbCategories.length]);

  return (
    <div className="flex flex-col bg-[#fdfdfd] text-slate-800 pb-20 overflow-x-hidden">
      
      {/* 1. Hero Block with Dual-Menu Banners */}
      <section className="pt-2 md:pt-4 pb-2 w-full">
        <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
          <div className="flex flex-col lg:flex-row items-stretch w-full h-[110px] xs:h-[130px] sm:h-[240px] md:h-[300px] lg:h-[350px] gap-2 overflow-hidden bg-white">
            
            {/* Column 1: Special Offer Banner - hidden on mobile, visible on desktop */}
            <div className="hidden lg:flex lg:w-[325px] flex-shrink-0 flex-col">
              <SpecialOfferNode settings={settings} />
            </div>

            {/* Column 3: Slider Carousel Banner - visible always, now spans the full remaining width */}
            <div className="flex-1 relative bg-white border border-slate-200 overflow-hidden group h-full select-none">
              {banners.length === 0 ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-white">
                     <div className="text-center">
                        <div className="w-8 h-8 border-2 border-slate-100 border-t-orange-500 rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">LOADING BANNER</p>
                     </div>
                 </div>
              ) : (
                <div className="relative w-full h-full overflow-hidden">
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={currentSlide}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "tween", duration: 0.5, ease: "easeInOut" },
                        opacity: { duration: 0.3 }
                      }}
                      className="absolute inset-0 z-0 h-full w-full"
                    >
                      <SmartLink to={banners[currentSlide]?.link || '/shop'} className="block h-full w-full relative">
                        <img
                          src={banners[currentSlide].image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200'}
                          alt={banners[currentSlide].title || 'Slider Banner'}
                          loading="eager"
                          decoding="async"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {/* Overlay "SHOP NOW" Button Bottom-Left */}
                        <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 z-10 transition-transform duration-300 group-hover:translate-x-1">
                          <span className="inline-flex items-center gap-1.5 bg-[#f95e26] hover:bg-orange-600 active:scale-95 text-white font-black text-[9px] md:text-[12px] px-3.5 py-1.5 md:px-6 md:py-2.5 shadow-lg tracking-wide capitalize select-none rounded-none">
                            SHOP NOW <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                          </span>
                        </div>
                      </SmartLink>
                    </motion.div>
                  </AnimatePresence>

                  {/* Slider Control Arrows */}
                  {banners.length > 1 && (
                    <>
                      <button 
                        onClick={() => {
                          setDirection(-1);
                          setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/15 hover:bg-white text-white hover:text-orange-500 rounded-none transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 animate-fade-in"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setDirection(1);
                          setCurrentSlide((prev) => (prev + 1) % banners.length);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/15 hover:bg-white text-white hover:text-orange-500 rounded-none transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 animate-fade-in"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      
                      {/* Dots */}
                      <div className="absolute bottom-3 right-3 md:bottom-6 md:right-6 z-10 flex gap-1 bg-black/10 backdrop-blur-xs px-2 py-1 md:px-2.5 md:py-1.5 rounded-full">
                        {banners.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setDirection(i > currentSlide ? 1 : -1);
                              setCurrentSlide(i);
                            }}
                            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${
                              currentSlide === i ? 'bg-white scale-125' : 'bg-white/45'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section className="py-3 w-full bg-white border-y border-slate-100">
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />
        <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
          
          {/* Header row with arrows and green VIEW ALL button */}
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-[13px] md:text-[16px] font-black uppercase text-slate-800 tracking-tight leading-none">
                Featured Categories
              </h2>
              <p className="text-slate-400 text-[8px] md:text-[9.5px] font-bold uppercase tracking-wider mt-1">
                Choose your favorite categories from our variety for easy shopping
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => scrollCats('left')}
                className="w-7 h-7 border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => scrollCats('right')}
                className="w-7 h-7 border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-700 active:scale-95 transition-all mr-1.5 cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <Link 
                to="/shop" 
                className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-[9px] font-black uppercase px-4 py-1.5 flex items-center gap-1 transition-colors rounded-none shadow-sm"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Symmetrical Categories Row - Single-line horizontal scroll on all devices */}
          <div 
            ref={categoriesScrollRef}
            className="flex overflow-x-auto gap-1.5 pb-2 scrollbar-none scroll-smooth snap-x snap-mandatory"
          >
            {(dbCategories.length > 0 ? dbCategories : categories).map((cat: any, i: number) => {
              const imgUrl = cat.image || cat.img;
              const catSlug = cat.slug || cat.name.split(' (')[0].toLowerCase();
              return (
                <Link 
                  key={cat.id || i} 
                  to={`/shop?cat=${catSlug}`}
                  className="flex-shrink-0 w-[68px] xs:w-[80px] sm:w-[94px] md:w-[105px] flex flex-col items-center group bg-white border border-slate-200 hover:border-orange-400 p-1 transition-all duration-300 relative rounded-none hover:shadow-sm snap-start"
                >
                  <div className="w-full aspect-square overflow-hidden bg-[#fbfbfb] border border-slate-100 transition-all relative">
                    <img
                      src={imgUrl}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="hidden sm:block text-[9px] md:text-[9.5px] font-black uppercase tracking-wider text-slate-700 group-hover:text-orange-500 transition-colors mt-2 text-center truncate w-full">
                    {cat.name}
                  </h3>
                  {/* Micro blue underline style matching image theme */}
                  <div className="hidden sm:block h-0.5 w-0 bg-sky-400 group-hover:w-1/2 mt-1 transition-all duration-300" />
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. Top Selling Products */}
      <section className="py-6 w-full">
        <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">
          
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[13px] md:text-[16px] font-black uppercase text-slate-800 tracking-tight leading-none">
                🔥 Top Selling Products
              </span>
              <span className="bg-[#fff3e0] text-[#ff9800] text-[7.5px] md:text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider inline-block">
                Popular
              </span>
              <div className="w-full lg:w-auto">
                <p className="text-slate-400 text-[8px] md:text-[9.5px] font-bold uppercase tracking-wider mt-1.5">
                  Select recommendation dispatch at special auto export prices
                </p>
              </div>
            </div>
            <Link 
              to="/shop" 
              className="text-[#f95e26] hover:text-orange-600 text-[9.5px] md:text-[10px] font-black uppercase flex items-center gap-1 transition-colors select-none"
            >
              MORE HOT FOODS <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 xs:gap-1.5 md:gap-3.5">
            {loadingProducts && topSelling.length === 0 ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-50 animate-pulse border border-slate-200/40" />
              ))
            ) : (
              topSelling.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* 4. Flash Sell Section */}
      <section className="py-6 w-full">
        <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">

          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[13px] md:text-[16px] font-black uppercase text-slate-800 tracking-tight leading-none">
                ⚡ Flash Sell
              </span>
              <p className="text-slate-400 text-[8px] md:text-[9.5px] font-bold uppercase tracking-wider mt-1.5">
                Your absolute favorite bestsellers at a massive clearance discount now
              </p>
            </div>
            <Link 
              to="/shop" 
              className="text-[#2e7d32] hover:text-green-800 text-[9.5px] md:text-[10px] font-black uppercase flex items-center gap-1 transition-colors select-none"
            >
              SEE MORE SALES <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 xs:gap-1.5 md:gap-3.5">
            {loadingProducts && flashSell.length === 0 ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-50 animate-pulse border border-slate-200/40" />
              ))
            ) : (
              flashSell.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* 5. Special Offer Section */}
      <section className="py-6 w-full">
        <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4">

          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[13px] md:text-[16px] font-black uppercase text-slate-800 tracking-tight leading-none">
                🎁 Special Offer
              </span>
              <span className="bg-[#fce4ec] text-[#e91e63] text-[7.5px] md:text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider inline-block">
                Hot Details
              </span>
              <div className="w-full lg:w-auto">
                <p className="text-slate-400 text-[8px] md:text-[9.5px] font-bold uppercase tracking-wider mt-1.5">
                  Promotional dispatch discount and special gift coupons directly from Bazar slots
                </p>
              </div>
            </div>
            <Link 
              to="/shop" 
              className="text-[#f95e26] hover:text-orange-600 text-[9.5px] md:text-[10px] font-black uppercase flex items-center gap-1 transition-colors select-none"
            >
              MORE OFFERS <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 xs:gap-1.5 md:gap-3.5">
            {loadingProducts && specialOffers.length === 0 ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-50 animate-pulse border border-slate-200/40" />
              ))
            ) : (
              specialOffers.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
