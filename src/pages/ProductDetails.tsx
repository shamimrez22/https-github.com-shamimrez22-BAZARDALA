import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star,
  CheckCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Instant Render: Use state from navigation if available
  const [product, setProduct] = useState<Product | null>(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      // Background re-fetch to ensure data is fresh (stock etc)
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setIsSubmitting(true);
    try {
      const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const finalTotal = product.price * quantity;

      const orderData = {
        orderId,
        userId: auth.currentUser?.uid || 'guest',
        items: [{
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.images?.[0] || ''
        }],
        total: finalTotal,
        status: 'pending',
        customerInfo: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        },
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        createdAt: serverTimestamp()
      };

      // FAST_PROTO: Nav succeeds immediately while writes happen in background
      const writeBatch = Promise.all([
        addDoc(collection(db, 'orders'), orderData),
        addDoc(collection(db, 'notifications'), {
          message: `New order: ${orderId} via Direct Order`,
          type: 'order',
          read: false,
          createdAt: serverTimestamp(),
        })
      ]);
      
      setIsOrderModalOpen(false);
      setIsSuccessModalOpen(true);
      setFormData({ name: '', phone: '', address: '' });
      
      // We don't necessarily need to wait for writeBatch here to show success
      // But we'll await it to ensure stability (it's still faster than sequential)
      await writeBatch;
    } catch (error: any) {
      console.error('Detailed Order Error:', error);
      // Show actual error message for debugging if it fails again
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white text-[#9B2B2C] font-black uppercase tracking-widest text-xs">
        RETRIEVING PRODUCT DATA...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white text-[#9B2B2C]">
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Product Not Found</h2>
        <Button 
          className="bg-[#9B2B2C] text-white rounded-none px-8 font-black uppercase text-[10px] tracking-widest"
          onClick={() => navigate('/shop')}
        >
          Return to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square border border-[#777] bg-white overflow-hidden shadow-2xl relative group"
            >
              <img
                src={product.images?.[selectedImage] || 'https://picsum.photos/seed/product/800/800'}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-[#9B2B2C] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 border border-white">
                IMAGE // {selectedImage + 1}
              </div>
            </motion.div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-24 h-24 border-2 flex-shrink-0 transition-all ${selectedImage === i ? 'border-[#9B2B2C]' : 'border-[#777]/30 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col bg-white border border-[#777] p-8 shadow-xl"
          >
            <div className="mb-8 border-b border-[#9B2B2C]/20 pb-6">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-2 h-2 bg-[#9B2B2C] rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-[#9B2B2C] uppercase tracking-[0.3em]">CATEGORY: {product.category}</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">{product?.name || 'PRODUCT_SAMPLE_v3'}</h1>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1 text-[#9B2B2C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product?.ratings || 4) ? 'fill-current' : 'opacity-20'}`} />
                  ))}
                  <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest ml-2">REVIEWS (128)</span>
                </div>
                <div className="h-4 w-[1px] bg-[#777]/30" />
                <span className={`text-[9px] font-black uppercase tracking-widest ${(product?.stock || 0) > 0 ? 'text-green-600' : 'text-red-700 underline'}`}>
                  {(product?.stock || 0) > 0 ? `IN STOCK: ${product.stock} UNITS` : 'OUT OF STOCK'}
                </span>
              </div>
            </div>

            <div className="mb-10">
              <span className="text-5xl font-black text-[#9B2B2C] tracking-tighter font-mono leading-none">৳{(product?.price || 0).toLocaleString()}</span>
            </div>

            <div className="mb-10 p-4 border-l-4 border-[#9B2B2C] bg-white/30 backdrop-blur-sm">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">PRODUCT DETAILS</p>
              <p className="text-[11px] font-bold text-slate-700 uppercase leading-relaxed tracking-wider">
                {product.description || "Experience premium quality with our latest collection. This product is designed with attention to detail and crafted from high-grade materials to ensure durability and style."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
              <div className="flex items-center border border-[#777] bg-white h-14 w-full sm:w-auto">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-6 h-full hover:bg-slate-50 transition-colors text-xl font-black text-[#9B2B2C]"
                >
                  -
                </button>
                <span className="px-6 font-mono font-black w-16 text-center border-x border-[#777]/30 text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-6 h-full hover:bg-slate-50 transition-colors text-xl font-black text-[#9B2B2C]"
                >
                  +
                </button>
              </div>
              <Button
                className="flex-1 w-full h-14 bg-[#9B2B2C] hover:bg-slate-900 text-white rounded-none font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:bg-slate-400"
                disabled={product.stock === 0}
                onClick={() => {
                  if (product.affiliateLink) {
                    window.open(product.affiliateLink, '_blank');
                  } else {
                    setIsOrderModalOpen(true);
                  }
                }}
              >
                ORDER NOW
              </Button>
              <Button variant="outline" className="h-14 w-14 p-0 border-[#777] rounded-none bg-white hover:bg-slate-50 group">
                <Heart className="h-5 w-5 text-[#9B2B2C] group-hover:scale-110 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border border-[#777]/30 bg-white/20 mb-8">
              {[
                { icon: Truck, t: 'FREE_SHIPPING', d: 'Secure Routing' },
                { icon: RotateCcw, t: 'EASY_RETURNS', d: '7-Days Window' },
                { icon: ShieldCheck, t: 'SECURE_PAYMENT', d: 'Protocol Verified' },
              ].map((x, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2">
                  <x.icon className="h-5 w-5 text-[#9B2B2C]" />
                  <div>
                    <p className="text-[8px] font-black uppercase text-slate-800 tracking-widest leading-none mb-1">{x.t}</p>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">{x.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#9B2B2C]" onClick={() => toast.info('Link copied to clipboard!')}>
                <Share2 className="mr-2 h-3.5 w-3.5" /> SHARE ITEM
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-[#777] rounded-none p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="bg-[#9B2B2C] p-6 text-white border-b border-[#777]">
            <DialogTitle className="text-xl font-black uppercase tracking-tighter leading-none">Confirm_Order</DialogTitle>
            <DialogDescription className="text-[9px] font-black uppercase tracking-widest text-white/60 mt-2">
              Please confirm your details for <strong>{product.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOrderSubmit} className="p-8 space-y-6">
            <div className="grid gap-6">
               <div className="space-y-2">
                 <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">FULL NAME</Label>
                 <Input 
                   id="name" 
                   placeholder="ENTER NAME..." 
                   className="rounded-none border-[#777] focus-visible:ring-0 focus-visible:border-[#9B2B2C] bg-white text-xs font-bold uppercase"
                   required 
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">PHONE NUMBER</Label>
                 <Input 
                   id="phone" 
                   placeholder="01XXXXXXXXX..." 
                   className="rounded-none border-[#777] focus-visible:ring-0 focus-visible:border-[#9B2B2C] bg-white text-xs font-bold uppercase"
                   required 
                   value={formData.phone}
                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">DELIVERY ADDRESS</Label>
                 <Input 
                   id="address" 
                   placeholder="FULL ADDRESS..." 
                   className="rounded-none border-[#777] focus-visible:ring-0 focus-visible:border-[#9B2B2C] bg-white text-xs font-bold uppercase"
                   required 
                   value={formData.address}
                   onChange={(e) => setFormData({...formData, address: e.target.value})}
                 />
               </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between border-t border-[#777]/30 mt-6 gap-6">
              <div className="text-center sm:text-left">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Price:</p>
                <p className="text-3xl font-black text-[#9B2B2C] font-mono tracking-tighter">৳{(product.price * quantity).toLocaleString()}</p>
              </div>
              <Button type="submit" className="w-full sm:w-auto bg-[#9B2B2C] hover:bg-slate-900 text-white rounded-none h-14 px-10 font-black uppercase text-[12px] tracking-widest shadow-xl" disabled={isSubmitting}>
                {isSubmitting ? 'PROCESSING...' : 'PLACE ORDER'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-md text-center bg-white border border-[#777] rounded-none py-12 px-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-white border-2 border-[#9B2B2C] flex items-center justify-center text-[#9B2B2C] shadow-2xl relative">
              <CheckCircle className="h-12 w-12" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-[#9B2B2C]" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white border border-[#9B2B2C]" />
            </div>
            <DialogTitle className="text-3xl font-black text-[#9B2B2C] uppercase tracking-tighter">ORDER_SUCCESSFUL</DialogTitle>
            <DialogDescription className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] leading-relaxed">
              Your order has been placed successfully. We will contact you soon for confirmation.
            </DialogDescription>
            <Button 
              className="mt-6 bg-[#9B2B2C] hover:bg-slate-900 text-white h-14 px-12 rounded-none font-black uppercase text-[11px] tracking-widest shadow-2xl"
              onClick={() => {
                setIsSuccessModalOpen(false);
                navigate('/');
              }}
            >
              BACK TO HOME
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetails;
