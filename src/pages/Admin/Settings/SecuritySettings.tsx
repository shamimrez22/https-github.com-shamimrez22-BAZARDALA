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
    <div className="space-y-6">
      <Card className="rounded-none border-[#777] bg-white shadow-lg overflow-hidden border-t-4 border-t-[#9B2B2C]">
        <CardHeader className="bg-brand-primary text-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Shield className="h-4 w-4" /> Admin Access Vault
          </CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-white text-brand-primary hover:bg-slate-100 h-8 font-black uppercase text-[9px]">
            {saving ? 'Processing...' : <><Save className="mr-2 h-3 w-3" /> Secure Save</>}
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-2">
                  <User className="h-3 w-3" /> System Username
                </Label>
                <Input 
                  value={settings.adminCredentials?.username || ''} 
                  onChange={e => {
                    setSettings({...settings, adminCredentials: { ...(settings.adminCredentials || {}), username: e.target.value }});
                  }}
                  className="h-12 border-[#777] rounded-none font-black text-sm bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-2">
                  <Lock className="h-3 w-3" /> System Password
                </Label>
                <Input 
                  value={settings.adminCredentials?.pass || ''} 
                  onChange={e => {
                    setSettings({...settings, adminCredentials: { ...(settings.adminCredentials || {}), pass: e.target.value }});
                  }}
                  className="h-12 border-[#777] rounded-none font-black text-sm bg-slate-50"
                />
              </div>
           </div>

           <div className="pt-8 border-t border-[#777]/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2">
                    <Mail className="h-3 w-3" /> Authorized Admin Emails
                  </Label>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Direct Google Auth Access Permission List</p>
                </div>
                <Button 
                  onClick={() => {
                    const newList = [...(settings.adminEmails || [])];
                    newList.push('');
                    setSettings({...settings, adminEmails: newList});
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-none border-[#777] font-black uppercase text-[9px] h-8"
                >
                  <Plus className="mr-2 h-3 w-3" /> Authorize New
                </Button>
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
                      className="h-10 border-[#777] rounded-none text-xs font-bold"
                    />
                    <Button 
                      variant="ghost" 
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
                      className={`h-10 transition-all ${deletingIndex === i ? "bg-red-600 text-white px-2 min-w-[70px]" : "w-10 text-red-500 hover:bg-red-50"}`}
                    >
                      {deletingIndex === i ? <span className="text-[8px] font-black uppercase">SURE?</span> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
