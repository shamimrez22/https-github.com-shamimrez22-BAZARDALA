import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ShoppingBasket, User, UserPlus, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      if (authMode === 'login') {
        const emailToUse = formData.email.includes('@') ? formData.email : `${formData.email}@bazardala.com`;
        await login(emailToUse, formData.password);
        toast.success('Login successful');
      } else {
        if (!formData.name) {
          toast.error('Please provide your name');
          setIsLoggingIn(false);
          return;
        }
        const emailToUse = formData.email.includes('@') ? formData.email : `${formData.email}@bazardala.com`;
        await register(emailToUse, formData.password, formData.name);
        toast.success('Account created successfully');
      }
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Auth error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white border border-slate-100 shadow-2xl relative overflow-hidden"
      >
        {/* Top Accent Bar */}
        <div className="h-2 w-full bg-brand-primary" />
        
        <div className="p-8 md:p-12">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-brand-primary flex items-center justify-center mb-4 rotate-3 group-hover:rotate-0 transition-transform">
              <ShoppingBasket className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              BAZAR<span className="text-brand-primary">DALA</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">PREMIUM_SHOP_PROTOCOL</p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {authMode === 'login' ? 'CUSTOMER LOGIN' : 'CREATE ACCOUNT'}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                {authMode === 'login' ? 'ACCESS YOUR PERSONAL DASHBOARD' : 'JOIN OUR PREMIUM COMMUNITY'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {authMode === 'register' && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">YOUR NAME</Label>
                  <Input 
                    required
                    placeholder="NAME"
                    className="h-12 bg-slate-50 border-slate-200 rounded-none font-bold placeholder:text-slate-300"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">USERNAME / EMAIL</Label>
                <Input 
                  type="text"
                  required
                  placeholder="USERNAME"
                  className="h-12 bg-slate-50 border-slate-200 rounded-none font-bold placeholder:text-slate-300"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">PASSWORD</Label>
                <Input 
                  type="password"
                  required
                  placeholder="PASSWORD"
                  className="h-12 bg-slate-50 border-slate-200 rounded-none font-bold placeholder:text-slate-300"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full h-14 bg-brand-primary hover:opacity-90 text-white font-black rounded-none uppercase tracking-[0.3em] text-xs transition-all active:scale-95 shadow-lg"
              >
                {isLoggingIn ? 'INITIALIZING...' : (authMode === 'login' ? 'LOGIN_ACCESS' : 'REGISTER_NODE')}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100"></span>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase bg-white px-4 text-slate-400 tracking-widest">
                  OR_CONNECT_VIA
                </div>
              </div>

              <Button 
                type="button"
                variant="outline"
                onClick={loginWithGoogle}
                className="w-full h-14 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-black rounded-none uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                LOGIN WITH GOOGLE
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-[11px] font-black text-brand-primary hover:underline transition-all uppercase tracking-widest"
              >
                {authMode === 'login' ? "DON'T HAVE AN ACCOUNT? REGISTER" : "ALREADY HAVE AN ACCOUNT? LOGIN"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
