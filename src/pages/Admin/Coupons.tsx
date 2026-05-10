import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Coupon } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Plus, Ticket, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ code: '', discount: '', expiry: '' });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'coupons'));
      setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon)));
    } catch (error) {
      console.error('Fetch coupons error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = Math.random().toString(36).substr(2, 9);
    const originalCoupons = [...coupons];
    const newCouponData = {
      code: formData.code.toUpperCase(),
      discount: parseFloat(formData.discount),
      expiry: new Date(formData.expiry),
    };

    try {
      // Optimistic Add
      const optimisticCoupon = { id: tempId, ...newCouponData, createdAt: new Date() } as any;
      setCoupons(prev => [optimisticCoupon, ...prev]);
      
      setFormData({ code: '', discount: '', expiry: '' });
      const docRef = await addDoc(collection(db, 'coupons'), {
        ...newCouponData,
        createdAt: serverTimestamp(),
      });
      
      // Update with real ID
      setCoupons(prev => prev.map(c => c.id === tempId ? { ...c, id: docRef.id } : c));
      toast.success('Coupon created successfully');
    } catch (error) {
      console.error('Submit coupon error:', error);
      setCoupons(originalCoupons);
      toast.error('Failed to create coupon');
    }
  };

  const handleDelete = (id: string) => {
    const originalCoupons = [...coupons];
    toast('Delete this coupon permanently?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            // Optimistic Delete
            setCoupons(prev => prev.filter(c => c.id !== id));
            await deleteDoc(doc(db, 'coupons', id));
            toast.success('Coupon deleted');
          } catch (error) {
            console.error('Delete error:', error);
            setCoupons(originalCoupons);
            toast.error('Failed to delete coupon');
          }
        }
      },
      cancel: { label: 'Cancel', onClick: () => {} }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-slate-50 border-b border-slate-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-6 bg-brand-primary" />
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Discount Coupons
            </h1>
          </div>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">
            Manage store vouchers // {coupons.length} Active Coupons
          </p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white border border-slate-200 p-8 hover:border-brand-primary transition-all">
          <h2 className="text-xs font-black text-slate-900 uppercase mb-8 border-b border-slate-100 pb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-brand-primary" /> Create New Coupon
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Coupon Code</Label>
              <Input 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})}
                placeholder="e.g. SAVE100"
                className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus:border-brand-primary outline-none focus-visible:ring-0 uppercase"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Discount Amount (৳)</Label>
              <Input 
                type="number"
                value={formData.discount} 
                onChange={e => setFormData({...formData, discount: e.target.value})}
                placeholder="0.00"
                className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus:border-brand-primary outline-none focus-visible:ring-0"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expiry Date</Label>
              <Input 
                type="date"
                value={formData.expiry} 
                onChange={e => setFormData({...formData, expiry: e.target.value})}
                className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus:border-brand-primary outline-none focus-visible:ring-0"
                required 
              />
            </div>
            <Button type="submit" className="w-full bg-brand-primary hover:bg-slate-900 text-white rounded-none font-black text-[10px] uppercase h-12 tracking-widest transition-all active:scale-95 shadow-xl">
              <Plus className="mr-2 h-4 w-4" /> Save Coupon
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white border border-slate-200 p-6 relative group hover:border-brand-primary transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-slate-50 border border-slate-100 text-brand-primary">
                  <Ticket className="h-4 w-4" />
                </div>
                <button 
                  onClick={() => handleDelete(coupon.id)}
                  className="bg-rose-50 text-rose-600 px-3 py-1 text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 hover:text-white"
                >
                  Delete
                </button>
              </div>
              <h3 className="text-2xl font-black tracking-tighter text-slate-900 mb-2 uppercase">{coupon.code}</h3>
              <p className="text-brand-primary font-black text-sm mb-6 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-brand-primary/20" />
                Discount: ৳{(coupon.discount || 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-[9px] text-slate-400 font-black uppercase bg-slate-50 p-3 border border-slate-100">
                <Calendar className="h-3 w-3 text-slate-300" />
                Expires: {coupon.expiry && typeof coupon.expiry.toDate === 'function' 
                  ? format(coupon.expiry.toDate(), 'dd MMM yyyy') 
                  : 'Permanent'}
              </div>
            </div>
          ))}
          {coupons.length === 0 && !loading && (
            <div className="col-span-2 py-20 text-center border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
              <Ticket className="h-10 w-10 text-slate-100 mb-4" />
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Zero_Tokens_Detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
