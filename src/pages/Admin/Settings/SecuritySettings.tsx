import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { SiteSettings } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Save, Shield, User, Lock, Mail, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const SecuritySettings = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SiteSettings);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), settings, { merge: true });
      toast.success('Security protocols locked');
    } catch (error) {
      toast.error('Identity sync failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-black uppercase text-slate-400">Verifying Identity Module...</div>;

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-[#faf6f0] border-2 border-slate-900 overflow-hidden hover:border-[#8B1E1E] transition-all shadow-sm">
        <div className="bg-[#ead9c4]/30 px-6 py-4 flex flex-row items-center justify-between border-b-2 border-slate-900">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#8B1E1E]" /> Admin Access Vault
          </span>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-8 px-5 bg-[#8B1E1E] hover:bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 disabled:opacity-50 border-2 border-slate-900 shadow-sm cursor-pointer"
          >
            {saving ? 'Processing...' : 'Secure Save'}
          </button>
        </div>
        <div className="p-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-700 flex items-center gap-2">
                  <User className="h-3 w-3 text-[#8B1E1E]" /> System Username
                </Label>
                <Input 
                  value={settings.adminCredentials?.username || ''} 
                  onChange={e => {
                    setSettings({...settings, adminCredentials: { ...(settings.adminCredentials || {}), username: e.target.value }});
                  }}
                  className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-700 flex items-center gap-2">
                  <Lock className="h-3 w-3 text-[#8B1E1E]" /> System Password
                </Label>
                <Input 
                  value={settings.adminCredentials?.pass || ''} 
                  onChange={e => {
                    setSettings({...settings, adminCredentials: { ...(settings.adminCredentials || {}), pass: e.target.value }});
                  }}
                  className="h-12 bg-white border-2 border-slate-900 rounded-none font-black text-sm text-slate-900 focus:border-[#8B1E1E] outline-none shadow-sm"
                />
              </div>
           </div>

           <div className="pt-8 border-t-2 border-slate-900/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-700 tracking-widest flex items-center gap-2">
                    <Mail className="h-3 w-3 text-[#8B1E1E]" /> Authorized Admin Emails
                  </Label>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Direct Google Auth Access Permission List</p>
                </div>
                <button 
                  onClick={() => {
                    const newList = [...(settings.adminEmails || [])];
                    newList.push('');
                    setSettings({...settings, adminEmails: newList});
                  }}
                  className="h-8 px-4 bg-[#ead9c4]/50 hover:bg-[#ead9c4] text-slate-900 font-black uppercase text-[9px] tracking-widest border-2 border-slate-900 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  Authorize New
                </button>
              </div>

              <div className="space-y-3">
                {(settings.adminEmails || []).map((email, i) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      value={email}
                      onChange={e => {
                        const newList = [...(settings.adminEmails || [])];
                        newList[i] = e.target.value;
                        setSettings({...settings, adminEmails: newList});
                      }}
                      placeholder="admin@gmail.com"
                      className="h-10 bg-white border-2 border-slate-900 rounded-none text-xs font-black text-slate-900 focus:border-[#8B1E1E] shadow-sm"
                    />
                    <button 
                      onClick={() => {
                         if (deletingIndex === i) {
                           const newList = (settings.adminEmails || []).filter((_, idx) => idx !== i);
                           setSettings({...settings, adminEmails: newList});
                           setDeletingIndex(null);
                         } else {
                           setDeletingIndex(i);
                           setTimeout(() => setDeletingIndex(null), 3000);
                         }
                      }}
                      className={`h-10 border-2 border-slate-900 transition-all cursor-pointer flex items-center justify-center ${
                        deletingIndex === i 
                          ? "bg-red-600 hover:bg-red-700 text-white px-4 font-black text-[9px] uppercase tracking-widest" 
                          : "w-10 bg-red-100 hover:bg-red-200 text-red-600 font-black"
                      }`}
                    >
                      {deletingIndex === i ? 'SURE?' : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
