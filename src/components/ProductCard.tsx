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

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.affiliateLink) {
      window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
      return;
    }
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-none group relative flex flex-col h-full overflow-hidden"
    >
      {/* Product Image */}
      <div 
        className="relative aspect-[4/5] bg-slate-50 cursor-pointer overflow-hidden"
        onClick={handleAction}
      >
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {product.stock === 0 && !product.affiliateLink && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
            <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-none">
              STOCK OUT
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col pt-2 pb-1">
        {/* Title */}
        <div className="h-[36px] mb-1.5 overflow-hidden">
          <h3 
            className="font-bold text-slate-900 text-[13px] leading-[1.4] line-clamp-2 hover:text-brand-primary transition-colors cursor-pointer uppercase tracking-tight"
            onClick={handleAction}
          >
            {product.name}
          </h3>
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className={`w-1.5 h-1.5 rounded-none ${product.stock > 0 || product.affiliateLink ? 'bg-brand-primary' : 'bg-red-500'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${product.stock > 0 || product.affiliateLink ? 'text-brand-primary' : 'text-red-500'}`}>
            {product.stock > 0 || product.affiliateLink ? 'IN STOCK' : 'OUT OF STOCK'}
          </span>
        </div>
        
        {/* Price Section */}
        <div className="flex items-end justify-between mt-auto mb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[18px] font-black text-slate-900">
                <span className="text-brand-primary">৳</span> {product.price.toLocaleString()}
              </span>
            </div>
            {product.oldPrice && product.oldPrice > 0 && (
              <span className="text-[12px] font-bold text-slate-400 line-through">
                ৳{product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          {product.discountPercentage && product.discountPercentage > 0 && (
            <div className="bg-[#e0f7f7] border border-[#b2ebeb] px-2 py-1 flex items-center justify-center">
              <span className="text-brand-primary text-[11px] font-bold">
                -{product.discountPercentage}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button - Full Width at Bottom */}
      <div className="flex w-full h-[52px]">
        <button
          className="w-full bg-brand-primary hover:bg-[#88705c] text-white transition-all text-[12px] font-black border-t border-brand-primary flex items-center justify-center gap-1.5 uppercase tracking-tighter"
          disabled={product.stock === 0 && !product.affiliateLink}
          onClick={handleAction}
        >
          অর্ডার করুন
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
