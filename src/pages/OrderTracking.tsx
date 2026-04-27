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
    <div className="bg-brand-bg min-h-screen pb-20 font-sans">
      <div className="w-full px-8 md:px-20 lg:px-40 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 border-b-4 border-[#9B2B2C] pb-10 flex flex-col md:flex-row items-end justify-between gap-6">
            <div>
              <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">TRACK_ORDER</h1>
              <p className="text-[13px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3">Check the status of your order</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">System Online</span>
            </div>
          </div>

          <div className="bg-brand-secondary border-2 border-[#777] p-12 shadow-2xl mb-16">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9B2B2C]" />
                <Input
                  placeholder="Order ID (e.g. ORD-XXXXXX)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="pl-14 h-16 bg-white border-2 border-[#777] rounded-none text-sm font-black uppercase tracking-widest focus-visible:ring-0 focus-visible:border-[#9B2B2C]"
                />
              </div>
              <Button type="submit" className="h-16 px-16 bg-[#9B2B2C] hover:bg-slate-900 text-white rounded-none font-black uppercase text-[13px] tracking-widest shadow-xl disabled:bg-slate-400" disabled={loading}>
                {loading ? 'TRACKING...' : 'TRACK NOW'}
              </Button>
            </form>
          </div>

          {error && (
            <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-none text-[10px] font-black uppercase tracking-widest text-center mb-12 shadow-inner">
               <span className="bg-rose-600 text-white px-2 py-0.5 mr-3">SYSTEM_ERR</span>
               {error}
            </div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-[#777] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#9B2B2C]" />
              
              <div className="p-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 pb-12 border-b-2 border-[#777]/10 gap-10">
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">ORDER_ID</p>
                    <h2 className="text-5xl font-black text-[#9B2B2C] tracking-tighter uppercase leading-none">{order.orderId}</h2>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">EXPECTED_DELIVERY</p>
                    <div className="inline-flex items-center gap-3 bg-brand-bg border-2 border-[#777] px-6 py-2.5">
                       <Clock className="h-4 w-4 text-[#9B2B2C]" />
                       <span className="text-[14px] font-black text-slate-900 uppercase">April 20, 2026</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-20">
                  {steps.map((step, i) => {
                    const isCompleted = i <= currentStep;
                    const isCurrent = i === currentStep;
                    
                    return (
                      <div key={step.status} className="relative group">
                        <div className={`p-6 border transition-all duration-700 flex flex-col items-center text-center gap-4 ${
                          isCompleted 
                          ? 'bg-brand-secondary border-[#9B2B2C] shadow-lg translate-y-[-4px]' 
                          : 'bg-slate-50 border-[#777]/10 opacity-40 grayscale'
                        }`}>
                          <div className={`w-12 h-12 flex items-center justify-center border-2 ${isCompleted ? 'border-[#9B2B2C] bg-white text-[#9B2B2C]' : 'border-slate-300 text-slate-300'}`}>
                            <step.icon className="h-6 w-6" />
                          </div>
                          <div>
                             <h3 className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-slate-900 border-b-2 border-[#9B2B2C]' : 'text-slate-400'} inline-block mb-2 px-1`}>
                               {step.label}
                             </h3>
                             <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter leading-tight">{step.desc}</p>
                          </div>
                          {isCurrent && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#9B2B2C] text-white text-[7px] font-black px-2 py-0.5 uppercase tracking-widest border border-white">
                               CURRENT_STATUS
                            </div>
                          )}
                        </div>
                        {i < 3 && (
                           <div className="hidden md:block absolute top-[40px] -right-[15px] z-10">
                              <ArrowRight className={`h-4 w-4 ${i < currentStep ? 'text-[#9B2B2C]' : 'text-slate-200'}`} />
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-brand-bg border border-[#777] p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                  <div className="w-16 h-16 bg-[#9B2B2C] flex items-center justify-center text-white shadow-xl flex-shrink-0">
                     <MapPin className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#9B2B2C] uppercase tracking-[0.3em] mb-2 underline decoration-dashed">DELIVERY_ADDRESS</p>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-widest leading-relaxed">
                       {order?.customerInfo?.address || 'N/A'}
                    </p>
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
