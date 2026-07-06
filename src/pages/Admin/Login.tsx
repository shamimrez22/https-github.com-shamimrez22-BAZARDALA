import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Lock, User, ShieldCheck, Mail, AlertCircle, ShoppingBasket, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryGmail, setRecoveryGmail] = useState('');
  const [recoveryAppPass, setRecoveryAppPass] = useState('');
  const [masterPin, setMasterPin] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [showRecoveryAppPass, setShowRecoveryAppPass] = useState(true);
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

  return (
    <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8B1E1E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ead9c4]/70 border-2 border-slate-900 text-slate-900 shadow-sm mb-6 relative">
            <ShoppingBasket className="h-10 w-10 text-[#8B1E1E]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-slate-900" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-slate-900" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">BAZAR<span className="text-[#8B1E1E]"> DALA</span> Admin</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Control_OS // Secure_Access</p>
        </div>

        <div className="bg-[#faf6f0] border-2 border-slate-900 shadow-sm relative">
          <div className="bg-[#ead9c4]/50 p-4 text-slate-900 flex items-center justify-between border-b-2 border-slate-900">
            <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-900">
              <ShieldCheck className="h-4 w-4 text-[#8B1E1E]" /> অথেন্টিকেশন প্রোটোকল
            </h2>
          </div>

          <div className="p-10">
            {!showRecovery ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">ইউজারনেম</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B1E1E]" />
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-12 bg-white border-2 border-slate-900 text-slate-900 rounded-none h-14 font-black text-xs focus-visible:ring-0 focus:border-[#8B1E1E]"
                      placeholder="Enter Admin ID"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">পাসওয়ার্ড</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B1E1E]" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 bg-white border-2 border-slate-900 text-slate-900 rounded-none h-14 font-black text-xs focus-visible:ring-0 focus:border-[#8B1E1E]"
                      placeholder="Enter Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full h-14 bg-[#8B1E1E] hover:bg-slate-950 text-white font-black rounded-none shadow-sm uppercase tracking-[0.3em] text-xs transition-all active:scale-[0.98] border-2 border-slate-900 cursor-pointer"
                >
                  লগইন করুন
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-slate-900/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-[#faf6f0] px-4 text-slate-400">অথবা</span>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={async () => {
                    try {
                      await loginWithGoogle();
                    } catch (err) {}
                  }}
                  className="w-full h-14 bg-white hover:bg-[#ead9c4]/25 text-slate-900 font-black rounded-none shadow-sm uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98] border-2 border-slate-900 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  গুগল দিয়ে প্রবেশ (সুপার অ্যাডমিন)
                </button>

                <div className="pt-4 text-center">
                  <button 
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="text-[10px] font-black text-[#8B1E1E] uppercase tracking-widest hover:underline flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    <AlertCircle className="h-3 w-3" /> পাসওয়ার্ড ভুলে গেছেন? (রিকভারি)
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="mb-4">
                   <div className="w-16 h-16 rounded-none bg-rose-50 border-2 border-slate-900 flex items-center justify-center text-[#8B1E1E] mx-auto mb-4 shadow-sm">
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
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B1E1E]" />
                      <Input
                        type="email"
                        value={recoveryGmail}
                        onChange={(e) => setRecoveryGmail(e.target.value)}
                        className="pl-12 bg-white border-2 border-slate-900 text-slate-900 rounded-none h-12 font-black text-xs"
                        placeholder="আপনার সেভ করা জিমেইল"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Gmail App Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B1E1E]" />
                      <Input
                        type={showRecoveryAppPass ? "text" : "password"}
                        value={recoveryAppPass}
                        onChange={(e) => setRecoveryAppPass(e.target.value)}
                        className="pl-12 pr-12 bg-white border-2 border-slate-900 text-slate-900 rounded-none h-12 font-black text-xs"
                        placeholder="Gmail App Password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRecoveryAppPass(!showRecoveryAppPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showRecoveryAppPass ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Master Security PIN</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B1E1E]" />
                      <Input
                        type="text"
                        maxLength={6}
                        value={masterPin}
                        onChange={(e) => setMasterPin(e.target.value)}
                        className="pl-12 bg-white border-2 border-slate-900 text-slate-900 rounded-none h-12 font-black text-xs"
                        placeholder="৬ ডিজিট পিন"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isRecovering}
                    className="w-full h-14 bg-slate-900 hover:bg-[#8B1E1E] text-white font-black rounded-none uppercase tracking-[0.2em] text-xs transition-all border-2 border-slate-900 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isRecovering ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" /> প্রসেসিং...
                      </>
                    ) : 'রিকভারি ইমেইল পাঠান'}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-slate-900/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-[#faf6f0] px-4 text-slate-400">অথবা</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowRecovery(false)}
                  className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-[#8B1E1E] mt-4 block cursor-pointer"
                >
                  ব্যাক টু লগইন
                </button>
              </div>
            )}
          </div>

          {/* Decorative Corner Tabs */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-slate-900" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-slate-900" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-slate-900" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-900" />
        </div>
        
        <div className="text-center mt-10">
           <div className="inline-block px-4 py-1 border-2 border-slate-900 bg-[#ead9c4]/30 shadow-sm">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                &copy; 2026 BAZAR DALA // Protocol Secured
              </p>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
