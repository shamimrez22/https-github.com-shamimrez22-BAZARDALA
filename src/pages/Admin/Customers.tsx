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
    <div className="flex flex-col min-h-screen bg-[#f4efe6]">
      <div className="bg-[#ead9c4] border-b-2 border-slate-900 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#8B1E1E] uppercase tracking-tight flex items-center gap-3">
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
            className="w-full pl-10 pr-4 h-10 bg-white border-2 border-slate-900 text-[10px] font-black uppercase tracking-widest focus:border-[#8B1E1E] outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="p-8">
        <div className="bg-[#faf6f0] border-2 border-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#8B1E1E] text-white">
                <tr>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>CUSTOMER NAME</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(গ্রাহকের নাম)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>EMAIL</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(ইমেইল)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>ROLE</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(রোল/পদবী)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>RECENT ACTIVITY</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(কার্যক্রম)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em]">
                    <div className="flex flex-col">
                      <span>ACTIONS</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(পদক্ষেপ)</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/10 bg-[#faf6f0]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20 font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">Loading customers...</td>
                  </tr>
                ) : filteredCustomers.map((customer) => (
                  <tr key={customer.uid} className="hover:bg-[#ebd9c4]/10 transition-all font-bold group">
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-slate-900/10 bg-slate-50 overflow-hidden p-0.5">
                          <Avatar className="h-full w-full rounded-none">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.email}`} className="grayscale group-hover:grayscale-0 transition-all" />
                            <AvatarFallback className="rounded-none bg-slate-100 text-slate-400 font-black text-[10px]">{(customer.name || 'U')[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{customer.name || 'Guest'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <div className="text-[10px] text-slate-500 lowercase font-mono tracking-tight group-hover:text-slate-900 transition-colors">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <span className="text-[8px] font-black uppercase py-1 px-3 bg-[#f4efe6] border border-slate-900/10 text-slate-500 group-hover:text-[#8B1E1E] group-hover:border-[#8B1E1E]/20 transition-all tracking-[0.1em]">
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <div className="text-[10px] text-slate-500 uppercase tracking-tighter">
                        WISHLIST ITEMS: <span className="text-slate-900">{customer.wishlist?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {isSuperAdmin && (
                        <button 
                          onClick={() => handlePromote(customer.uid)}
                          title="Promote to Staff Admin"
                          className="h-8 px-4 bg-[#8B1E1E]/15 border-2 border-slate-900 text-[#8B1E1E] text-[8px] font-black uppercase hover:bg-[#8B1E1E] hover:text-white transition-all shadow-sm cursor-pointer"
                        >
                          <ShieldPlus className="h-4 w-4" />
                        </button>
                      )}
                      <button className="h-8 px-4 bg-[#faf6f0] border-2 border-slate-900 text-slate-900 text-[8px] font-black uppercase hover:bg-[#ebd9c4]/30 transition-all cursor-pointer shadow-sm">
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
                        className={`h-8 flex items-center justify-center border-2 border-slate-900 transition-all cursor-pointer shadow-sm ${
                          deletingUid === customer.uid 
                            ? "bg-rose-600 text-white border-rose-600 px-4 min-w-[80px]" 
                            : "w-8 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
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
