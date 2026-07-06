import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Loader2, XCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { safeStorage } from '../../lib/storage';

const AdminVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('ভেরিফিকেশন টোকেন পাওয়া যায়নি।');
        return;
      }

      try {
        const response = await fetch(`/api/admin/verify-recovery?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('পরিচয় সফলভাবে যাচাই করা হয়েছে! আপনাকে অ্যাডমিন প্যানেলে পাঠানো হচ্ছে...');
          
          // Grant admin access
          safeStorage.set('is_admin_session', 'true');
          safeStorage.set('isAdmin', 'true');
          
          setTimeout(() => {
            window.location.href = '/admin';
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'ভেরিফিকেশন ব্যর্থ হয়েছে। টোকেনটি হয়তো মেয়াদোত্তীর্ণ।');
        }
      } catch (err) {
        console.error('Verify error:', err);
        setStatus('error');
        setMessage('সার্ভার ত্রুটি। অনুগ্রহ করে পরে চেষ্টা করুন।');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8B1E1E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#faf6f0] border-2 border-slate-900 shadow-sm p-10 text-center relative"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ead9c4]/70 border-2 border-slate-900 text-slate-900 mb-8 shadow-sm">
          {status === 'verifying' && <Loader2 className="h-10 w-10 animate-spin text-[#8B1E1E]" />}
          {status === 'success' && <CheckCircle className="h-10 w-10 text-[#8B1E1E]" />}
          {status === 'error' && <XCircle className="h-10 w-10 text-red-600" />}
        </div>
        
        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">
          {status === 'verifying' ? 'প্রসেসিং...' : status === 'success' ? 'ভেরিফিকেশন সফল' : 'ভেরিফিকেশন ব্যর্থ'}
        </h2>
        
        <p className="text-xs font-black text-slate-500 uppercase leading-relaxed mb-8">
          {message || 'দয়া করে অপেক্ষা করুন, আমরা আপনার পরিচয় যাচাই করছি।'}
        </p>

        {status === 'error' && (
          <button 
            onClick={() => navigate('/admin/login')}
            className="w-full h-14 bg-[#8B1E1E] hover:bg-slate-950 text-white font-black uppercase tracking-widest text-xs border-2 border-slate-900 cursor-pointer shadow-sm transition-all active:scale-[0.98]"
          >
            লগইন পেজে ফিরে যান
          </button>
        )}
        
        <div className="mt-8 pt-8 border-t-2 border-slate-900/10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Secure_Verify // Bazar_Dala_OS
          </p>
        </div>

        {/* Decorative Corner Tabs */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-slate-900" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-slate-900" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-slate-900" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-900" />
      </motion.div>
    </div>
  );
};

export default AdminVerify;
