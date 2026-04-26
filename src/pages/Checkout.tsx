import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { motion } from 'motion/react';
import { CheckCircle2, CreditCard, Truck, Wallet } from 'lucide-react';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phone: '',
    address: '',
    paymentMethod: 'cod' as 'cod' | 'bkash' | 'nagad',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const shipping = total > 500 ? 0 : 60;
      const tax = total * 0.05;
      const grandTotal = total + shipping + tax;

      const orderData = {
        orderId,
        userId: user?.uid || 'guest',
        items,
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

      // Parallelize order creation and notification
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
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-brand-secondary border border-[#777] flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle2 className="h-10 w-10 text-[#9B2B2C]" />
          </div>
          <h1 className="text-3xl font-black text-[#9B2B2C] mb-2 uppercase tracking-tighter">ORDER_SUCCESSFUL</h1>
          <p className="text-slate-500 mb-8 text-[10px] font-black uppercase tracking-widest leading-relaxed">
            Thank you! Your order has been placed successfully. Order ID: <span className="text-[#9B2B2C]">{orderSuccess}</span>. 
            We will contact you soon for confirmation.
          </p>
          <div className="flex flex-col gap-3">
            <Button className="bg-[#9B2B2C] hover:bg-slate-900 rounded-none h-12 text-[11px] font-black uppercase tracking-widest shadow-lg" onClick={() => navigate(`/tracking?id=${orderSuccess}`)}>
              TRACK_ORDER
            </Button>
            <Button variant="outline" className="border-[#777] rounded-none h-12 text-[11px] font-black uppercase tracking-widest" onClick={() => navigate('/')}>
              BACK_TO_HOME
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 border-b-2 border-[#9B2B2C] pb-4">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">CHECKOUT</h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Review your details and place your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Checkout Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border border-[#777] shadow-xl rounded-none overflow-hidden bg-white">
            <CardHeader className="bg-brand-secondary border-b border-[#777]">
              <CardTitle className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.2em] text-[#9B2B2C]">
                <Truck className="h-4 w-4" /> Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ENTER NAME..."
                    className="rounded-none border-[#777] focus-visible:ring-0 focus-visible:border-[#9B2B2C] bg-slate-50 text-xs font-bold uppercase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01XXXXXXXXX..."
                    className="rounded-none border-[#777] focus-visible:ring-0 focus-visible:border-[#9B2B2C] bg-slate-50 text-xs font-bold uppercase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Delivery Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="FULL ADDRESS..."
                    className="rounded-none border-[#777] focus-visible:ring-0 focus-visible:border-[#9B2B2C] bg-slate-50 text-xs font-bold uppercase"
                    required
                  />
                </div>

                <div className="pt-6 border-t border-[#777]/20">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C] mb-4 block underline">Payment Method</Label>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(val: any) => setFormData({ ...formData, paymentMethod: val })}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {[
                      { id: 'cod', label: 'COD', icon: Wallet },
                      { id: 'bkash', label: 'bKash', icon: CreditCard },
                      { id: 'nagad', label: 'Nagad', icon: CreditCard },
                    ].map((method) => (
                      <div key={method.id} className="flex items-center space-x-2 border border-[#777] p-3 rounded-none cursor-pointer hover:bg-brand-secondary transition-all bg-white">
                        <RadioGroupItem value={method.id} id={method.id} className="border-[#777] text-[#9B2B2C]" />
                        <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer text-[9px] font-black uppercase tracking-widest">
                          <method.icon className="h-3.5 w-3.5 text-[#9B2B2C]" /> {method.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-[#9B2B2C] hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-none mt-8 shadow-2xl text-[12px]"
                  disabled={loading}
                >
                  {loading ? 'PROCESSING...' : 'PLACE ORDER'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border border-[#777] shadow-xl rounded-none overflow-hidden bg-brand-secondary sticky top-24">
            <CardHeader className="bg-[#9B2B2C] border-b border-[#777]">
              <CardTitle className="text-white text-[12px] font-black uppercase tracking-[0.2em]">ORDER_SUMMARY</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center bg-white border border-[#777]/30 p-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 border border-[#777]/10 overflow-hidden grayscale">
                        <img src={item?.image || 'https://picsum.photos/seed/placeholder/200/200'} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{item?.name || 'Unknown Item'}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Units: {item?.quantity || 1}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 font-mono">৳{((item?.price || 0) * (item?.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-[#9B2B2C]/20">
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
                <div className="flex justify-between items-center pt-6 border-t border-[#9B2B2C]/20">
                  <span className="text-xs font-black text-[#9B2B2C] uppercase tracking-[0.2em]">GRAND_TOTAL</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter font-mono">
                    ৳{(total + (total > 500 ? 0 : 60) + total * 0.05).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
