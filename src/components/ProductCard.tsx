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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-none shadow-sm hover:shadow-2xl transition-all group relative flex flex-col overflow-hidden border border-[#777]"
    >
      <div className="bg-[#f8f8f8] px-4 py-2 border-b border-[#777] flex justify-between items-center relative overflow-hidden">
        <div className="flex items-center gap-2 z-10">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PRODUCT_REF:</span>
          <span className="text-[10px] font-black text-[#9B2B2C] uppercase tracking-tighter">{product.name.slice(0, 5).toUpperCase()}</span>
        </div>
        <div className="flex gap-1 z-10">
          <div className="w-1.5 h-1.5 bg-[#9B2B2C] rounded-none" />
        </div>
      </div>

      <div 
        className="relative aspect-square overflow-hidden bg-white border-b border-[#777] cursor-pointer"
        onClick={() => navigate('/checkout', { 
          state: { 
            directOrder: true, 
            product: {
              productId: product.id,
              name: product.name,
              price: product.price,
              image: product.images?.[0] || product.image,
              quantity: 1
            } 
          } 
        })}
      >
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          referrerPolicy="no-referrer"
        />

        {/* Status Overlays */}
        {product.discountPercentage && product.discountPercentage > 0 && (
          <div className="absolute top-0 right-0 bg-[#9B2B2C] text-white text-[9px] font-black px-2 py-1 rounded-none z-10 uppercase tracking-widest">
            -{product.discountPercentage}%
          </div>
        )}
        
        {product.stock < 5 && product.stock > 0 && (
          <div className="absolute top-0 left-0 bg-white text-[#9B2B2C] text-[8px] font-black px-2 py-1 uppercase tracking-widest rounded-none flex items-center gap-1 border-b border-r border-[#777]">
            <span className="w-1 h-1 bg-[#9B2B2C] rounded-none animate-pulse" />
            STOCK_LOW
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <span className="bg-[#9B2B2C] text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-widest rounded-none">
              SOLD_OUT
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col bg-white relative">
        <div className="flex items-center gap-2 mb-1">
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{product.category}</span>
        </div>
        
        <h3 
          className="font-black text-slate-900 text-[12px] line-clamp-1 mb-2 hover:text-[#9B2B2C] transition-colors cursor-pointer uppercase tracking-tight"
          onClick={() => navigate('/checkout', { 
            state: { 
              directOrder: true, 
              product: {
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || product.image,
                quantity: 1
              } 
            } 
          })}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#777]/10">
          <div className="flex flex-col">
            {product.oldPrice && product.oldPrice > 0 && (
              <span className="text-[10px] font-black text-slate-300 line-through tracking-tighter">
                ৳{product.oldPrice.toLocaleString()}
              </span>
            )}
            <span className="text-base md:text-lg font-black text-[#9B2B2C] tracking-tighter">
              ৳{product.price.toLocaleString()}
            </span>
          </div>
          
          <button
            className="bg-slate-900 hover:bg-[#9B2B2C] text-white transition-all h-7 md:h-9 px-2 md:px-4 text-[8px] md:text-[10px] font-black uppercase tracking-tighter md:tracking-widest rounded-none shadow-md active:scale-95 disabled:bg-slate-300 border border-slate-900"
            disabled={product.stock === 0}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/checkout', { 
                state: { 
                  directOrder: true, 
                  product: {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images?.[0] || product.image,
                    quantity: 1
                  } 
                } 
              });
            }}
          >
            ORDER_NOW
          </button>
        </div>
      </div>
    </motion.div>
  );
});

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
