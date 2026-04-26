import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useSettings } from '../context/SettingsContext';
import { ProductCard } from '../components/ProductCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, SlidersHorizontal, ArrowRight, Zap, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Product } from '../types';

const Shop = () => {
  const { products: allProducts, loading: globalLoading } = useProducts();
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Newest');
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
    const timer = setTimeout(() => setShowSocialBar(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Local filtering and sorting for instant results
  const filteredProducts = allProducts
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All' || p.category === category;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sort === 'Price: Low to High') return (a.price || 0) - (b.price || 0);
      if (sort === 'Price: High to Low') return (b.price || 0) - (a.price || 0);
      // Newest (Default)
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

  const categories = ['All', ...new Set(allProducts.map(p => p.category).filter(Boolean))];

  return (
    <div className="bg-white min-h-screen pb-20 font-sans relative" onClick={handleGlobalClick}>
      {/* Social Bar Adsterra Floating Pop */}
      <AnimatePresence>
        {showSocialBar && settings?.ads?.adsterra?.socialBarCode && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-10 z-[100] w-72"
          >
            <div className="bg-white border-2 border-slate-900 shadow-[6px_6px_0px_#777] p-4 relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSocialBar(false); }}
                className="absolute -top-3 -right-3 w-6 h-6 bg-slate-900 text-white text-[10px] rounded-full flex items-center justify-center font-black"
              >
                X
              </button>
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 bg-slate-900 flex-shrink-0 flex items-center justify-center animate-bounce">
                   <Bell className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                   <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">Verified Secure</p>
                   <p className="text-[11px] font-black text-slate-800 uppercase leading-tight">Limited Catalog Access Unlocked!</p>
                </div>
              </div>
              <a 
                href={settings.ads.adsterra.socialBarCode} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-3 block w-full bg-brand-primary text-white text-center py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md"
              >
                Get Link Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        {/* Sub-Header / Control Panel */}
        <div className="bg-white border border-[#777] shadow-sm p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-brand-primary uppercase leading-none">Our Shop</h1>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
               Products Found: {filteredProducts.length}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-white border-[#777] rounded-none h-11 text-xs font-bold uppercase tracking-tight focus-visible:ring-0 focus-visible:border-brand-primary"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-none border-[#777] bg-white gap-3 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">
                  <SlidersHorizontal className="h-4 w-4 text-brand-primary" />
                  Category: {category}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-[#777] rounded-none p-1 shadow-2xl">
                {categories.map(cat => (
                  <DropdownMenuItem key={cat} onClick={() => setCategory(cat)} className="text-[10px] font-black uppercase p-3 focus:bg-slate-50">
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-none border-[#777] bg-white gap-3 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">
                  Sort: {sort}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-[#777] rounded-none p-1 shadow-2xl">
                {['Newest', 'Price: Low to High', 'Price: High to Low'].map(s => (
                  <DropdownMenuItem key={s} onClick={() => setSort(s)} className="text-[10px] font-black uppercase p-3 focus:bg-slate-50">
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Adsterra Slot 7 - Top of Shop */}
        {settings?.ads?.adsterra?.bannerFiveCode && (
           <div className="mb-8">
              <a href={settings.ads.adsterra.bannerFiveCode} target="_blank" rel="noopener noreferrer" className="block group">
                 <div className="bg-[#1a1a1a] border-b-4 border-brand-primary p-4 flex items-center justify-between hover:bg-slate-900 transition-all overflow-hidden relative">
                    <div className="flex items-center gap-4 relative z-10">
                       <div className="w-10 h-10 bg-brand-primary flex items-center justify-center text-white">
                          <Zap className="h-5 w-5 animate-pulse" />
                       </div>
                       <div>
                          <h4 className="text-white text-xs font-black uppercase tracking-widest">Premium Catalog Access</h4>
                          <p className="text-white/40 text-[8px] font-bold uppercase mt-1">Authorized User_Port_32 // Secure_Dispatch</p>
                       </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em] group-hover:bg-brand-primary transition-all relative z-10">
                       Click to Browse <ArrowRight className="h-3 w-3" />
                    </div>
                 </div>
              </a>
           </div>
        )}

        {globalLoading && allProducts.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-[300px] bg-brand-card border border-[#777] relative p-1 shadow-inner opacity-40">
                 <div className="w-full h-full border border-[#777]/20 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent animate-spin" />
                 </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white/20 border-2 border-dashed border-[#777]/30">
            <div className="w-24 h-24 bg-white border border-[#777] flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Search className="h-10 w-10 text-brand-primary" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">No Results</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-10 max-w-sm mx-auto">We couldn't find any items matching your search.</p>
            <Button 
              onClick={() => { setSearch(''); setCategory('All'); }}
              className="bg-brand-button hover:bg-slate-900 text-white rounded-none h-12 px-10 text-[11px] font-black uppercase tracking-widest shadow-lg"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Adsterra Slot 8 - Bottom of Shop */}
        {settings?.ads?.adsterra?.bannerSixCode && (
           <div className="mt-12">
              <a href={settings.ads.adsterra.bannerSixCode} target="_blank" rel="noopener noreferrer" className="block relative group">
                 <div className="bg-white border-4 border-dashed border-[#777] p-10 text-center hover:border-brand-primary transition-all">
                    <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-4">You've reached the end of the catalog</h5>
                    <div className="inline-block bg-slate-900 text-white px-10 py-3 font-black uppercase text-lg tracking-widest hover:bg-brand-primary transition-colors">
                       UNLOCK NEXT DISPATCH LINK
                    </div>
                    <p className="text-[7px] font-bold text-slate-400 uppercase mt-6 tracking-[0.6em]">System Protocol_77 // Global_Access_Verified</p>
                 </div>
              </a>
           </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
