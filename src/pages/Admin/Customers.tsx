import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile } from '../../types';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Search, Mail, Phone, MapPin, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const handleDeleteClient = (uid: string) => {
    toast('Wipe this client profile?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deleteDoc(doc(db, 'users', uid));
            toast.success('PROFILE_WIPED: Record removed');
            fetchCustomers();
          } catch (error) {
            console.error('Delete client error:', error);
            toast.error('Wipe Failure');
          }
        }
      },
      cancel: { label: 'Cancel', onClick: () => {} }
    });
  };

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#ead9c4] border border-[#777] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
            Customer <span className="text-slate-900">List</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            User Profiles // All Customers
          </p>
        </div>
        <div className="relative flex-1 w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search Customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-white border-[#777] h-10 rounded-none text-xs font-bold focus:ring-0 focus:border-[#9B2B2C]"
          />
        </div>
      </div>

      <div className="bg-[#ead9c4] border border-[#777] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#9B2B2C] text-white">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Email Address</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">User Role</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Wishlist</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#777]/30 bg-white/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 font-black text-[10px] uppercase text-slate-500">Finding customers...</td>
                </tr>
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.uid} className="hover:bg-[#ead9c4]/30 transition-all font-bold">
                  <td className="px-6 py-4 border-r border-[#777]/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-[#777] bg-white rounded-none flex items-center justify-center p-1">
                        <Avatar className="h-full w-full rounded-none">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.email}`} />
                          <AvatarFallback className="rounded-none bg-[#ead9c4] text-[#9B2B2C] font-black">{(customer.name || 'U')[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{customer.name || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-[#777]/20">
                    <div className="text-[10px] text-slate-600 lowercase font-mono">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 border-r border-[#777]/20">
                    <span className="text-[9px] font-black uppercase py-1 px-3 border border-[#777]/30 bg-[#ead9c4] text-slate-700">
                      {customer.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-r border-[#777]/20">
                    <div className="text-[10px] text-slate-500 uppercase tracking-tight">
                      {customer.wishlist?.length || 0} Items
                    </div>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-4 rounded-none bg-white border-[#777] text-[9px] font-black uppercase hover:bg-[#ead9c4]">
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteClient(customer.uid)}
                      className="h-8 px-3 rounded-none bg-white border-rose-200 text-rose-600 text-[9px] font-black uppercase hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
