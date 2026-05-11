import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { User, Camera, Save, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { optimizeProfileImage } from '../../lib/image-utils';

const AdminProfile = () => {
  const { profile, user, refreshProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    photoURL: profile?.photoURL || user?.photoURL || ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        photoURL: profile.photoURL || user?.photoURL || ''
      });
    }
  }, [profile, user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const optimized = await optimizeProfileImage(reader.result as string);
          setFormData(prev => ({ ...prev, photoURL: optimized }));
        } catch (err) {
          toast.error('Image optimization failed');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Identity sync blocked. You must be signed in through the Google Authentication protocol to modify administrative persona.');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Synchronizing identity changes...');
    
    try {
      await updateUserProfile({
        name: formData.name,
        photoURL: formData.photoURL
      });
      
      toast.dismiss(loadingToast);
      toast.success('ADMIN_IDENTITY_LOCKED: Profile synchronized successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.dismiss(loadingToast);
      toast.error(`SYNC_FAILURE: ${error.message || 'Verification timed out'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-slate-50 border-b border-slate-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-6 bg-brand-primary" />
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Admin Account
            </h1>
          </div>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">
            Admin User // Access Level: Full Access // Status: Active
          </p>
        </div>
        <div className="p-3 bg-brand-primary text-white font-black text-[10px] tracking-widest uppercase border border-white/10 hidden md:flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-white" /> Secure Access
        </div>
      </div>

      <div className="p-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-slate-200 overflow-hidden hover:border-brand-primary transition-all">
            <div className="p-4 bg-brand-primary text-white border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <User className="h-4 w-4 text-white" /> Profile Information
              </span>
            </div>
            <div className="p-8">
              <form onSubmit={handleSave} className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8 border-b border-slate-50 pb-8">
                  <div className="relative group">
                    <div className="w-32 h-32 overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center transition-all group-hover:border-brand-primary">
                      {formData.photoURL ? (
                        <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      ) : (
                        <User className="w-12 h-12 text-slate-200" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                      <Camera className="w-6 h-6 text-white" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-1">Profile Photo</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Recommended: image/png or image/jpeg.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Administrative Name</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-black text-xs focus:border-brand-primary outline-none focus-visible:ring-0 uppercase tracking-tight"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comm_Channel (Email)</Label>
                    <Input 
                      value={user?.email || ''}
                      disabled
                      className="h-10 bg-slate-100 border-slate-200 text-slate-400 rounded-none font-bold text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-12 bg-brand-primary hover:bg-slate-900 text-white font-black uppercase tracking-widest px-8 rounded-none transition-all active:scale-95 shadow-xl"
                >
                  <Save className="mr-3 h-4 w-4" /> {loading ? 'Saving...' : 'Update Profile'}
                </Button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-50 border border-slate-100 p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="h-3 w-3 text-brand-primary" /> SECURITY_NOTICE
              </h3>
              <p className="text-[9px] leading-relaxed font-bold text-slate-400 uppercase tracking-widest">
                Identity changes are broadcasted system-wide. 
                Any modification to administrative personas will be logged in the global auditing registry for verification.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-1.5 h-6 bg-brand-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Account Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black uppercase py-2 border-b border-slate-50">
                  <span className="text-slate-400">Connection</span>
                  <span className="text-emerald-500">STABLE</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase py-2 border-b border-slate-50">
                  <span className="text-slate-400">Identity</span>
                  <span className="text-slate-900 underline">VERIFIED</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase py-2">
                  <span className="text-slate-400">Auth_Protocol</span>
                  <span className="text-slate-900 font-mono">FIREBASE_V9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
