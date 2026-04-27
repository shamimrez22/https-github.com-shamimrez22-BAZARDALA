import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Package, CheckCircle2, Truck, Clock, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setError('Order not found. Please check your Order ID.');
        setOrder(null);
      } else {
        setOrder({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Order);
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('id')) {
      handleTrack();
    }
  }, []);

  const steps = [
    { status: 'pending', label: 'Order Placed', icon: Clock, desc: 'We have received your order' },
    { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2, desc: 'Your order has been confirmed' },
    { status: 'processing', label: 'Processing', icon: Package, desc: 'Your order is being prepared' },
    { status: 'delivered', label: 'Delivered', icon: Truck, desc: 'Order has been delivered' },
  ];

  const currentStep = steps.findIndex(s => s.status === order?.status);

  return (
    <div className="bg-slate-50/30 min-h-screen pb-20 font-sans">
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 flex flex-col md:flex-row items-end justify-between gap-6 px-4 md:px-0">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter leading-none border-b-4 border-[#9B2B2C] pb-4 inline-block">TRACKING_LINK</h1>
              <div className="flex items-center gap-3 mt-5">
                 <div className="w-2 h-2 bg-[#9B2B2C] rounded-none animate-pulse" />
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Direct access to real-time dispatch data protocol</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white px-6 py-2.5 rounded-none shadow-md border-2 border-[#777]">
               <div className="w-2 h-2 bg-green-600 rounded-none animate-ping" />
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">CHANNEL_77_ACTIVE</span>
            </div>
          </div>

          <div className="bg-white rounded-none p-8 md:p-12 shadow-2xl mb-12 border-2 border-[#777] relative overflow-hidden">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-6 relative z-10">
              <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#9B2B2C] transition-colors" />
                <Input
                  placeholder="INSERT_ORDER_ID (e.g. ORD-XXXXXX)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="pl-16 h-16 bg-[#f8f8f8] border-2 border-[#777] rounded-none text-[12px] font-black uppercase tracking-widest focus-visible:ring-0 shadow-inner"
                />
              </div>
              <Button type="submit" className="h-16 px-12 bg-slate-900 hover:bg-[#9B2B2C] text-white rounded-none font-black uppercase text-[12px] tracking-widest shadow-xl active:scale-95 transition-all disabled:bg-slate-200" disabled={loading}>
                {loading ? 'INITIALIZING_CHANNEL...' : 'TRACK_DISPATCH_PROTOCOL'}
              </Button>
            </form>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-red-50/50 rounded-none border-2 border-red-600 text-red-600 text-[11px] font-black uppercase tracking-widest text-center mb-12 shadow-lg"
            >
               ORDER_IDENTIFIER_NOT_FOUND // VERIFY_REGISTRY_AND_RETRY
            </motion.div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-none shadow-2xl relative overflow-hidden border-2 border-[#777]"
            >
              <div className="p-10 md:p-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 pb-12 border-b-2 border-[#777] gap-10">
                  <div>
                    <span className="inline-block px-4 py-1 bg-[#9B2B2C] text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-none mb-4">
                      SESSION_VERIFIED
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none border-l-4 border-[#9B2B2C] pl-6">{order.orderId}</h2>
                  </div>
                  <div className="text-left md:text-right bg-[#f8f8f8] border-2 border-[#777] p-6 px-10 rounded-none shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 opacity-60">Estimated Arrival</p>
                    <div className="flex items-center gap-4 text-slate-800">
                       <Clock className="h-5 w-5 text-[#9B2B2C]" />
                       <span className="text-xl font-black uppercase tracking-tighter">EXPRESS_DISPATCH_PROTOCOL</span>
                    </div>
                  </div>
                </div>

                {/* Modern Stepper */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
                  {steps.map((step, i) => {
                    const isCompleted = i <= currentStep;
                    const isCurrent = i === currentStep;
                    
                    return (
                      <div key={step.status} className="relative">
                        <div className={`p-8 rounded-none transition-all duration-700 flex flex-col items-center text-center gap-5 border-2 ${
                          isCompleted 
                          ? 'bg-white border-[#777] shadow-lg scale-100' 
                          : 'bg-[#f8f8f8] border-[#777]/20 opacity-30 grayscale'
                        }`}>
                          <div className={`w-16 h-16 rounded-none border-2 border-slate-900 flex items-center justify-center shadow-lg transition-all duration-500 ${isCompleted ? 'bg-[#9B2B2C] text-white' : 'bg-white text-slate-300'}`}>
                            <step.icon className={`h-7 w-7 ${isCurrent ? 'animate-pulse' : ''}`} />
                          </div>
                          <div>
                             <h3 className={`text-[12px] font-black uppercase tracking-widest leading-none mb-3 ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                {step.label}
                             </h3>
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] leading-tight">{step.desc}</p>
                          </div>
                          {isCurrent && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-4 py-1.5 rounded-none uppercase tracking-widest shadow-xl">
                               ACTIVE_NODE
                            </div>
                          )}
                        </div>
                        {i < 3 && (
                           <div className="hidden md:flex absolute top-1/2 -right-3 z-10 -translate-y-1/2 items-center justify-center w-6 h-6 bg-white border-2 border-[#777] rounded-none shadow-md">
                              <div className={`w-1.5 h-1.5 rounded-none ${i < currentStep ? 'bg-[#9B2B2C]' : 'bg-slate-200'}`} />
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#f8f8f8] border-2 border-[#777] rounded-none p-10 md:p-14 flex flex-col md:flex-row items-center gap-12 shadow-inner group overflow-hidden relative">
                  <div className="w-20 h-20 bg-white border-2 border-slate-900 rounded-none flex items-center justify-center text-slate-400 shadow-lg group-hover:rotate-12 transition-transform duration-500 relative z-10">
                     <MapPin className="h-10 w-10 text-[#9B2B2C]" />
                  </div>
                  <div className="relative z-10 flex-1 text-center md:text-left">
                    <p className="text-[11px] font-black text-[#9B2B2C] uppercase tracking-[0.4em] mb-4 opacity-60">SHIPPING_DESTINATION_NODE</p>
                    <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-relaxed uppercase">
                       {order?.customerInfo?.address || 'N/A'}
                    </p>
                    <div className="flex items-center gap-3 mt-6 justify-center md:justify-start">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order?.customerInfo?.name}</p>
                       <div className="w-2 h-[1px] bg-slate-300" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order?.customerInfo?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
