import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-white border border-[#777] flex items-center justify-center mx-auto mb-6 shadow-xl">
          <ShoppingBag className="h-12 w-12 text-[#9B2B2C]" />
        </div>
        <h1 className="text-3xl font-black text-[#9B2B2C] mb-4 uppercase tracking-tighter">EMPTY_CART</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto text-[10px] font-black uppercase tracking-widest">
          Your shopping bag is empty. Start adding some products!
        </p>
        <Button size="lg" className="bg-[#9B2B2C] hover:bg-slate-900 rounded-none h-12 px-10 text-[11px] font-black uppercase tracking-widest shadow-lg" asChild>
          <Link to="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 border-b-2 border-[#9B2B2C] pb-4">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">SHOPPING_BAG</h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Review your products before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-6 p-4 bg-white border border-[#777] shadow-sm group"
            >
              <div className="w-24 h-24 border border-[#777]/20 overflow-hidden bg-white flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">PRODUCT_ID: {item.productId.slice(0,8)}</p>
                <h3 className="font-black text-slate-900 mb-1 uppercase tracking-tight truncate">{item.name}</h3>
                <p className="text-[#9B2B2C] font-black tracking-tighter font-mono">৳{item.price.toLocaleString()}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border border-[#777] bg-white h-8">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 hover:bg-slate-50 transition-colors"
                    >
                      <Minus className="h-3 w-3 text-[#9B2B2C]" />
                    </button>
                    <span className="px-3 text-[10px] font-black w-8 text-center border-x border-[#777]/30">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 hover:bg-slate-50 transition-colors"
                    >
                      <Plus className="h-3 w-3 text-[#9B2B2C]" />
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#9B2B2C] hover:bg-rose-50 font-black uppercase text-[9px] tracking-widest rounded-none"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">TOTAL_VAL</p>
                <p className="font-black text-slate-900 tracking-tighter font-mono">৳{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#777] p-8 shadow-xl sticky top-24">
            <h2 className="text-xl font-black text-[#9B2B2C] mb-8 uppercase tracking-tighter border-b border-[#9B2B2C]/20 pb-4">ORDER_SUMMARY</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">
                <span>SUBTOTAL</span>
                <span className="font-mono text-slate-900">৳{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">
                <span>SHIPPING</span>
                <span className={`${total > 500 ? 'text-green-600' : 'text-slate-900'} font-mono`}>
                  {total > 500 ? 'FREE' : '৳60'}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">
                <span>TAX (5%)</span>
                <span className="font-mono text-slate-900">৳{(total * 0.05).toLocaleString()}</span>
              </div>
              <div className="pt-6 border-t border-[#9B2B2C]/20 flex justify-between items-center">
                <span className="text-xs font-black text-[#9B2B2C] uppercase tracking-[0.2em]">GRAND_TOTAL</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter font-mono">
                  ৳{(total + (total > 500 ? 0 : 60) + total * 0.05).toLocaleString()}
                </span>
              </div>
            </div>
            <Button
              className="w-full h-12 bg-[#9B2B2C] hover:bg-slate-900 text-white rounded-none font-black uppercase text-[11px] tracking-widest shadow-2xl"
              onClick={() => navigate('/checkout')}
            >
              PROCEED_TO_CHECKOUT <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-center text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-6">
              SECURE CHECKOUT POWERED BY {settings?.siteName?.toUpperCase() || 'BAZAR DALA'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
