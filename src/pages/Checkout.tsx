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
      toast.error('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full px-6 text-center"
        >
          <div className="w-24 h-24 bg-green-50 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">ORDER_SUCCESSFUL</h1>
          <p className="text-slate-500 mb-8 text-base font-black uppercase tracking-[0.2em] leading-relaxed">
            ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। <br /> 
            অর্ডার আইডি: <span className="text-[#9B2B2C] border-b-2 border-[#9B2B2C]">{orderSuccess}</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-sm mx-auto">
            <Button 
              className="bg-[#9B2B2C] hover:bg-slate-900 py-6 rounded-none text-sm font-black uppercase tracking-widest shadow-xl transition-all" 
              onClick={() => navigate(`/tracking?id=${orderSuccess}`)}
            >
              TRACK_ORDER
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-slate-900 py-6 rounded-none text-sm font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all" 
              onClick={() => navigate('/')}
            >
              BACK_TO_HOME
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
    <div className="bg-white min-h-screen pb-20 overflow-x-hidden">
      {/* Dynamic Hero Header */}
      <div className="w-full bg-[#9B2B2C] py-12 px-8 md:px-16 lg:px-32 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 10px, transparent 10px, transparent 20px)' }} />
         <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-2">COMPLETE_CHECKOUT</h1>
            <p className="text-white/60 text-sm md:text-base font-black uppercase tracking-[0.4em]">Final Step // Secure Ordering Protocol</p>
         </div>
         <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden lg:block opacity-20">
            <ShoppingBag className="w-48 h-48 text-white" />
         </div>
      </div>

      <div className="w-full px-8 md:px-16 lg:px-32 py-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-2 border-slate-900 shadow-[10px_10px_0px_#9B2B2C] rounded-none overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 border-b-2 border-slate-900 p-6">
                <CardTitle className="flex items-center gap-4 text-2xl font-black uppercase tracking-tighter text-slate-900">
                  <div className="bg-[#9B2B2C] p-2 text-white">
                    <Truck className="h-6 w-6" />
                  </div>
                  অর্ডারের তথ্য পূরণ করুন
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-[#9B2B2C] flex items-center gap-2">
                        <User className="h-4 w-4" /> আপনার নাম
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="লিখুন..."
                        className="rounded-none border-2 border-slate-900 h-12 px-4 text-sm font-black uppercase focus-visible:ring-0 focus-visible:border-[#9B2B2C]"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-black uppercase tracking-widest text-[#9B2B2C] flex items-center gap-2">
                        <Phone className="h-4 w-4" /> ফোন নাম্বার
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="01XXXXXXXXX..."
                        className="rounded-none border-2 border-slate-900 h-12 px-4 text-sm font-black uppercase focus-visible:ring-0 focus-visible:border-[#9B2B2C]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-sm font-black uppercase tracking-widest text-[#9B2B2C] flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> বিস্তারিত ঠিকানা
                    </Label>
                    <textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="আপনার জেলা, উপজেলা এবং রোডের নাম বিস্তারিত লিখুন..."
                      className="w-full rounded-none border-2 border-slate-900 p-4 text-sm font-black uppercase focus-visible:ring-0 focus-visible:border-[#9B2B2C] min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="pt-6 border-t-2 border-slate-100">
                    <Label className="text-base font-black uppercase tracking-widest text-slate-900 mb-6 block">পেমেন্ট পদ্ধতি</Label>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(val: any) => setFormData({ ...formData, paymentMethod: val })}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {[
                        { id: 'cod', label: 'CASH ON DELIVERY', icon: Wallet, color: 'text-blue-600' },
                        { id: 'bkash', label: 'BKASH', icon: CreditCard, color: 'text-pink-600' },
                        { id: 'nagad', label: 'NAGAD', icon: CreditCard, color: 'text-orange-600' },
                      ].map((method) => (
                        <div key={method.id} className={`flex items-center space-x-3 border-2 p-4 rounded-none cursor-pointer transition-all ${formData.paymentMethod === method.id ? 'border-[#9B2B2C] bg-red-50' : 'border-slate-100 hover:border-slate-300'}`}>
                          <RadioGroupItem value={method.id} id={method.id} className="border-2 border-black w-4 h-4" />
                          <Label htmlFor={method.id} className="flex flex-col gap-1 cursor-pointer">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900">{method.label}</span>
                            <method.icon className={`h-4 w-4 ${method.color}`} />
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-16 bg-slate-900 hover:bg-[#9B2B2C] text-white font-black uppercase tracking-[0.3em] rounded-none mt-6 shadow-xl text-lg transition-all group"
                    disabled={loading}
                  >
                    {loading ? 'PROCESSING...' : (
                      <span className="flex items-center gap-4">
                        অর্ডার কনফার্ম করুন <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              {[
                { icon: ShieldCheck, title: 'SECURE', desc: 'Verified Identity' },
                { icon: Zap, title: 'FAST', desc: '24h Processing' },
                { icon: Truck, title: 'DOORSTEP', desc: 'Secure Delivery' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border-2 border-slate-900/10">
                  <item.icon className="h-6 w-6 text-[#9B2B2C]" />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">{item.title}</h4>
                    <p className="text-[8px] font-bold text-slate-500 uppercase">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-1">
             <Card className="border-2 border-slate-900 shadow-xl rounded-none overflow-hidden bg-slate-50 sticky top-24">
                <CardHeader className="bg-slate-900 border-b-2 border-slate-900 p-6">
                  <CardTitle className="text-white text-base font-black uppercase tracking-[0.3em]">ORDER_SUMMARY</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 mb-8">
                    {displayItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start bg-white border border-slate-900/10 p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-slate-100 border border-slate-900/10 overflow-hidden">
                            <img src={item?.image || 'https://picsum.photos/seed/placeholder/200/200'} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase leading-none mb-1">{item?.name || 'Item'}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Qty: {item?.quantity || 1}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-[#9B2B2C] font-mono">৳{((item?.price || 0) * (item?.quantity || 1)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-900/10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>পণ্যের দাম</span>
                      <span className="font-mono text-slate-900">৳{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>ডেলিভারি</span>
                      <span className={`${subtotal > 500 ? 'text-green-600' : 'text-slate-900'} font-mono`}>
                        {subtotal > 500 ? 'FREE' : '৳60'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>ভ্যাট (5%)</span>
                      <span className="font-mono text-slate-900">৳{(subtotal * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col pt-6 border-t-2 border-slate-900 mt-4 bg-white p-4">
                      <span className="text-[10px] font-black text-[#9B2B2C] uppercase tracking-[0.4em] mb-1">TOTAL</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tighter font-mono">
                        ৳{grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
             </Card>

             <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200">
                <p className="text-[8px] font-black uppercase tracking-widest text-yellow-800 leading-relaxed text-center">
                  আপনার পার্সেলটি নিরাপদ রাখতে আমরা বদ্ধপরিকর।
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
