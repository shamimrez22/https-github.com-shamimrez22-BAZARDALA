import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, CreditCard, Truck, Wallet, ShieldCheck, ArrowRight, ShoppingBag, MapPin, Phone, User, Zap } from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Determine if this is a direct order from a product page or a cart checkout
  const directOrder = location.state?.directOrder;
  const directProduct = location.state?.product;

  const displayItems = directOrder ? [directProduct] : cartItems;
  const displayTotal = directOrder ? directProduct.price * directProduct.quantity : cartTotal;

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phone: '',
    address: '',
    paymentMethod: 'cod' as 'cod' | 'bkash' | 'nagad',
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
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const shipping = displayTotal > 500 ? 0 : 60;
      const tax = displayTotal * 0.05;
      const grandTotal = displayTotal + shipping + tax;

      const orderData = {
        orderId,
        userId: user?.uid || 'guest',
        items: displayItems,
        total: grandTotal,
        status: 'pending',
        customerInfo: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        },
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
      };

      await Promise.all([
        addDoc(collection(db, 'orders'), orderData),
        addDoc(collection(db, 'notifications'), {
          message: `New order received: ${orderId}`,
          type: 'order',
          read: false,
          createdAt: serverTimestamp(),
        })
      ]);

      setOrderSuccess(orderId);
      if (!directOrder) clearCart();
      toast.success('অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('অর্ডার করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full px-8 text-center bg-white p-12 rounded-none shadow-2xl mx-4 border-2 border-[#777]"
        >
          <div className="w-32 h-32 bg-[#f8f8f8] border-2 border-[#777] rounded-none flex items-center justify-center mx-auto mb-10 shadow-inner relative">
            <CheckCircle2 className="h-16 w-16 text-[#9B2B2C] relative z-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tighter">PROTOCOL_COMPLETE</h1>
          <p className="text-slate-400 mb-10 text-[12px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-sm mx-auto">
            ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। <br /> 
            অর্ডার আইডি: <span className="text-[#9B2B2C] font-black px-3 py-1 bg-[#9B2B2C]/5 border border-[#9B2B2C] rounded-none ml-1 uppercase">{orderSuccess}</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Button 
              className="bg-slate-900 hover:bg-[#9B2B2C] py-7 rounded-none text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all" 
              onClick={() => navigate(`/tracking?id=${orderSuccess}`)}
            >
              TRACK_ORDER
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-[#777] bg-[#f8f8f8] py-7 rounded-none text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl active:scale-95" 
              onClick={() => navigate('/')}
            >
              RETURN_HOME
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const subtotal = displayTotal;
  const shipping = subtotal > 500 ? 0 : 60;
  const grandTotal = subtotal + shipping + (subtotal * 0.05);

  return (
    <div className="bg-slate-50/50 min-h-screen pb-20 overflow-x-hidden">
      {/* Dynamic Hero Header */}
      <div className="w-full bg-slate-900 py-12 px-8 md:px-12 lg:px-16 border-b-4 border-[#9B2B2C] relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
         <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">CHECKOUT_PROTOCOL</h1>
              <p className="text-white/40 text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em]">Final Step // Secure Ordering Protocol // SSL_V_01</p>
            </div>
            <div className="mt-8 md:mt-0 flex items-center gap-6 bg-white rounded-none border-2 border-slate-900 p-4 px-8 shadow-lg">
              <div className="flex flex-col items-end">
                <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Est. Delivery</span>
                <span className="text-slate-900 text-[12px] font-black uppercase">24-48 Hours</span>
              </div>
              <div className="w-10 h-10 bg-[#9B2B2C] rounded-none flex items-center justify-center text-white border-2 border-slate-900 shadow-lg">
                <Truck className="h-5 w-5" />
              </div>
            </div>
         </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-10">
            <Card className="border-2 border-[#777] shadow-2xl rounded-none overflow-hidden bg-white">
              <CardHeader className="bg-white border-b-2 border-[#777] p-8 md:p-10">
                <CardTitle className="flex items-center gap-6 text-2xl font-black uppercase tracking-tighter text-slate-800">
                  <div className="bg-[#f8f8f8] p-4 rounded-none text-[#9B2B2C] border-2 border-[#777] shadow-sm">
                    <Truck className="h-7 w-7" />
                  </div>
                  SHIPPING_DETAILS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                         NAME_INDEX
                      </Label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Full Name"
                          className="rounded-none border-2 border-[#777] bg-[#f8f8f8] h-14 pl-14 text-sm font-black uppercase tracking-widest focus-visible:ring-0 shadow-inner"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="phone" className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                         MOBILE_LINK
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="01XXXXXXXXX"
                          className="rounded-none border-2 border-[#777] bg-[#f8f8f8] h-14 pl-14 text-sm font-black uppercase tracking-widest focus-visible:ring-0 shadow-inner"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="address" className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                       DESTINATION_ADDRESS
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-6 h-5 w-5 text-slate-400" />
                      <textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="House No, Road No, Area, District..."
                        className="w-full rounded-none border-2 border-[#777] bg-[#f8f8f8] p-6 pl-14 text-sm font-black uppercase tracking-widest focus-visible:ring-0 shadow-inner min-h-[140px] appearance-none focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-10 border-t-2 border-[#777]">
                    <Label className="text-[13px] font-black uppercase tracking-widest text-slate-800 mb-8 block border-b border-[#777] pb-2 inline-block">Select Payment Channel</Label>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(val: any) => setFormData({ ...formData, paymentMethod: val })}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      {[
                        { id: 'cod', label: 'Cash Delivery', icon: Wallet, color: 'text-blue-600' },
                        { id: 'bkash', label: 'BKASH_PG', icon: Zap, color: 'text-pink-600' },
                        { id: 'nagad', label: 'NAGAD_PG', icon: Zap, color: 'text-orange-600' },
                      ].map((method) => (
                        <div key={method.id} onClick={() => setFormData({ ...formData, paymentMethod: method.id as any })} className={`flex items-center space-x-4 border-2 p-5 rounded-none cursor-pointer transition-all relative overflow-hidden ${formData.paymentMethod === method.id ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-[#f8f8f8] border-[#777] text-slate-600 hover:bg-white'}`}>
                           <div className={`w-8 h-8 rounded-none flex items-center justify-center border-2 border-slate-900 ${formData.paymentMethod === method.id ? 'bg-white' : 'bg-white shadow-sm'}`}>
                              <method.icon className={`h-4 w-4 ${formData.paymentMethod === method.id ? 'text-slate-900' : method.color}`} />
                           </div>
                           <Label htmlFor={method.id} className="flex flex-col gap-1 cursor-pointer">
                            <span className="text-[11px] font-black uppercase tracking-widest">{method.label}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest opacity-60`}>Verified Method</span>
                          </Label>
                          {formData.paymentMethod === method.id && (
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#9B2B2C] rounded-none animate-pulse" />
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-16 bg-slate-900 hover:bg-[#9B2B2C] text-white font-black uppercase tracking-[0.2em] rounded-none mt-10 shadow-xl active:scale-95 text-base transition-all group relative overflow-hidden"
                    disabled={loading}
                  >
                    {loading ? 'PROCESSING_PROTOCOL...' : (
                      <span className="flex items-center justify-center gap-6 relative z-10">
                        CONFIRM_ORDER_NOW <ArrowRight className="h-6 w-6 group-hover:translate-x-3 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              {[
                { icon: ShieldCheck, title: 'SECURE', desc: 'IDENTITY VERIFIED' },
                { icon: Zap, title: 'EXPRESS', desc: 'PRIORITY DISPATCH' },
                { icon: Truck, title: 'TRUSTED', desc: 'GLOBAL LOGISTICS' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-6 bg-white rounded-none shadow-md border-2 border-[#777]">
                  <div className="w-12 h-12 bg-[#f8f8f8] border-2 border-[#777] rounded-none flex items-center justify-center shadow-inner">
                    <item.icon className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800">{item.title}</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-[#777] shadow-xl rounded-none overflow-hidden bg-white sticky top-24">
                <CardHeader className="bg-slate-900 border-none p-8 md:p-10">
                  <CardTitle className="text-white text-lg font-black uppercase tracking-[0.3em]">DISPATCH_CART</CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-10">
                  <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {displayItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start bg-[#f8f8f8] border-2 border-transparent hover:border-[#777] rounded-none p-4 group transition-colors shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-white rounded-none overflow-hidden shadow-sm border-2 border-[#777]">
                            <img src={item?.image || 'https://picsum.photos/seed/placeholder/200/200'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-slate-800 uppercase leading-tight mb-2">{item?.name || 'Item'}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UNIT_X{item?.quantity || 1}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-slate-900 tracking-tighter">৳{((item?.price || 0) * (item?.quantity || 1)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-5 pt-8 border-t-2 border-[#777]">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                      <span>Base Total</span>
                      <span className="text-slate-800">৳{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                      <span>Logistics</span>
                      <span className={`${subtotal > 500 ? 'text-green-600' : 'text-slate-800'}`}>
                        {subtotal > 500 ? 'FREE_DISPATCH' : '৳60'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                      <span>Tax (5.0%)</span>
                      <span className="text-slate-800">৳{(subtotal * 0.05).toLocaleString()}</span>
                    </div>
                    
                    <div className="pt-8 border-t-2 border-[#777] mt-4">
                      <div className="bg-[#f8f8f8] rounded-none p-8 space-y-2 group shadow-inner border border-[#777]">
                        <span className="text-[10px] font-black text-[#9B2B2C] uppercase tracking-[0.4em] mb-2 block opacity-60">GRAND_TOTAL</span>
                        <div className="flex items-baseline gap-2">
                           <span className="text-3xl font-black text-slate-900 tracking-tighter">৳{grandTotal.toLocaleString()}</span>
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">BDT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
             </Card>

            <div className="mt-8 p-6 bg-yellow-50 rounded-none border-2 border-yellow-200 flex items-center gap-4 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-yellow-600 outline-none" />
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-800 leading-relaxed">
                  Your payment session is protected with 256-bit SSL encryption for secure checkout protocol.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
