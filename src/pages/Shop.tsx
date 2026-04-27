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
    <div className="bg-slate-50/30 min-h-screen pb-20 font-sans relative overflow-x-hidden">
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10 py-6 md:py-10">
        {/* Sub-Header / Control Panel */}
        <div className="bg-white rounded-none shadow-xl p-4 md:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8 border-2 border-[#777]">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-slate-800 uppercase leading-none">Catalog_DIR</h1>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
               <div className="w-2 h-2 bg-[#9B2B2C] rounded-none animate-pulse" />
               INDEX_SIZE: {filteredProducts.length} RECORDS_FOUND
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="SEARCH_CATALOG..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#f8f8f8] border-2 border-[#777] rounded-none h-10 text-[11px] font-black uppercase tracking-widest focus-visible:ring-0 shadow-inner"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-none border-2 border-[#777] gap-3 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#f8f8f8] transition-all text-slate-700 shadow-md active:scale-95">
                  CATEGORY: {category}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white rounded-none p-2 shadow-xl border-2 border-[#777]">
                {categories.map(cat => (
                  <DropdownMenuItem key={cat} onClick={() => setCategory(cat)} className="text-[10px] font-black uppercase p-2.5 rounded-none focus:bg-[#f8f8f8] transition-colors cursor-pointer">
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-none border-2 border-[#777] gap-3 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#f8f8f8] transition-all text-slate-700 shadow-md active:scale-95">
                  SORT: {sort}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white rounded-none p-2 shadow-xl border-2 border-[#777]">
                {['Newest', 'Price: Low to High', 'Price: High to Low'].map(s => (
                  <DropdownMenuItem key={s} onClick={() => setSort(s)} className="text-[10px] font-black uppercase p-2.5 rounded-none focus:bg-[#f8f8f8] transition-colors cursor-pointer">
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Adsterra Slot 7 - Top of Shop */}
        {settings?.ads?.adsterra?.bannerFiveCode && (
           <div className="mb-12">
              <a href={settings.ads.adsterra.bannerFiveCode} target="_blank" rel="noopener noreferrer" className="block group">
                 <div className="bg-slate-900 rounded-none p-6 flex items-center justify-between border-2 border-slate-900 transition-all overflow-hidden relative shadow-lg">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    <div className="flex items-center gap-6 relative z-10">
                       <div className="w-14 h-14 bg-white rounded-none flex items-center justify-center text-slate-900 border-2 border-slate-900">
                          <Zap className="h-7 w-7 text-[#9B2B2C] fill-[#9B2B2C] animate-pulse" />
                       </div>
                       <div>
                          <h4 className="text-white text-base font-black uppercase tracking-widest mb-2 leading-none">PREMIUM MEMBER ACCESS UNLOCKED</h4>
                          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Authorized Session Active // SSL_SECURED</p>
                       </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-[#9B2B2C] px-8 py-3 rounded-none text-white text-[11px] font-black uppercase tracking-widest group-hover:bg-white group-hover:text-slate-900 transition-all relative z-10 shadow-lg">
                       CLICK_HERE <ArrowRight className="h-4 w-4" />
                    </div>
                 </div>
              </a>
           </div>
        )}

        {globalLoading && allProducts.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-none animate-pulse shadow-md p-4 border-2 border-[#777]">
                 <div className="w-full h-full bg-[#f8f8f8] rounded-none flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#9B2B2C] border-t-transparent animate-spin rounded-none" />
                 </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-none shadow-2xl border-2 border-[#777]">
            <div className="w-32 h-32 bg-[#f8f8f8] border-2 border-[#777] flex items-center justify-center mx-auto mb-10 shadow-inner rounded-none">
              <Search className="h-12 w-12 text-slate-300" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">NO_DATA_FOUND</h2>
            <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-12 max-w-sm mx-auto leading-relaxed">We couldn't find anything matching your current filters. Try refining your selection.</p>
            <Button 
              onClick={() => { setSearch(''); setCategory('All'); }}
              className="bg-slate-900 hover:bg-[#9B2B2C] text-white rounded-none h-14 px-12 text-[12px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              RESET_ALL_FILTERS
            </Button>
          </div>
        )}

        {/* Adsterra Slot 8 - Bottom of Shop */}
        {settings?.ads?.adsterra?.bannerSixCode && (
           <div className="mt-16">
              <a href={settings.ads.adsterra.bannerSixCode} target="_blank" rel="noopener noreferrer" className="block relative group">
                 <div className="bg-[#f8f8f8] rounded-none p-16 text-center hover:bg-white transition-all border-2 border-[#777] shadow-2xl relative overflow-hidden group">
                    <h5 className="text-[12px] font-black uppercase text-slate-400 tracking-[0.4em] mb-8">END_OF_CATALOG // ACCESSING_REDUNDANT_PROTOCOL</h5>
                    <div className="inline-block bg-slate-900 text-white px-12 py-5 font-black uppercase text-xl tracking-widest hover:bg-[#9B2B2C] transition-all rounded-none shadow-xl active:scale-95">
                       ACCESS PRIVATE DISPATCH LINK
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase mt-10 tracking-[0.5em]">Dispatch_ID: [REDACTED] // Global_Channel_01</p>
                 </div>
              </a>
           </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
