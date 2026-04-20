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
    try {
      await addDoc(collection(db, 'coupons'), {
        code: formData.code.toUpperCase(),
        discount: parseFloat(formData.discount),
        expiry: new Date(formData.expiry),
        createdAt: serverTimestamp(),
      });
      toast.success('Coupon created successfully');
      setFormData({ code: '', discount: '', expiry: '' });
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to create coupon');
    }
  };

  const handleDelete = (id: string) => {
    toast('Delete this coupon permanently?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deleteDoc(doc(db, 'coupons', id));
            toast.success('Coupon deleted');
            fetchCoupons();
          } catch (error) {
            toast.error('Failed to delete coupon');
          }
        }
      },
      cancel: { label: 'Cancel', onClick: () => {} }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#ead9c4] border border-[#777] p-6">
        <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
          Discount <span className="text-slate-900">Coupons</span>
        </h1>
        <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
          Discount Tokens // Manage store discounts and vouchers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#ead9c4] border border-[#777] p-6">
          <h2 className="text-sm font-black text-[#9B2B2C] uppercase mb-6 border-b border-[#777]/30 pb-4">Create New Coupon</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Coupon Code</Label>
              <Input 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})}
                placeholder="e.g. SAVE100"
                className="h-10 bg-white border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-0 focus:border-[#9B2B2C] uppercase"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Discount Amount (৳)</Label>
              <Input 
                type="number"
                value={formData.discount} 
                onChange={e => setFormData({...formData, discount: e.target.value})}
                placeholder="0.00"
                className="h-10 bg-white border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-0 focus:border-[#9B2B2C]"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Expiry Date</Label>
              <Input 
                type="date"
                value={formData.expiry} 
                onChange={e => setFormData({...formData, expiry: e.target.value})}
                className="h-10 bg-white border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-0 focus:border-[#9B2B2C]"
                required 
              />
            </div>
            <Button type="submit" className="w-full bg-[#9B2B2C] hover:bg-[#7a1f1f] text-white rounded-none font-black text-[10px] uppercase h-10 tracking-widest">
              <Plus className="mr-2 h-4 w-4" /> Create Coupon
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-[#ead9c4] border border-[#777] p-5 relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 border border-[#777] bg-white text-[#9B2B2C]">
                  <Ticket className="h-5 w-5" />
                </div>
                <button 
                  onClick={() => handleDelete(coupon.id)}
                  className="text-slate-400 hover:text-[#9B2B2C] uppercase text-[9px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </button>
              </div>
              <h3 className="text-xl font-black tracking-[0.2em] text-[#9B2B2C] mb-1 uppercase">{coupon.code}</h3>
              <p className="text-slate-900 font-black text-sm mb-4">৳{(coupon.discount || 0).toLocaleString()} DISCOUNT</p>
              <div className="flex items-center gap-2 text-[9px] text-[#9B2B2C] font-black uppercase bg-white/50 p-2 border border-[#777]/20">
                <Calendar className="h-3 w-3" />
                EXPIRES: {coupon.expiry && typeof coupon.expiry.toDate === 'function' 
                  ? format(coupon.expiry.toDate(), 'dd MMM yyyy') 
                  : 'PERMANENT'}
              </div>
            </div>
          ))}
          {coupons.length === 0 && !loading && (
            <div className="col-span-2 py-10 text-center bg-[#ead9c4]/50 border-2 border-dashed border-[#777]/30 flex flex-col items-center justify-center">
              <Ticket className="h-10 w-10 text-slate-400/50 mb-2" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No active coupons found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
