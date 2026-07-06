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
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this coupon permanently?')) return;
    
    const originalCoupons = [...coupons];
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
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f4efe6]">
      <div className="bg-[#ead9c4] border-b-2 border-slate-900 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#8B1E1E] uppercase tracking-tight flex items-center gap-3">
            Discount <span className="text-slate-900">Coupons</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Voucher Ledger System // Operation Protocol 55 // {coupons.length} Active Coupons
          </p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-[#faf6f0] border-2 border-slate-900 shadow-sm p-8 hover:border-[#8B1E1E] transition-all">
          <h2 className="text-xs font-black text-slate-900 uppercase mb-8 border-b-2 border-slate-900/10 pb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#8B1E1E]" /> Create New Coupon
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Coupon Code</Label>
              <Input 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})}
                placeholder="e.g. SAVE100"
                className="h-10 bg-white border-2 border-slate-900 text-slate-900 rounded-none font-bold text-xs focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase shadow-sm"
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
                className="h-10 bg-white border-2 border-slate-900 text-slate-900 rounded-none font-bold text-xs focus:border-[#8B1E1E] outline-none focus-visible:ring-0 shadow-sm"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expiry Date</Label>
              <Input 
                type="date"
                value={formData.expiry} 
                onChange={e => setFormData({...formData, expiry: e.target.value})}
                className="h-10 bg-white border-2 border-slate-900 text-slate-900 rounded-none font-bold text-xs focus:border-[#8B1E1E] outline-none focus-visible:ring-0 shadow-sm"
                required 
              />
            </div>
            <Button type="submit" className="w-full bg-[#8B1E1E] hover:bg-slate-950 text-white rounded-none font-black text-[10px] uppercase h-12 tracking-widest transition-all active:scale-95 border-2 border-slate-900 shadow-sm cursor-pointer flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> Save Coupon
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-[#faf6f0] border-2 border-slate-900 shadow-sm p-6 relative group hover:border-[#8B1E1E] transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-white border-2 border-slate-900 shadow-sm text-[#8B1E1E]">
                  <Ticket className="h-4 w-4" />
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (deletingId === coupon.id) {
                      handleDelete(coupon.id);
                      setDeletingId(null);
                    } else {
                      setDeletingId(coupon.id);
                      setTimeout(() => setDeletingId(null), 3000);
                    }
                  }}
                  className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border-2 border-slate-900 transition-all shadow-sm cursor-pointer ${
                    deletingId === coupon.id 
                      ? "bg-rose-600 text-white" 
                      : "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
                  }`}
                >
                  {deletingId === coupon.id ? "SURE?" : "Delete"}
                </button>
              </div>
              <h3 className="text-2xl font-black tracking-tighter text-slate-900 mb-2 uppercase">{coupon.code}</h3>
              <p className="text-[#8B1E1E] font-black text-sm mb-6 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#8B1E1E]/20" />
                Discount: ৳{(coupon.discount || 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-[9px] text-slate-500 font-black uppercase bg-[#f4efe6] p-3 border border-slate-900/10">
                <Calendar className="h-3 w-3 text-slate-400" />
                Expires: {coupon.expiry && typeof coupon.expiry.toDate === 'function' 
                  ? format(coupon.expiry.toDate(), 'dd MMM yyyy') 
                  : 'Permanent'}
              </div>
            </div>
          ))}
          {coupons.length === 0 && !loading && (
            <div className="col-span-2 py-20 text-center border-2 border-dashed border-slate-900/10 flex flex-col items-center justify-center bg-[#faf6f0]">
              <Ticket className="h-10 w-10 text-slate-300 mb-4" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Zero_Tokens_Detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
