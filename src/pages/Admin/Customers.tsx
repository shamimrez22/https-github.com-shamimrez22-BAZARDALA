import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';
import { db } from '../../firebase';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Search, ShieldPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'customer'));
      const snapshot = await getDocs(q);
      setCustomers(snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile)));
    } catch (error) {
      console.error('Fetch customers error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handlePromote = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { 
        role: 'admin',
        status: 'active'
      });
      setCustomers(prev => prev.filter(c => c.uid !== uid));
      toast.success('User promoted to Staff Admin');
    } catch (error) {
      toast.error('Promotion failed - check permissions');
    }
  };

  const handleDeleteClient = async (uid: string) => {
    if (!window.confirm('Wipe this client profile permanently?')) return;
    
    const originalCustomers = [...customers];
    try {
      // Optimistic Delete
      setCustomers(prev => prev.filter(c => c.uid !== uid));
      await deleteDoc(doc(db, 'users', uid));
      toast.success('PROFILE_WIPED: Record removed');
    } catch (error) {
      console.error('Delete client error:', error);
      setCustomers(originalCustomers);
      toast.error('Wipe Failure');
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-[#ead9c4] border-b border-[#777] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
            Customer <span className="text-slate-900">Registry</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Registered customer profiles // Operation Protocol 14 // {customers.length} Active Records
          </p>
        </div>
        <div className="relative flex-1 w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest focus:border-brand-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="p-8">
        <div className="bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-brand-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] border-r border-white/10">Customer Name</th>
                  <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] border-r border-white/10">Email</th>
                  <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] border-r border-white/10">Role</th>
                  <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] border-r border-white/10">Recent Activity</th>
                  <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20 font-black text-[10px] uppercase text-slate-300 tracking-[0.2em]">Loading customers...</td>
                  </tr>
                ) : filteredCustomers.map((customer) => (
                  <tr key={customer.uid} className="hover:bg-slate-50 transition-all font-bold group">
                    <td className="px-6 py-4 border-r border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-slate-100 bg-slate-50 overflow-hidden p-0.5">
                          <Avatar className="h-full w-full rounded-none">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.email}`} className="grayscale group-hover:grayscale-0 transition-all" />
                            <AvatarFallback className="rounded-none bg-slate-100 text-slate-400 font-black text-[10px]">{(customer.name || 'U')[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{customer.name || 'Guest'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-100">
                      <div className="text-[10px] text-slate-400 lowercase font-mono tracking-tight group-hover:text-slate-900 transition-colors">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-100">
                      <span className="text-[8px] font-black uppercase py-1 px-3 bg-slate-50 border border-slate-100 text-slate-500 group-hover:text-brand-primary group-hover:border-brand-primary/20 transition-all tracking-[0.1em]">
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase tracking-tighter">
                        WISHLIST ITEMS: <span className="text-slate-900">{customer.wishlist?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {isSuperAdmin && (
                        <button 
                          onClick={() => handlePromote(customer.uid)}
                          title="Promote to Staff Admin"
                          className="h-8 px-4 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[8px] font-black uppercase hover:bg-brand-primary hover:text-white transition-all shadow-none"
                        >
                          <ShieldPlus className="h-4 w-4" />
                        </button>
                      )}
                      <button className="h-8 px-4 bg-slate-50 border border-slate-200 text-slate-900 text-[8px] font-black uppercase hover:bg-white transition-all">
                        Details
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (deletingUid === customer.uid) {
                            handleDeleteClient(customer.uid);
                            setDeletingUid(null);
                          } else {
                            setDeletingUid(customer.uid);
                            setTimeout(() => setDeletingUid(null), 3000);
                          }
                        }}
                        className={`h-8 flex items-center justify-center border transition-all ${
                          deletingUid === customer.uid 
                            ? "bg-rose-600 text-white border-rose-600 px-4 min-w-[80px]" 
                            : "w-8 bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white"
                        }`}
                        title={deletingUid === customer.uid ? "Confirm Delete" : "Delete"}
                      >
                        {deletingUid === customer.uid ? (
                          <span className="text-[7px] font-black uppercase">SURE?</span>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
