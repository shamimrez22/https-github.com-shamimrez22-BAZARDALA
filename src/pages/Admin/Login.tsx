import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Lock, User, ShieldCheck, Mail, AlertCircle, ShoppingBasket, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryGmail, setRecoveryGmail] = useState('');
  const [recoveryAppPass, setRecoveryAppPass] = useState('');
  const [masterPin, setMasterPin] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const { loginAdmin, loginWithGoogle, isAdmin, loading, adminCreds } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, loading, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(username, password)) {
      toast.success('অ্যাডমিন হিসেবে সফলভাবে লগইন করেছেন');
      navigate('/admin');
    } else {
      toast.error('ভুল ইউজারনেম বা পাসওয়ার্ড');
    }
  };

  const [isRecovering, setIsRecovering] = useState(false);

  const handleManualRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecovering(true);

    try {
      const response = await fetch('/api/admin/send-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryGmail,
          appPassword: recoveryAppPass,
          masterPin: masterPin
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'আপনার ইমেইলে একটি ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে।');
      } else {
        toast.error(data.error || 'রিকভারি রিকোয়েস্ট ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error('Recovery error:', err);
      toast.error('সার্ভার ত্রুটি। অনুগ্রহ করে পরে চেষ্টা করুন।');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleGoogleRecovery = async () => {
    try {
      await loginWithGoogle();
      toast.success('সুপার অ্যাডমিন হিসেবে লগইন করেছেন');
    } catch (err: any) {
      console.error(err);
      toast.error('রিকভারি ব্যর্থ হয়েছে: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f4e4d4] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--primary-color) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ead9c4] border-2 border-brand-primary text-brand-primary shadow-2xl mb-6 relative">
            <ShoppingBasket className="h-10 w-10" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-brand-primary" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-brand-primary" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">BAZAR<span className="text-brand-primary"> DALA</span> Admin</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Control_OS // Secure_Access</p>
        </div>

        <div className="bg-[#ead9c4] border border-[#777] shadow-2xl relative">
          <div className="bg-brand-primary p-4 text-white flex items-center justify-between border-b border-[#777]">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> অথেন্টিকেশন প্রোটোকল
            </h2>
          </div>

          <div className="p-10 bg-white/40">
            {!showRecovery ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">ইউজারনেম</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary" />
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-12 bg-white border-[#777] text-slate-900 rounded-none h-14 font-black text-xs focus-visible:ring-0 focus-visible:border-brand-primary"
                      placeholder="Enter Admin ID"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">পাসওয়ার্ড</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 bg-white border-[#777] text-slate-900 rounded-none h-14 font-black text-xs focus-visible:ring-0 focus-visible:border-brand-primary"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 bg-brand-primary hover:bg-slate-900 text-white font-black rounded-none shadow-xl uppercase tracking-[0.3em] text-xs transition-all active:scale-[0.98] border border-[#777]/20"
                >
                  লগইন করুন
                </Button>

                <div className="pt-4 text-center">
                  <button 
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline flex items-center justify-center gap-2 mx-auto"
                  >
                    <AlertCircle className="h-3 w-3" /> পাসওয়ার্ড ভুলে গেছেন? (রিকভারি)
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="mb-4">
                   <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8" />
                   </div>
                   <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900">অ্যাডমিন রিকভারি প্রোটোকল</h3>
                   <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 leading-relaxed">
                     আপনার সেট করা Recovery Gmail এবং App Password টাইপ করুন।
                   </p>
                </div>

                <form onSubmit={handleManualRecovery} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Recovery Gmail</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary" />
                      <Input
                        type="email"
                        value={recoveryGmail}
                        onChange={(e) => setRecoveryGmail(e.target.value)}
                        className="pl-12 bg-white border-[#777] text-slate-900 rounded-none h-12 font-black text-xs"
                        placeholder="আপনার সেভ করা জিমেইল"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Gmail App Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary" />
                      <Input
                        type="password"
                        value={recoveryAppPass}
                        onChange={(e) => setRecoveryAppPass(e.target.value)}
                        className="pl-12 bg-white border-[#777] text-slate-900 rounded-none h-12 font-black text-xs"
                        placeholder="••••••••••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Master Security PIN</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary" />
                      <Input
                        type="text"
                        maxLength={6}
                        value={masterPin}
                        onChange={(e) => setMasterPin(e.target.value)}
                        className="pl-12 bg-white border-[#777] text-slate-900 rounded-none h-12 font-black text-xs"
                        placeholder="৬ ডিজিট পিন"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isRecovering}
                    className="w-full h-14 bg-slate-900 hover:bg-brand-primary text-white font-black rounded-none uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2"
                  >
                    {isRecovering ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> প্রসেসিং...
                      </>
                    ) : 'রিকভারি ইমেইল পাঠান'}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#777]/20"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-[#ead9c4]/40 px-4 text-slate-400">অথবা</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowRecovery(false)}
                  className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary mt-4 block"
                >
                  ব্যাক টু লগইন
                </button>
              </div>
            )}
          </div>

          {/* Decorative Corner Tabs */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-primary" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-primary" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-primary" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-primary" />
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
