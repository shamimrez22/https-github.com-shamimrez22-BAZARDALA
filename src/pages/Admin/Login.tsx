import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Lock, User, ShoppingBasket, Mail, AlertCircle, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const { loginAdmin, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(username, password)) {
      toast.success('অ্যাডমিন হিসেবে সফলভাবে লগইন করেছেন');
      navigate('/admin');
    } else {
      toast.error('ভুল ইউজারনেম বা পাসওয়ার্ড');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Google এর মাধ্যমে সফলভাবে লগইন করেছেন');
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      toast.error('Google লগইন ব্যর্থ হয়েছে: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f4e4d4] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#9B2B2C 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ead9c4] border-2 border-[#9B2B2C] text-[#9B2B2C] shadow-2xl mb-6 relative">
            <ShoppingBasket className="h-10 w-10" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-[#9B2B2C]" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-[#9B2B2C]" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">BAZAR<span className="text-[#9B2B2C]"> DALA</span> Admin</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Control_OS // BZD-V1.0</p>
        </div>

        <div className="bg-[#ead9c4] border border-[#777] shadow-2xl relative">
          <div className="bg-[#9B2B2C] p-4 text-white flex items-center justify-between border-b border-[#777]">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <ShoppingBasket className="h-4 w-4" /> সিকিউর লগইন
            </h2>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
            </div>
          </div>

          <div className="p-8 bg-white/40">
            {view === 'login' ? (
              <>
                <div className="flex justify-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-[#ead9c4] border border-[#9B2B2C] flex items-center justify-center text-[#9B2B2C]">
                    <User className="h-8 w-8" />
                  </div>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">ইউজারনেম</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B2B2C]" />
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-12 bg-white border-[#777] text-slate-900 rounded-none h-14 font-black text-xs uppercase focus-visible:ring-0 focus-visible:border-[#9B2B2C] tracking-widest"
                        placeholder="ADMIN_ID"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B2B2C]" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 bg-white border-[#777] text-slate-900 rounded-none h-14 font-black text-xs focus-visible:ring-0 focus-visible:border-[#9B2B2C]"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-[#9B2B2C] hover:bg-slate-900 text-white font-black rounded-none shadow-xl uppercase tracking-[0.3em] text-xs transition-all active:scale-[0.98] border border-[#777]/20"
                  >
                    লগইন করুন
                  </Button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#777]/20"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-white px-4 text-slate-400">OR RECOVER VIA</span>
                  </div>
                </div>

                <Button 
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full h-14 border-2 border-[#9B2B2C]/20 hover:border-[#9B2B2C] bg-white text-slate-900 font-black rounded-none uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale" alt="Google" />
                  GOOGLE ADMIN RECOVERY
                </Button>

                <div className="mt-8 text-center pt-4 border-t border-[#777]/10">
                  <button 
                    onClick={() => setView('forgot')}
                    className="text-[10px] font-black text-[#9B2B2C] uppercase tracking-widest hover:underline flex items-center justify-center gap-2 mx-auto"
                  >
                    <AlertCircle className="h-3 w-3" /> পাসওয়ার্ড ভুলে গেছেন? (রিকভারি)
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-8 py-4">
                <div className="text-center">
                   <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mx-auto mb-6">
                      <Lock className="h-8 w-8" />
                   </div>
                   <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900">অ্যাডমিন রিকভারি প্রোটোকল</h3>
                   <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 leading-relaxed">
                     আপনি যদি আপনার ইউজারনেম বা পাসওয়ার্ড ভুলে গিয়ে থাকেন, তবে আপনার রেজিস্টার্ড <span className="text-[#9B2B2C]">Admin Google Account</span> দিয়ে সরাসরি লগইন করে ড্যাশবোর্ড থেকে পাসওয়ার্ড দেখে নিতে পারেন।
                   </p>
                </div>

                <div className="p-4 bg-[#ead9c4]/30 border border-dashed border-[#9B2B2C]/30 text-center">
                   <p className="text-[9px] font-black uppercase text-[#9B2B2C]">Authorized Admin Email Only:</p>
                   <p className="text-[11px] font-black text-slate-700 mt-1">shamimrez22@gmail.com</p>
                </div>

                <Button 
                  onClick={handleGoogleLogin}
                  className="w-full h-14 bg-[#9B2B2C] hover:bg-slate-900 text-white font-black rounded-none shadow-xl uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3"
                >
                   <Mail className="h-4 w-4" /> গুগল দিয়ে রিকভার করুন
                </Button>

                <button 
                  onClick={() => setView('login')}
                  className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#9B2B2C] transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> ব্যাক টু লগইন
                </button>
              </div>
            )}
          </div>

          {/* Decorative Corner Tabs */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#9B2B2C]" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#9B2B2C]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#9B2B2C]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#9B2B2C]" />
        </div>
        
        <div className="text-center mt-10">
           <div className="inline-block px-4 py-1 border border-[#777]/30 bg-[#ead9c4]/30">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                &copy; 2026 BAZAR DALA // Protocol Secured
              </p>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
