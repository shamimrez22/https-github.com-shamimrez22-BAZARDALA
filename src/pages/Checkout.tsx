import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  MessageCircle,
  Ruler,
  X,
  ChevronDown,
  Ticket,
  Zap,
  Tag
} from 'lucide-react';
import { Coupon } from '../types';

const DIVISIONS = [
  { value: 'DHAKA', label: 'DHAKA (ঢাকা) (DHAKA)' },
  { value: 'CHITTAGONG', label: 'CHITTAGONG (চট্টগ্রাম) (CHITTAGONG)' },
  { value: 'RAJSHAHI', label: 'RAJSHAHI (রাজশাহী) (RAJSHAHI)' },
  { value: 'KHULNA', label: 'KHULNA (খুলনা) (KHULNA)' },
  { value: 'BARISAL', label: 'BARISAL (বরিশাল) (BARISAL)' },
  { value: 'SYLHET', label: 'SYLHET (সিলেট) (SYLHET)' },
  { value: 'RANGPUR', label: 'RANGPUR (রংপুর) (RANGPUR)' },
  { value: 'MYMENSINGH', label: 'MYMENSINGH (ময়মনসিংহ) (MYMENSINGH)' },
];

const Checkout = () => {
  const location = useLocation();
  const { items: cartItems, total: cartTotal, clearCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedDivision, setSelectedDivision] = useState('DHAKA');
  const [deliveryRegion, setDeliveryRegion] = useState<'inside' | 'outside'>('inside');
  
  // Coupon state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Determine if this is a direct order from a product page or a cart checkout
  const directOrder = location.state?.directOrder;
  const directProduct = location.state?.product;

  const displayItems = directOrder ? [directProduct] : cartItems;

  useEffect(() => {
    // Sync delivery region based on division selection
    if (selectedDivision === 'DHAKA') {
      setDeliveryRegion('inside');
    } else {
      setDeliveryRegion('outside');
    }
  }, [selectedDivision]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const snap = await getDocs(collection(db, 'coupons'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
        setCoupons(list);
      } catch (err) {
        console.error('Failed to fetch coupons:', err);
      }
    };
    fetchCoupons();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    quantity: location.state?.quantity || 1,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    // If no items in cart and not a direct order, redirect home
    if (!directOrder && cartItems.length === 0 && !orderSuccess) {
      navigate('/shop');
    }
  }, [cartItems, directOrder, navigate, orderSuccess]);

  useEffect(() => {
    if (orderSuccess) {
      window.scrollTo(0, 0);
      const timer = setTimeout(() => {
        navigate('/');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [orderSuccess, navigate]);

  // Handle coupon validation
  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) {
      toast.error('কুপন কোড লিখুন');
      return;
    }
    const codeUpper = couponCodeInput.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === codeUpper);
    if (!found) {
      toast.error('ভুল কুপন কোড! দয়া করে সঠিক কোড দিন।');
      return;
    }
    
    // Check expiry
    if (found.expiry) {
      const expiryDate = found.expiry.toDate ? found.expiry.toDate() : new Date(found.expiry);
      if (expiryDate < new Date()) {
        toast.error('এই কুপনটির মেয়াদ শেষ হয়ে গেছে।');
        return;
      }
    }
    
    setAppliedCoupon(found);
    toast.success(`কুপন '${found.code}' সফলভাবে প্রযোজ্য হয়েছে!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    toast.info('কুপন বাতিল করা হয়েছে।');
  };

  // Calculations
  const deliveryCharge = displayItems.reduce((max, item) => {
    const charge = deliveryRegion === 'inside' 
      ? (item.deliveryChargeInsideDhaka || 0) 
      : (item.deliveryChargeOutsideDhaka || 0);
    return Math.max(max, charge);
  }, 0);

  const subtotal = directOrder 
    ? (directProduct?.price || 0) * formData.quantity 
    : cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const appliedDiscount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
  const subtotalAfterDiscount = subtotal - appliedDiscount;
  const displayTotal = subtotalAfterDiscount + deliveryCharge;

  const handleQuantityChange = (item: any, increment: boolean) => {
    if (directOrder) {
      setFormData(prev => ({
        ...prev,
        quantity: Math.max(1, prev.quantity + (increment ? 1 : -1))
      }));
    } else {
      const currentQty = item.quantity || 1;
      updateQuantity(item.productId, Math.max(1, currentQty + (increment ? 1 : -1)));
    }
  };

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
        productId: item.productId || item.id || 'unknown',
        name: item.name || '',
        price: Number(item.price) || 0,
        image: item.image || item.images?.[0] || '',
        size: selectedSize || 'L',
        quantity: directOrder ? Number(formData.quantity) : Number(item.quantity),
        deliveryChargeInsideDhaka: Number(item.deliveryChargeInsideDhaka) || 0,
        deliveryChargeOutsideDhaka: Number(item.deliveryChargeOutsideDhaka) || 0,
      }));

      const orderData = {
        orderId,
        userId: user?.uid || 'guest',
        items: orderItems,
        subtotal: Number(subtotal) || 0,
        deliveryCharge: Number(deliveryCharge) || 0,
        deliveryRegion: deliveryRegion,
        division: selectedDivision,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountAmount: Number(appliedDiscount) || 0,
        total: Number(displayTotal) || 0,
        status: 'pending',
        customerInfo: {
          name: String(formData.name).trim(),
          phone: `88${String(formData.phone).trim()}`,
          address: String(formData.address).trim(),
        },
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('Creating secure order:', orderId, orderData);

      await addDoc(collection(db, 'orders'), orderData);
      
      try {
        await addDoc(collection(db, 'notifications'), {
          message: `New order: ${orderId} by ${formData.name}`,
          type: 'order',
          read: false,
          createdAt: serverTimestamp(),
        });
      } catch (notifErr) {
        console.warn('Failed to dispatch notification:', notifErr);
      }

      setOrderSuccess(orderId);
      if (!directOrder) clearCart();
      toast.success('অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = 'অর্ডার করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।';
      
      if (error instanceof Error) {
         if (error.message.includes('permission-denied')) {
            errorMessage = 'সার্ভার অ্যাক্সেস রিফিউজড। দয়া করে এডমিনকে জানান।';
         } else if (error.message.includes('offline')) {
            errorMessage = 'আপনার ইন্টারনেট কানেকশন চেক করুন।';
         }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="w-full min-h-screen bg-[#f4efe6] flex items-center justify-center py-12 px-4 relative font-sans">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-[#faf6f0] border-2 border-slate-900 relative p-12 text-center shadow-sm"
        >
          <button 
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 w-10 h-10 bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center hover:bg-[#8B1E1E] hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-[#8B1E1E]/5 rounded-none blur-2xl animate-pulse" />
            <div className="relative w-full h-full border-2 border-slate-900 rounded-none flex items-center justify-center bg-[#ead9c4]/30 shadow-sm">
               <CheckCircle2 className="h-14 w-14 text-[#8B1E1E]" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter uppercase">THANK YOU</h1>
          
          <div className="w-24 h-1 bg-[#8B1E1E] mx-auto mb-8" />
          
          <p className="text-md font-black text-slate-800 leading-relaxed mb-8">
            আমাদের একজন প্রতিনিধি যত দ্রুত সম্ভব আপনার সাথে যোগাযোগ করবে।
          </p>

          <p className="text-[10px] font-black text-[#8B1E1E] uppercase tracking-[0.3em] mb-10 flex items-center justify-center gap-2">
            <span className="w-4 h-[1px] bg-[#8B1E1E]/20"></span>
            Redirecting in 3 Seconds
            <span className="w-4 h-[1px] bg-[#8B1E1E]/20"></span>
          </p>
          
          <div className="pt-8 border-t-2 border-slate-900/10 flex flex-col gap-4">
             <button 
                className="w-full h-12 border-2 border-slate-900 rounded-none text-[10px] font-black uppercase tracking-widest bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                onClick={() => navigate(`/tracking?id=${orderSuccess}`)}
             >
               VIEW_ORDER_ID: {orderSuccess}
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentItem = displayItems[0];

  return (
    <div className="min-h-screen bg-[#f4efe6] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto relative">
        {/* Top Header Section matching mock exactly */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block px-5 py-1.5 border-2 border-slate-900 bg-[#e3f4f0] text-[#0f5132] font-black text-[9px] uppercase tracking-[0.2em] shadow-sm">
            {directOrder ? 'Direct Checkout' : 'Sourced Cart Checkout'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            FINALIZE SOURCED CART
          </h1>
          <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
            VERIFY SHIPPING ADDRESSES COORDINATES AND COMPLETE MOBILE SANDBOX PAYMENTS
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-0 right-0 w-10 h-10 bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center hover:bg-[#8B1E1E] hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm z-10"
          title="Back to Shop"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
          
          {/* LEFT PANEL: 7 Cols */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Box 1: Recipient & Personal Details */}
            <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden shadow-sm hover:border-[#8B1E1E] transition-all">
              <div className="bg-slate-900 text-white px-6 py-4 flex flex-row items-center justify-between border-b-2 border-slate-900">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#8B1E1E]" /> Recipient & Personal Details (ব্যক্তিগত এবং ডেলিভারি তথ্য)
                </span>
                <span className="bg-white/15 px-3 py-1 border border-white/20 text-[8px] font-black uppercase tracking-widest text-slate-200">
                  SECTIONS: ALL
                </span>
              </div>
              
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                    Recipient Name (নাম) :*
                  </Label>
                  <Input 
                    placeholder="E.G. JOHN DOE"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 bg-white border-2 border-slate-900 rounded-none text-xs font-black text-slate-900 placeholder:text-slate-400 focus:border-[#8B1E1E] focus-visible:ring-0 shadow-sm"
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                    Mobile Number (মোবাইল নম্বর) :*
                  </Label>
                  <div className="flex">
                    <div className="flex items-center justify-center w-14 bg-[#ead9c4]/40 border-2 border-r-0 border-slate-900 text-slate-900 font-black text-xs select-none shadow-sm">
                      88
                    </div>
                    <Input 
                      placeholder="E.G. 01700000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-1 h-12 bg-white border-2 border-slate-900 rounded-none text-xs font-black text-slate-900 placeholder:text-slate-400 focus:border-[#8B1E1E] focus-visible:ring-0 shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Division dropdown */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                    District / Division (জেলা / বিভাগ) :*
                  </Label>
                  <div className="relative">
                    <select
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="w-full h-12 pl-4 pr-10 bg-white border-2 border-slate-900 rounded-none text-xs font-black text-slate-900 focus:border-[#8B1E1E] outline-none shadow-sm uppercase tracking-tighter cursor-pointer appearance-none"
                    >
                      {DIVISIONS.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                  </div>
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mt-1">
                    * Delivery Charge calculated live: <strong>৳{deliveryCharge}</strong> (Region: {deliveryRegion === 'inside' ? 'Dhaka City' : 'Outside Dhaka'})
                  </p>
                </div>

                {/* Size Selector */}
                <div className="space-y-2 pt-2 border-t border-slate-900/10">
                  <Label className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                    <Ruler className="h-3.5 w-3.5 text-[#8B1E1E]" /> Select Size (সাইজ নির্ধারণ করুন)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-11 h-11 flex items-center justify-center text-[11px] font-black transition-all rounded-none border-2 ${
                          selectedSize === size 
                            ? 'bg-[#8B1E1E] text-white border-slate-900 scale-105 shadow-sm' 
                            : 'bg-white text-slate-700 border-slate-900 hover:border-[#8B1E1E]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Address */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                    Detailed Address Coordinates (বিস্তারিত ঠিকানা) :*
                  </Label>
                  <textarea 
                    placeholder="E.G. APPT 4B, HOUSE 12, ROAD 4, SECTION 11, UTTARA"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full h-24 bg-white border-2 border-slate-900 rounded-none font-black text-slate-900 placeholder:text-slate-400 text-xs p-4 focus:border-[#8B1E1E] outline-none shadow-sm resize-none"
                    required
                  />
                </div>

              </div>
            </div>

            {/* Box 2: Select Payment Method */}
            <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden shadow-sm hover:border-[#8B1E1E] transition-all">
              <div className="bg-slate-900 text-white px-6 py-4 border-b-2 border-slate-900">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#8B1E1E]" /> Select Payment Method (পেমেন্ট পদ্ধতি নির্ধারণ করুন) :*
                </span>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left component: Product Thumb preview */}
                  <div className="border-2 border-slate-900 bg-white h-48 flex items-center justify-center overflow-hidden relative shadow-sm">
                    {displayItems.length === 1 ? (
                      <>
                        <img 
                          src={currentItem?.image || currentItem?.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400'} 
                          alt={currentItem?.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider truncate">
                          {currentItem?.name}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full p-2 grid grid-cols-2 gap-2 bg-[#ead9c4]/10">
                        {displayItems.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="relative border border-slate-900/20 bg-white overflow-hidden aspect-square flex items-center justify-center">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                            {idx === 3 && displayItems.length > 4 && (
                              <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-white text-[10px] font-black">
                                +{displayItems.length - 3} MORE
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 text-white px-3 py-1 text-[8px] font-black uppercase tracking-wider">
                          {displayItems.length} items in cart
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right component: COD radio */}
                  <div className="border-2 border-slate-900 bg-white p-6 flex flex-col justify-center relative shadow-sm min-h-[12rem]">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#8B1E1E] mb-4 block">
                      ⚡ Select Payment System (পেমেন্ট পদ্ধতি)
                    </span>
                    <label className="border-2 border-slate-900 p-4 bg-slate-50 flex items-start gap-4 cursor-pointer hover:bg-slate-100 transition-all select-none">
                      <div className="mt-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center bg-white">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#8B1E1E]" />
                      </div>
                      <div>
                        <h4 className="text-[10px] md:text-xs font-black uppercase text-slate-900">CASH ON DELIVERY (ক্যাশ অন ডেলিভারি)</h4>
                        <p className="text-[9px] font-bold text-slate-500 mt-1">হাতে পণ্য পেয়ে মূল্য পরিশোধ করুন</p>
                      </div>
                    </label>
                  </div>

                </div>
              </div>
            </div>

            {/* Big Confirm Order Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#8B1E1E] hover:bg-slate-950 text-white text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] border-2 border-slate-900 cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? 'PROCESSING_ORDER_RECORDS...' : (
                <>
                  ⚡ CONFIRM SECURE ORDER (অর্ডার নিশ্চিত করুন)
                </>
              )}
            </button>

            {/* Help support line */}
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
              className="w-full h-12 border-2 border-slate-900 text-slate-900 font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-[#ead9c4]/20 transition-all text-[11px] active:scale-95 bg-white shadow-sm"
            >
              <MessageCircle className="h-5 w-5 text-[#8B1E1E]" /> CHAT WITH ADMIN (হোয়াটসঅ্যাপ সাপোর্ট)
            </button>

          </div>

          {/* RIGHT PANEL: 5 Cols */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Box 1: Promotional Voucher */}
            <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden shadow-sm hover:border-[#8B1E1E] transition-all">
              <div className="bg-slate-900 text-white px-6 py-4 border-b-2 border-slate-900">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-[#8B1E1E]" /> Promotional Voucher (কুপন ডিসকাউন্ট)
                </span>
              </div>
              
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="E.G. BAZAR15"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="h-10 bg-white border-2 border-slate-900 rounded-none text-xs font-black text-slate-900 focus:border-[#8B1E1E] focus-visible:ring-0 uppercase shadow-sm flex-1"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[9px] tracking-widest border-2 border-slate-900 cursor-pointer shadow-sm transition-all"
                    >
                      REMOVE
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="h-10 px-6 bg-slate-900 hover:bg-slate-950 text-white font-black uppercase text-[10px] tracking-widest border-2 border-slate-900 cursor-pointer shadow-sm transition-all active:scale-95"
                    >
                      APPLY
                    </button>
                  )}
                </div>

                {/* Coupon helper recommendation */}
                <div className="bg-white border-2 border-dashed border-slate-900/10 p-4 font-black uppercase text-[9px] tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="text-yellow-600">💡</span>
                  <span>
                    {appliedCoupon ? (
                      <span className="text-emerald-700">COUPON '{appliedCoupon.code}' APPLIED! (৳{appliedDiscount} SAVED)</span>
                    ) : coupons.length > 0 ? (
                      <>USE COUPON <strong className="text-[#8B1E1E] text-[10px] font-black">{coupons[0].code}</strong> TO SAVE ৳{coupons[0].discount} FLAT!</>
                    ) : (
                      <>ENTER VALID COUPON CODE TO UNLOCK INSTANT FIXED DISCOUNT</>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Seat / Item Checkout Info */}
            <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden shadow-sm hover:border-[#8B1E1E] transition-all">
              <div className="bg-slate-900 text-white px-6 py-4 flex flex-row items-center justify-between border-b-2 border-slate-900">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#8B1E1E]" /> Seat / Item Checkout Info (পণ্য চেকআউট বিবরণ)
                </span>
                <span className="bg-white text-slate-900 px-2.5 py-0.5 border-2 border-slate-900 text-[8px] font-black uppercase tracking-widest">
                  {displayItems.length} ITEMS
                </span>
              </div>
              
              <div className="p-0">
                {/* Custom Table styling matching mock */}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#ead9c4]/30 border-b-2 border-slate-900 text-slate-900 font-black text-[9px] uppercase tracking-wider">
                      <th className="py-3 px-4 w-[55%] border-r-2 border-slate-900">Item Name (আইটেম / পণ্য)</th>
                      <th className="py-3 px-2 w-[25%] text-center border-r-2 border-slate-900">Qty (পরিমাণ)</th>
                      <th className="py-3 px-4 w-[20%] text-right">Fare (Taka)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayItems.map((item, idx) => {
                      const itemPrice = item.price || 0;
                      const itemQty = directOrder ? formData.quantity : (item.quantity || 1);
                      const rowTotal = itemPrice * itemQty;
                      return (
                        <tr key={idx} className="border-b-2 border-slate-900 bg-white font-black text-xs text-slate-800">
                          <td className="py-4 px-4 border-r-2 border-slate-900 font-black text-[11px] uppercase tracking-tighter">
                            {item.name}
                          </td>
                          <td className="py-4 px-2 border-r-2 border-slate-900 text-center">
                            {/* Interactive Qty adjustment */}
                            <div className="flex items-center gap-1.5 justify-center">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item, false)}
                                className="w-5 h-5 bg-white border border-slate-900 hover:bg-slate-100 flex items-center justify-center text-[10px] font-black cursor-pointer select-none active:scale-90"
                              >
                                -
                              </button>
                              <span className="font-mono text-[11px] font-black w-5 text-center">
                                {itemQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item, true)}
                                className="w-5 h-5 bg-white border border-slate-900 hover:bg-slate-100 flex items-center justify-center text-[10px] font-black cursor-pointer select-none active:scale-90"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-mono text-[11px] text-slate-900">
                            ৳{rowTotal.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Subtotal row */}
                    <tr className="bg-[#ead9c4]/10 text-slate-700 font-bold text-[10px] uppercase border-b-2 border-slate-900/50">
                      <td colSpan={2} className="py-3 px-4 text-right border-r-2 border-slate-900/10 font-black">
                        Total Price (মোট মূল্য):
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-[11px]">
                        ৳{subtotal.toLocaleString()}
                      </td>
                    </tr>

                    {/* Shipping charge */}
                    <tr className="bg-[#ead9c4]/10 text-slate-700 font-bold text-[10px] uppercase border-b-2 border-slate-900/50">
                      <td colSpan={2} className="py-3 px-4 text-right border-r-2 border-slate-900/10 font-black">
                        Shipping / Convenience Charge:
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-[11px]">
                        ৳{deliveryCharge.toLocaleString()}
                      </td>
                    </tr>

                    {/* Discount row if applied */}
                    {appliedDiscount > 0 && (
                      <tr className="bg-[#ead9c4]/10 text-rose-700 font-bold text-[10px] uppercase border-b-2 border-slate-900/50">
                        <td colSpan={2} className="py-3 px-4 text-right border-r-2 border-slate-900/10 font-black">
                          Coupon Discount (কুপন ডিসকাউন্ট):
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-rose-700 text-[11px]">
                          -৳{appliedDiscount.toLocaleString()}
                        </td>
                      </tr>
                    )}

                    {/* Grand net total row */}
                    <tr className="bg-[#ead9c4]/40 text-slate-900 font-black text-[10px] uppercase">
                      <td colSpan={2} className="py-4 px-4 text-right border-r-2 border-slate-900 font-black text-xs">
                        Net Fare / Payable Amount (সর্বমোট প্রদেয়):
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-sm font-black text-[#8B1E1E]">
                        ৳{displayTotal.toLocaleString()}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;
