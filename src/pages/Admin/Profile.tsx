import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { User, Camera, Save, ShieldCheck } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-[#ead9c4] border border-[#777] p-8 shadow-md">
        <h1 className="text-3xl font-black text-[#9B2B2C] uppercase tracking-tighter">Admin <span className="text-slate-900">Account</span></h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
          <ShieldCheck className="h-3 w-3 text-[#9B2B2C]" />
          Manage Administrative Identity & Credentials
        </p>
      </div>

      <Card className="rounded-none border-[#777] bg-white shadow-xl overflow-hidden">
        <CardHeader className="bg-[#9B2B2C] text-white py-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-lg overflow-hidden border-4 border-[#ead9c4] shadow-lg bg-[#ead9c4]/30 flex items-center justify-center">
                  {formData.photoURL ? (
                    <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-slate-400" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                  <Camera className="w-8 h-8 text-white" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase">Click image to upload new photo</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600">Full Administrative Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-12 bg-white border-[#777] rounded-none font-black text-sm uppercase focus:outline-none focus:border-[#9B2B2C]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-600">Email Address (Read-only)</Label>
                <Input 
                  value={user?.email || ''}
                  disabled
                  className="h-12 bg-slate-50 border-[#777]/30 rounded-none font-bold text-sm text-slate-400"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#9B2B2C] hover:bg-slate-900 text-white font-black uppercase tracking-widest h-14 rounded-none shadow-xl transition-all active:scale-95"
            >
              <Save className="mr-3 h-5 w-5" /> {loading ? 'UPDATING...' : 'SAVE_ACCOUT_CHANGES'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-[#9B2B2C] border border-[#777] p-6 text-white">
        <h3 className="text-xs font-black uppercase tracking-widest mb-3">Security Protocol</h3>
        <p className="text-[10px] leading-relaxed font-bold opacity-80 uppercase tracking-tight">
          Admin account changes are synchronized across the entire platform. 
          Updating your profile photo will affect how your identity is displayed in the dashboard and logs.
        </p>
      </div>
    </div>
  );
};

export default AdminProfile;
