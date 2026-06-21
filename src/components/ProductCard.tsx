import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  // Parse or determine the unit (KG, DOZEN, PC, etc.)
  const getProductUnit = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('kg') || lowerName.includes('কেজি')) return 'KG';
    if (lowerName.includes('dozen') || lowerName.includes('ডজন')) return 'DOZEN';
    if (lowerName.includes('gm') || lowerName.includes('গ্রাম')) return 'GM';
    if (lowerName.includes('pc') || lowerName.includes('piece') || lowerName.includes('টি') || lowerName.includes('কলা')) return 'Pc';
    return 'KG';
  };

  const unit = getProductUnit(product.name);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0 && !product.affiliateLink) return;
    addToCart(product, quantity);
    toast.success(`${quantity} ${unit} ${product.name} যোগ করা হয়েছে!`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0 && !product.affiliateLink) return;
    
    if (product.affiliateLink) {
      window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
      return;
    }

    // Add to cart to guarantee checkout sync
    addToCart(product, quantity);

    // Direct order path
    navigate('/checkout', { 
      state: { 
        directOrder: true, 
        product: {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image,
          quantity: quantity,
          deliveryChargeInsideDhaka: product.deliveryChargeInsideDhaka || 60,
          deliveryChargeOutsideDhaka: product.deliveryChargeOutsideDhaka || 120,
        } 
      } 
    });
  };

  const discountVal = product.discountPercentage || 
    (product.oldPrice && product.oldPrice > product.price 
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
      : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-slate-200 rounded-none group relative flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {/* Product Image Panel */}
      <div 
        className="relative aspect-square bg-[#fff] cursor-pointer overflow-hidden border-b border-slate-100 w-full"
        onClick={handleBuyNow}
      >
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Stock Out Overlay */}
        {product.stock === 0 && !product.affiliateLink && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10 animate-fade-in">
            <span className="bg-red-500 text-white text-[8px] xs:text-[9px] font-black tracking-widest px-1.5 py-1 xs:px-3 xs:py-1.5 uppercase rounded-none shadow-lg">
              STOCK OUT
            </span>
          </div>
        )}

        {/* Ribbons / Badges in Top Right */}
        {product.stock > 0 && discountVal > 0 && (
          <div className="absolute top-1 right-1 xs:top-2 xs:right-2 z-10">
            <div className="bg-[#00a878] text-white text-[7px] xs:text-[8px] md:text-[9.5px] font-black px-1.5 py-0.5 xs:px-2.5 xs:py-1 tracking-wider uppercase shadow-xs">
              SAVE {discountVal}%
            </div>
          </div>
        )}

        {/* Action WhatsApp Floating Quick Order */}
        {settings?.whatsappNumber && product.stock > 0 && !product.affiliateLink && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const message = encodeURIComponent(`Hi, I want to order ${quantity} ${unit} of ${product.name}\nPrice: ৳${product.price * quantity}\nLink: ${window.location.origin}/shop?productId=${product.id}`);
              window.open(`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
            }}
            className="absolute bottom-1.5 right-1.5 xs:bottom-2 xs:right-2 z-10 w-6 h-6 xs:w-8 xs:h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
            title="Order on WhatsApp"
          >
             <MessageCircle className="h-3 w-3 xs:h-4 xs:w-4 fill-white text-white" />
          </button>
        )}
      </div>

      {/* Details Area */}
      <div className="p-1.5 xs:p-2.5 md:p-3 flex flex-col flex-1">
        {/* Title */}
        <h3 
          onClick={handleBuyNow}
          className="font-black text-slate-800 text-[9px] xs:text-[10px] md:text-[11.5px] lg:text-[12px] leading-tight line-clamp-2 uppercase min-h-[22px] xs:min-h-[26px] md:min-h-[34px] hover:text-[#f95e26] cursor-pointer transition-colors"
        >
          {product.name}
        </h3>

        {/* Spec / Weight Badge */}
        <div className="mt-1 mb-1.5">
          <span className="inline-block bg-[#e2f7f1] text-[#007f61] text-[7.5px] xs:text-[8px] md:text-[9px] font-black px-1.5 py-0.5 xs:px-2 tracking-wider uppercase">
             1 {unit}
          </span>
        </div>

        {/* Price & Discount details */}
        <div className="flex flex-col mt-auto pb-1.5 xs:pb-2">
          <div className="flex items-baseline gap-1 xs:gap-1.5 flex-wrap">
            <span className="text-[11px] xs:text-[12.5px] md:text-[14.5px] lg:text-[15.5px] font-black text-[#f95e26]">
              ৳{product.price.toLocaleString()}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-[8.5px] xs:text-[9.5px] md:text-[10.5px] lg:text-[11px] font-medium text-slate-400 line-through">
                ৳{product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Slashed flat amount savings discount block directly below prices */}
          {product.oldPrice && product.oldPrice > product.price && (
            <div className="mt-0.5 xs:mt-1 text-left">
              <span className="inline-block border border-[#d2f4ea] bg-[#f4faee] text-[#4d7c0f] text-[7.5px] xs:text-[8px] md:text-[9px] font-black px-1.5 py-0.5 xs:px-2 tracking-wider">
                ৳{Math.round(product.oldPrice - product.price).toLocaleString()} অফ
              </span>
            </div>
          )}
        </div>

        {/* ADD and BUY side-by-side action controls */}
        <div className="grid grid-cols-2 gap-1 xs:gap-1.5 mt-auto pt-1 md:pt-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0 && !product.affiliateLink}
            className="border border-[#f95e26] bg-white hover:bg-orange-50 text-[#f95e26] disabled:opacity-50 transition-all h-7 xs:h-8 md:h-9 text-[8px] xs:text-[9px] md:text-[10px] font-black flex items-center justify-center gap-0.5 xs:gap-1 uppercase rounded-none select-none cursor-pointer"
          >
            <ShoppingCart className="h-3 w-3 xs:h-3.5 xs:w-3.5" /> ADD
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={product.stock === 0 && !product.affiliateLink}
            className="bg-[#f95e26] hover:bg-orange-600 active:scale-[0.98] text-white disabled:opacity-50 transition-all h-7 xs:h-8 md:h-9 text-[8px] xs:text-[9px] md:text-[10px] font-black flex items-center justify-center uppercase rounded-none tracking-wider select-none cursor-pointer"
          >
             BUY
          </button>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';
