import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-32 h-32 bg-[#f8f8f8] border-2 border-[#777] rounded-none flex items-center justify-center mx-auto mb-10 shadow-inner">
          <ShoppingBag className="h-16 w-16 text-[#777]/30" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tighter">EMPTY_BAG_DETECTED</h1>
        <p className="text-slate-400 mb-10 max-w-sm mx-auto text-[12px] font-black uppercase tracking-[0.2em] leading-relaxed">
          Looks like you haven't added anything to your cart yet. Explore our latest collections.
        </p>
        <Button size="lg" className="bg-slate-900 hover:bg-[#9B2B2C] rounded-none h-14 px-12 text-[12px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all" asChild>
          <Link to="/shop">EXPLORE_SHOP</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/30 min-h-screen py-16">
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10 max-w-7xl mx-auto">
        <div className="mb-12 border-b-2 border-[#9B2B2C] pb-6">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">Shopping_Bag</h1>
          <div className="flex items-center gap-3 mt-4">
             <div className="w-2 h-2 bg-[#9B2B2C] rounded-none animate-pulse" />
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Review your items for priority dispatch protocol</p>
          </div>
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
                className="flex flex-col md:flex-row items-center gap-8 p-6 md:p-8 bg-white rounded-none shadow-lg border-2 border-[#777] group transition-all"
              >
                <div className="w-32 h-32 rounded-none overflow-hidden bg-[#f8f8f8] flex-shrink-0 shadow-sm border-2 border-[#777]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <p className="text-[10px] font-black text-[#9B2B2C] uppercase tracking-[0.3em] mb-2">AUTH_ID: {item.productId.slice(0,8).toUpperCase()}</p>
                  <h3 className="font-black text-xl text-slate-800 mb-3 line-clamp-1 uppercase tracking-tight">{item.name}</h3>
                  <p className="text-[#9B2B2C] text-lg font-black tracking-tight">৳{item.price.toLocaleString()}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 mt-6">
                    <div className="flex items-center bg-[#f8f8f8] border-2 border-[#777] rounded-none p-1 shadow-inner">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-none hover:bg-white transition-all border-r border-[#777]"
                      >
                        <Minus className="h-4 w-4 text-[#9B2B2C]" />
                      </button>
                      <span className="w-12 text-center text-[13px] font-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-none hover:bg-white transition-all border-l border-[#777]"
                      >
                        <Plus className="h-4 w-4 text-[#9B2B2C]" />
                      </button>
                    </div>
                    <button
                      className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-2 group/btn"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <div className="w-10 h-10 rounded-none bg-red-50 border border-red-200 flex items-center justify-center group-hover/btn:bg-red-100 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest">REMOVE_ITEM</span>
                    </button>
                  </div>
                </div>
                <div className="md:text-right w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-[#777]/20">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">UNIT_TOTAL</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">৳{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-none p-10 shadow-2xl sticky top-24 border-2 border-[#777]">
              <h2 className="text-2xl font-black text-slate-800 mb-10 uppercase tracking-tighter border-b-2 border-[#777] pb-4">SUMMARY_DIR</h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-widest text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-800">৳{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-widest text-slate-400">
                  <span>Logistics</span>
                  <span className={`${total > 500 ? 'text-green-600' : 'text-slate-800'}`}>
                    {total > 500 ? 'FREE_DISPATCH' : '৳60'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-widest text-slate-400">
                  <span>Tax (5.0%)</span>
                  <span className="text-slate-800">৳{(total * 0.05).toLocaleString()}</span>
                </div>
                
                <div className="pt-10 border-t-2 border-[#777]">
                   <div className="bg-[#f8f8f8] rounded-none p-8 shadow-inner relative overflow-hidden group border border-[#777]">
                      <span className="text-[10px] font-black text-[#9B2B2C] uppercase tracking-[0.4em] mb-3 block">GRAND_TOTAL</span>
                      <div className="flex items-baseline gap-2">
                         <span className="text-4xl font-black text-slate-900 tracking-tighter">
                            ৳{(total + (total > 500 ? 0 : 60) + total * 0.05).toLocaleString()}
                         </span>
                         <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">BDT</span>
                      </div>
                   </div>
                </div>
              </div>

              <Button
                className="w-full h-16 bg-slate-900 hover:bg-[#9B2B2C] text-white rounded-none font-black uppercase text-[15px] tracking-[0.2em] shadow-xl active:scale-95 transition-all group"
                onClick={() => navigate('/checkout')}
              >
                CHECKOUT_NOW <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              
              <div className="mt-8 flex items-center justify-center gap-3">
                 <ShieldCheck className="h-5 w-5 text-green-600" />
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                   AUTHORIZED_SECURE_CHANNEL
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
