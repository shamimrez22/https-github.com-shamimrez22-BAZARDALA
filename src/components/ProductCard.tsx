import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { useCart } from '../context/CartContext';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-[#777] shadow-sm hover:shadow-xl transition-all group relative flex flex-col"
    >
      {/* Visual Header / SKU ID */}
      <div className="bg-[#ead9c4] border-b border-[#777] px-2 py-1 flex justify-between items-center bg-opacity-50">
        <span className="text-[8px] font-black text-[#9B2B2C] uppercase tracking-tighter">Product_{product.name.slice(0, 3).toUpperCase()}</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-[#9B2B2C] rounded-full" />
          <div className="w-1 h-1 bg-[#9B2B2C] rounded-full opacity-30" />
        </div>
      </div>

      <div 
        className="relative aspect-square overflow-hidden bg-slate-50 border-b border-[#777]/20 cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
      >
        <img
          src={product.images?.[0] || 'https://picsum.photos/seed/product/400/400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
          referrerPolicy="no-referrer"
        />
        
        {/* Status Overlays */}
        {product.stock < 5 && product.stock > 0 && (
          <div className="absolute top-2 left-2 bg-[#9B2B2C] text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest border border-white">
            Low Stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1 uppercase tracking-[0.2em] border border-white">
              Sold Out
            </span>
          </div>
        )}

        {/* Hover Controls */}
        <div className="absolute inset-0 bg-[#9B2B2C]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`, { state: { product } });
            }}
            className="w-10 h-10 bg-white border border-[#777] flex items-center justify-center text-[#9B2B2C] hover:bg-[#9B2B2C] hover:text-white transition-all shadow-lg"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 bg-white border border-[#777] flex items-center justify-center text-[#9B2B2C] hover:bg-[#9B2B2C] hover:text-white transition-all shadow-lg"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col bg-white">
        <div className="flex items-center gap-2 mb-2">
           <div className="h-[1px] flex-1 bg-[#777]/20" />
           <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest whitespace-nowrap">{product.category}</p>
        </div>
        
        <h3 
          className="font-black text-slate-800 text-[11px] uppercase tracking-tight line-clamp-1 mb-3 group-hover:text-[#9B2B2C] transition-colors cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
        >
          {product.name}
        </h3>
        
        <div className="mt-auto flex items-end justify-between border-t border-[#777]/10 pt-4">
          <div className="flex flex-col">
            <span className="text-lg font-black text-[#9B2B2C] tracking-tighter font-mono leading-none">
              ৳{product.price.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pb-0.5">
            <div className="bg-[#ead9c4] px-1.5 py-0.5 border border-[#777]/30 flex items-center gap-1">
              <StarIcon className="h-2.5 w-2.5 text-[#9B2B2C]" />
              <span className="text-[10px] font-black text-slate-700">{product.ratings || 4.5}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-1 bg-[#ead9c4] border-t border-[#777]">
        <button
          className="w-full bg-[#9B2B2C] hover:bg-slate-900 text-white transition-all h-10 text-[10px] font-black uppercase tracking-[0.2em] disabled:bg-slate-300 disabled:opacity-50"
          disabled={product.stock === 0}
          onClick={(e) => {
            e.stopPropagation();
            if (product.affiliateLink) {
              window.open(product.affiliateLink, '_blank');
            } else {
              navigate(`/product/${product.id}`, { state: { product } });
            }
          }}
        >
          Order Now
        </button>
      </div>
    </motion.div>
  );
});

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
