import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Product } from '../types';

const Shop = () => {
  const { products: allProducts, loading: globalLoading } = useProducts();
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
    <div className="bg-brand-bg min-h-screen pb-20 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Sub-Header / Control Panel */}
        <div className="bg-brand-secondary border border-[#777] shadow-sm p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
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
                <Button variant="outline" className="h-11 rounded-none border-[#777] bg-white gap-3 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-brand-secondary">
                  <SlidersHorizontal className="h-4 w-4 text-brand-primary" />
                  Category: {category}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-[#777] rounded-none p-1 shadow-2xl">
                {categories.map(cat => (
                  <DropdownMenuItem key={cat} onClick={() => setCategory(cat)} className="text-[10px] font-black uppercase p-3 focus:bg-brand-secondary">
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-none border-[#777] bg-white gap-3 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-brand-secondary">
                  Sort: {sort}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-[#777] rounded-none p-1 shadow-2xl">
                {['Newest', 'Price: Low to High', 'Price: High to Low'].map(s => (
                  <DropdownMenuItem key={s} onClick={() => setSort(s)} className="text-[10px] font-black uppercase p-3 focus:bg-brand-secondary">
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white/20 border-2 border-dashed border-[#777]/30">
            <div className="w-24 h-24 bg-brand-secondary border border-[#777] flex items-center justify-center mx-auto mb-8 shadow-xl">
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
      </div>
    </div>
  );
};

export default Shop;
