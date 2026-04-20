import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Newest');

  useEffect(() => {
    fetchProducts();
  }, [category, sort]);

  const fetchProducts = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else {
      setLoading(true);
      setProducts([]);
    }

    try {
      const productsRef = collection(db, 'products');
      let q = query(productsRef, orderBy('createdAt', 'desc'), limit(24));

      if (category !== 'All') {
        q = query(productsRef, where('category', '==', category), orderBy('createdAt', 'desc'), limit(24));
      }

      if (sort === 'Price: Low to High') {
        q = query(productsRef, orderBy('price', 'asc'), limit(24));
        if (category !== 'All') q = query(productsRef, where('category', '==', category), orderBy('price', 'asc'), limit(24));
      } else if (sort === 'Price: High to Low') {
        q = query(productsRef, orderBy('price', 'desc'), limit(24));
        if (category !== 'All') q = query(productsRef, where('category', '==', category), orderBy('price', 'desc'), limit(24));
      }

      if (isLoadMore && lastDoc) {
        // Complex query rebuilding for startAfter
        if (category !== 'All') {
           if (sort === 'Price: Low to High') q = query(productsRef, where('category', '==', category), orderBy('price', 'asc'), startAfter(lastDoc), limit(24));
           else if (sort === 'Price: High to Low') q = query(productsRef, where('category', '==', category), orderBy('price', 'desc'), startAfter(lastDoc), limit(24));
           else q = query(productsRef, where('category', '==', category), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(24));
        } else {
           if (sort === 'Price: Low to High') q = query(productsRef, orderBy('price', 'asc'), startAfter(lastDoc), limit(24));
           else if (sort === 'Price: High to Low') q = query(productsRef, orderBy('price', 'desc'), startAfter(lastDoc), limit(24));
           else q = query(productsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(24));
        }
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Product));

      if (isLoadMore) {
        setProducts(prev => [...prev, ...data]);
      } else {
        setProducts(data);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 24);
    } catch (error) {
      console.error('Shop fetch error:', error);
      toast.error('Sync failed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const categories = ['All', 'Electronics', 'Fashion', 'Home Decor', 'Beauty', 'Sports'];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#f4e4d4] min-h-screen pb-20 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Sub-Header / Control Panel */}
        <div className="bg-[#ead9c4] border border-[#777] shadow-sm p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-[#9B2B2C] uppercase leading-none">Our Shop</h1>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#9B2B2C] rounded-full animate-pulse" />
               Products Found: {filteredProducts.length}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B2B2C]" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-white border-[#777] rounded-none h-11 text-xs font-bold uppercase tracking-tight focus-visible:ring-0 focus-visible:border-[#9B2B2C]"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-none border-[#777] bg-white gap-3 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-[#ead9c4]">
                  <SlidersHorizontal className="h-4 w-4 text-[#9B2B2C]" />
                  Category: {category}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-[#777] rounded-none p-1 shadow-2xl">
                {categories.map(cat => (
                  <DropdownMenuItem key={cat} onClick={() => setCategory(cat)} className="text-[10px] font-black uppercase p-3 focus:bg-[#ead9c4]">
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-none border-[#777] bg-white gap-3 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-[#ead9c4]">
                  Sort: {sort}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-[#777] rounded-none p-1 shadow-2xl">
                {['Newest', 'Price: Low to High', 'Price: High to Low'].map(s => (
                  <DropdownMenuItem key={s} onClick={() => setSort(s)} className="text-[10px] font-black uppercase p-3 focus:bg-[#ead9c4]">
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-[300px] bg-white border border-[#777] relative p-1 shadow-inner opacity-40">
                 <div className="w-full h-full border border-[#777]/20 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#9B2B2C] border-t-transparent animate-spin" />
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
            <div className="w-24 h-24 bg-[#ead9c4] border border-[#777] flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Search className="h-10 w-10 text-[#9B2B2C]" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">No Results</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-10 max-w-sm mx-auto">We couldn't find any items matching your search.</p>
            <Button 
              onClick={() => { setSearch(''); setCategory('All'); }}
              className="bg-[#9B2B2C] hover:bg-slate-900 text-white rounded-none h-12 px-10 text-[11px] font-black uppercase tracking-widest shadow-lg"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {hasMore && filteredProducts.length > 0 && (
          <div className="mt-16 flex justify-center">
            <Button 
              onClick={() => fetchProducts(true)} 
              disabled={loadingMore}
              className="bg-[#9B2B2C] hover:bg-slate-900 text-white font-black uppercase tracking-[0.3em] px-12 h-14 rounded-none shadow-[6px_6px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              {loadingMore ? 'Syncing...' : 'Load More Products'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
