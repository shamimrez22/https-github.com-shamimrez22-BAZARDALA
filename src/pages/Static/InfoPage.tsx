import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Truck, HelpCircle, Phone, BookOpen, Users, Briefcase, FileText } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const InfoPage = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const path = location.pathname;

  const siteName = settings?.siteName || 'BAZAR DALA';

  const getPageContent = () => {
    switch (path) {
      case '/help':
        return {
          title: 'Help Center',
          icon: HelpCircle,
          content: `Welcome to ${siteName} Help Center. How can we assist you today? Our team is ready to help with orders, delivery, and account issues.`,
          details: ['How to place an order', 'Payment methods', 'Delivery timelines', 'Voucher usage']
        };
      case '/how-to-buy':
        return {
          title: 'How to Buy',
          icon: BookOpen,
          content: `Buying at ${siteName} is simple. Follow these steps: 1. Add items to cart. 2. Go to checkout. 3. Provide shipping details. 4. Confirm your order.`,
          details: ['Quick Checkout', 'Mobile App Guide', 'Bulk Purchasing', 'Gift Cards']
        };
      case '/returns':
        return {
          title: 'Return Policy',
          icon: Shield,
          content: 'We offer a 7-day easy return policy for defective products. Ensure the product is in its original packaging with all tags attached.',
          details: ['Return Conditions', 'Refund Process', 'Exchange Policy', 'Non-returnable Items']
        };
      case '/contact':
        return {
          title: 'Contact Us',
          icon: Phone,
          content: `Need to get in touch? You can reach us via email at support@${siteName.toLowerCase().replace(/\s/g, '')}.com or call our hotline at +880 1XXX XXXXXX.`,
          details: ['Customer Hotline', 'Email Support', 'Office Address', 'Social Media']
        };
      case '/terms':
        return {
          title: 'Terms & Conditions',
          icon: FileText,
          content: `Please read our terms and conditions carefully before using our services. Your use of ${siteName} signifies your agreement to these terms.`,
          details: ['Privacy Policy', 'Data Security', 'Usage Rights', 'Legal Disclaimer']
        };
      case '/about':
        return {
          title: 'About Us',
          icon: Users,
          content: `${siteName} is Bangladesh’s leading premium online destination for electronics and fashion. We strive for excellence and customer satisfaction.`,
          details: ['Our Mission', 'Our Story', 'Why Choose Us', 'Press & Media']
        };
      case '/careers':
        return {
          title: 'Careers',
          icon: Briefcase,
          content: `Join our team at ${siteName}. We are always looking for talented individuals to help us redefine the e-commerce landscape in Bangladesh.`,
          details: ['Open Positions', 'Culture & Values', 'Employee Benefits', 'Internship Programs']
        };
      case '/blog':
        return {
          title: 'Our Blog',
          icon: BookOpen,
          content: `Stay updated with the latest trends, product launches, and shopping tips from the ${siteName} editorial team.`,
          details: ['Tech Trends', 'Fashion Inspiration', 'Shopping Guides', 'Customer Stories']
        };
      default:
        return {
          title: 'Information Page',
          icon: Info,
          content: `This page provides important information about ${siteName} services.`,
          details: ['General Info', 'Policies', 'Updates']
        };
    }
  };

  const { title, icon: Icon, content, details } = getPageContent();

  return (
    <div className="min-h-[80vh] bg-slate-50/30 py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-none shadow-3xl p-8 md:p-12 border-2 border-[#777] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b-2 border-slate-50 relative z-10">
            <div className="w-20 h-20 bg-slate-50 rounded-none flex items-center justify-center text-brand-primary shadow-inner border border-slate-100 rotate-6 transition-transform hover:rotate-0">
              <Icon size={32} />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-3">
                {title}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-3">
                 <div className="w-1.5 h-1.5 bg-[#9B2B2C] rounded-none animate-pulse" />
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Authorized Information Resource // 2026</p>
              </div>
            </div>
          </div>

          <p className="text-lg md:text-xl font-black text-slate-600 tracking-tight leading-relaxed mb-12 text-center md:text-left">
            {content}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {details.map((item, index) => (
              <div key={index} className="p-6 bg-slate-50 rounded-none border-2 border-transparent hover:border-brand-primary/10 hover:bg-white hover:shadow-xl transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-1 bg-[#9B2B2C]/20 rounded-none group-hover:w-12 group-hover:bg-[#9B2B2C] transition-all duration-500" />
                  <span className="text-[12px] font-black uppercase tracking-widest text-slate-800">{item}</span>
                </div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">
                  [REDACTED_ACCESS_ONLY] // This protocol section is currently under maintenance. Data will be populated via the primary administrative control channel.
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t-2 border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-slate-200 rounded-full" />
                <span>{siteName} // Information_Terminal</span>
             </div>
             <span className="bg-slate-50 px-6 py-2 rounded-full border border-slate-100">Ref_ID: {path.replace('/', '').toUpperCase()}_V_2.0</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Info = HelpCircle; // Fallback icon

export default InfoPage;
