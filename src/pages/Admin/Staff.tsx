import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Search, Shield, ShieldAlert, ShieldCheck, Trash2, UserMinus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const AdminStaff = () => {
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', 'in', ['admin', 'super_admin']));
      const snapshot = await getDocs(q);
      setStaff(snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile)));
    } catch (error) {
      console.error('Fetch staff error:', error);
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleUpdateRole = async (uid: string, newRole: 'admin' | 'customer') => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setStaff(prev => prev.map(s => s.uid === uid ? { ...s, role: newRole } : s));
      toast.success(`Role updated to ${newRole}`);
      if (newRole === 'customer') {
        setStaff(prev => prev.filter(s => s.uid !== uid));
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleUpdateStatus = async (uid: string, newStatus: 'active' | 'suspended') => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: newStatus });
      setStaff(prev => prev.map(s => s.uid === uid ? { ...s, status: newStatus } : s));
      toast.success(`Account ${newStatus}`);
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  const filteredStaff = staff.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-[#1e293b] text-white p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-7xl mx-auto w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-8 w-8 text-brand-primary" />
              <h1 className="text-3xl font-black uppercase tracking-tighter">Staff Control Center</h1>
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">
              Authorized Admin Nodes // Sovereign Control Override
            </p>
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              placeholder="Query Admin ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-slate-800 border border-slate-700 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-brand-primary transition-all"
            />
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
             <div className="py-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse italic">
                Scanning_Registry_Nodes...
             </div>
          ) : filteredStaff.length === 0 ? (
             <div className="py-20 text-center font-black text-slate-300 uppercase tracking-widest italic border-2 border-dashed border-slate-100">
                No_Authorized_Sub_Admins_Found
             </div>
          ) : filteredStaff.map((member) => (
            <div key={member.uid} className={`group border transition-all ${member.status === 'suspended' ? 'bg-rose-50 border-rose-100 opacity-75' : 'bg-white border-slate-200 hover:border-brand-primary'}`}>
              <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                <div className="relative">
                   <div className={`w-16 h-16 p-1 border ${member.role === 'super_admin' ? 'border-brand-primary' : 'border-slate-200'} bg-white overflow-hidden`}>
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.email}`} />
                        <AvatarFallback className="rounded-none bg-slate-100 font-black">{(member.name || 'A')[0]}</AvatarFallback>
                      </Avatar>
                   </div>
                   {member.role === 'super_admin' && (
                      <div className="absolute -top-2 -right-2 bg-brand-primary text-white p-1 shadow-lg">
                         <Shield className="h-3 w-3" />
                      </div>
                   )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{member.name || 'Anonymous Admin'}</h3>
                    <div className={`px-3 py-0.5 text-[8px] font-black uppercase tracking-widest border ${member.role === 'super_admin' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-slate-900 text-white border-slate-900'}`}>
                      {member.role}
                    </div>
                    {member.status === 'suspended' && (
                       <div className="bg-rose-600 text-white px-3 py-0.5 text-[8px] font-black uppercase tracking-widest">
                          SUSPENDED
                       </div>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-tight">{member.email}</p>
                </div>

                <div className="flex gap-2 flex-wrap justify-center">
                  {member.role !== 'super_admin' ? (
                    <>
                      {member.status === 'active' ? (
                        <Button 
                          onClick={() => handleUpdateStatus(member.uid, 'suspended')}
                          variant="outline" 
                          className="h-10 px-4 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-none font-black text-[9px] uppercase tracking-widest transition-all"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 mr-2" /> Suspend Access
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleUpdateStatus(member.uid, 'active')}
                          variant="outline" 
                          className="h-10 px-4 border-green-200 text-green-600 hover:bg-green-600 hover:text-white rounded-none font-black text-[9px] uppercase tracking-widest transition-all"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Restore Access
                        </Button>
                      )}
                      
                      <Button 
                        onClick={() => handleUpdateRole(member.uid, 'customer')}
                        variant="outline" 
                        className="h-10 px-4 border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white rounded-none font-black text-[9px] uppercase tracking-widest transition-all"
                      >
                        <UserMinus className="h-3.5 w-3.5 mr-2" /> Remove Admin
                      </Button>
                    </>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Immutable Hierarchy Node
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div className="mt-12 bg-slate-50 border border-slate-200 p-8">
           <div className="flex gap-4 items-start">
              <Shield className="h-6 w-6 text-brand-primary shrink-0 mt-1" />
              <div>
                 <h4 className="font-black text-slate-900 uppercase text-xs mb-2">Sovereign Admin Protocols</h4>
                 <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed max-w-3xl">
                    As the Sovereign Super Admin, you have total control over sub-admin nodes. 
                    Anyone logging in with a Google account will initially be marked as a Customer. 
                    You must explicitly elevate them to "Admin" status to grant access to this board. 
                    Suspending a node will instantly block all their write permissions via the Firebase Security Layer.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStaff;
