import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Truck, 
  ArrowRight, 
  MapPin, 
  Phone, 
  User, 
  MessageCircle,
  Hash,
  Ruler,
  X
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

const Checkout = () => {
  const location = useLocation();
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('L');

  // Determine if this is a direct order from a product page or a cart checkout
  const directOrder = location.state?.directOrder;
  const directProduct = location.state?.product;

  const displayItems = directOrder ? [directProduct] : cartItems;
  const displayTotal = directOrder ? directProduct.price * (directProduct.quantity || 1) : cartTotal;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    quantity: directProduct?.quantity || 1,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    // If no items in cart and not a direct order, redirect home
    if (!directOrder && cartItems.length === 0 && !orderSuccess) {
      navigate('/shop');
    }
  }, [cartItems, directOrder, navigate, orderSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.address || !formData.name) {
      toast.error('সবগুলো ঘর পূরণ করুন');
      return;
    }

    setLoading(true);
    try {
      const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const orderItems = displayItems.map(item => ({
        ...item,
        size: selectedSize,
        quantity: formData.quantity
      }));

      const orderData = {
        orderId,
        userId: user?.uid || 'guest',
        items: orderItems,
        total: displayTotal * formData.quantity,
        status: 'pending',
        customerInfo: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        },
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
      };

      // Perform order creation first
      const orderPromise = addDoc(collection(db, 'orders'), orderData);
      
      // Fire and forget notification
      addDoc(collection(db, 'notifications'), {
        message: `New order received: ${orderId}`,
        type: 'order',
        read: false,
        createdAt: serverTimestamp(),
      }).catch(err => console.warn('Notification error (ignoring):', err));

      try {
        await orderPromise;
        setOrderSuccess(orderId);
        if (!directOrder) clearCart();
        toast.success('অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'orders');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('অর্ডার করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="w-full min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 relative">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white border border-slate-100 relative p-12 text-center"
        >
          {/* Close Button UI */}
          <button 
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 w-10 h-10 bg-black text-white flex items-center justify-center hover:bg-brand-primary transition-colors active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon Area */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-brand-primary/5 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-full h-full border-4 border-brand-primary rounded-full flex items-center justify-center bg-white">
               <div className="relative">
                 <CheckCircle2 className="h-14 w-14 text-brand-primary" />
                 {/* Decorative Confetti Effect Dots */}
                 <div className="absolute -top-6 -right-6">
                    <div className="w-2 h-2 bg-brand-primary rounded-full absolute animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1.5 h-1.5 bg-brand-primary/40 rounded-full absolute top-4 -right-2 animate-ping" />
                    <div className="w-1 h-1 bg-brand-primary/60 rounded-full absolute -top-2 right-4 animate-pulse" />
                 </div>
               </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-6 tracking-tight">THANK YOU</h1>
          
          <div className="w-24 h-1 bg-brand-primary mx-auto mb-8" />
          
          <p className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed mb-12">
            আমাদের এক জন প্রতিনিধি যত দ্রুত সম্ভব আপনার সাথে যোগাযোগ করবে
          </p>

          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">{settings?.siteName || 'SMART HAAT'}</h4>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80">{settings?.siteDescription || 'PREMIUM MARKET PLACE'}</p>
          </div>
          
          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-4">
             <Button 
                variant="outline"
                className="w-full h-12 border border-slate-200 rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                onClick={() => navigate(`/tracking?id=${orderSuccess}`)}
             >
               VIEW_ORDER_ID: {orderSuccess}
             </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentItem = displayItems[0];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-6 md:py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-white border border-slate-100 relative flex flex-col md:flex-row overflow-hidden"
      >
        {/* Close Button UI representation since it's a modal look */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-slate-900 text-white flex items-center justify-center hover:bg-brand-primary transition-colors active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Column: Product Info */}
        <div className="w-full md:w-[42%] p-6 md:p-10 bg-slate-50 flex flex-col">
          <div className="w-full aspect-square bg-white border border-slate-200 mb-8 overflow-hidden group">
            <img 
              src={currentItem?.image || currentItem?.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400'} 
              alt={currentItem?.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight leading-tight mb-4">
              {currentItem?.name || 'PREMIUM_UNIT_ITEM'}
            </h2>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-3xl font-black text-brand-primary tracking-tighter">৳{(currentItem?.price || 0).toLocaleString()}</span>
            </div>

            <div className="bg-white border border-slate-200 p-6 space-y-4">
               <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-brand-primary" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">DELIVERY INFO</h3>
               </div>
               <div className="space-y-2">
                 <p className="text-[12px] font-bold text-slate-500">ঢাকার ভিতরে: <span className="text-brand-primary font-black uppercase">FREE</span></p>
                 <p className="text-[12px] font-bold text-slate-500">ঢাকার বাইরে: <span className="text-brand-primary font-black uppercase">FREE</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Form */}
        <div className="w-full md:w-[58%] p-6 md:p-12 flex flex-col bg-white">
          <div className="mb-10">
            <h1 className="text-2xl md:text-4xl font-serif font-black text-slate-900 leading-none mb-1">ORDER NOW</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">PREMIUM SECURE CHECKOUT</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Ruler className="h-3 w-3" /> SIZE
                 </Label>
                 <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 flex items-center justify-center text-[11px] font-black transition-all ${selectedSize === size ? 'bg-brand-primary text-white scale-110' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                      >
                        {size}
                      </button>
                    ))}
                 </div>
               </div>

               <div className="space-y-3">
                 <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash className="h-3 w-3" /> QTY
                 </Label>
                 <div className="relative">
                   <Input 
                     type="number"
                     min="1"
                     value={formData.quantity}
                     onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                     className="h-12 bg-slate-50 border-slate-200 rounded-none font-black text-slate-900 border-none shadow-inner"
                   />
                 </div>
               </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <User className="h-3 w-3" /> NAME
              </Label>
              <Input 
                placeholder="ENTER YOUR NAME"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-14 bg-slate-50 border-slate-200 rounded-none font-black text-slate-900 placeholder:text-slate-300 tracking-widest border-none shadow-inner px-6"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Phone className="h-3 w-3" /> PHONE
              </Label>
              <Input 
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-14 bg-slate-50 border-slate-200 rounded-none font-black text-slate-900 placeholder:text-slate-300 tracking-widest border-none shadow-inner px-6"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <MapPin className="h-3 w-3" /> ADDRESS
              </Label>
              <textarea 
                placeholder="HOUSE, ROAD, AREA, CITY"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-32 bg-slate-50 border-slate-200 rounded-none font-black text-slate-900 placeholder:text-slate-300 tracking-widest border-none shadow-inner p-6 focus:outline-none resize-none"
                required
              />
            </div>

            <div className="pt-4 space-y-4">
              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-brand-primary hover:opacity-90 text-white text-lg font-bold uppercase rounded-none active:scale-95 transition-all"
              >
                {loading ? 'প্রক্রিয়াধীন...' : 'অর্ডার নিশ্চিত করুন'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  if (settings?.whatsappNumber) {
                    const text = `আসসালামু আলাইকুম, আমি অর্ডার সংক্রান্ত বিষয় নিয়ে কথা বলতে চাই।`;
                    const url = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                  } else {
                    toast.error('WhatsApp support is not configured');
                  }
                }}
                className="w-full h-12 border border-brand-primary text-brand-primary font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-brand-primary/5 transition-all text-[11px] active:scale-95 rounded-none"
              >
                <MessageCircle className="h-5 w-5" /> CHAT WITH ADMIN
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;
