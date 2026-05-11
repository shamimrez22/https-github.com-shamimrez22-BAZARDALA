import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.affiliateLink) {
      window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Direct to WhatsApp if number exists, otherwise checkout
    if (settings?.whatsappNumber) {
      const text = `আসসালামু আলাইকুম, আমি এই প্রোডাক্টটি অর্ডার করতে চাই: \n\nনাম: ${product.name}\nদাম: ৳${product.price}\nলিঙ্ক: ${window.location.origin}/shop?q=${encodeURIComponent(product.name)}`;
      const url = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
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
      <div className="p-1 flex-1 flex flex-col pt-1 pb-1">
        {/* Title */}
        <div className="h-[22px] mb-0.5 overflow-hidden">
          <h3 
            className="font-bold text-slate-900 text-[9px] leading-tight line-clamp-2 hover:text-brand-primary transition-colors cursor-pointer uppercase"
            onClick={handleAction}
          >
            {product.name}
          </h3>
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-1 mb-1">
          <span className={`text-[7px] font-black uppercase tracking-tight ${product.stock > 0 || product.affiliateLink ? 'text-brand-primary' : 'text-rose-600'}`}>
            • {product.stock > 0 || product.affiliateLink ? 'IN STOCK' : 'OUT OF STOCK'}
          </span>
        </div>
        
        {/* Price Section */}
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-0.5">
              <span className="text-[12px] font-black text-slate-900 leading-none">
                <span className="text-[10px] mr-1">৳</span>{product.price.toLocaleString()}
              </span>
            </div>
            {product.oldPrice && product.oldPrice > 0 && (
              <span className="text-[7.5px] font-medium text-slate-400 line-through">
                ৳{product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          {product.discountPercentage && product.discountPercentage > 0 && (
            <div className="bg-brand-primary/5 border border-brand-primary/20 px-0.5 py-0.1 flex items-center justify-center">
              <span className="text-brand-primary text-[7.5px] font-bold">
                -{product.discountPercentage}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-1 pt-0 pb-1">
        <button
          className="w-full bg-brand-primary hover:opacity-90 text-white transition-all h-[26px] text-[10px] font-bold flex items-center justify-center gap-1 uppercase"
          disabled={product.stock === 0 && !product.affiliateLink}
          onClick={handleAction}
        >
          {settings?.whatsappNumber && !product.affiliateLink ? (
             <>
               <MessageCircle className="h-2.5 w-2.5" /> অর্ডার
             </>
           ) : (
             'অর্ডার করুন'
           )}
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
