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
    <div className="min-h-[80vh] bg-brand-bg py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#777] shadow-[10px_10px_0px_#9B2B2C] p-10 md:p-16"
        >
          <div className="flex items-center gap-6 mb-10 border-b-2 border-[#9B2B2C] pb-6">
            <div className="w-16 h-16 bg-brand-secondary border border-[#777] flex items-center justify-center text-[#9B2B2C]">
              <Icon size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              {title}
            </h1>
          </div>

          <p className="text-lg font-bold text-slate-700 uppercase tracking-tight leading-relaxed mb-12">
            {content}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {details.map((item, index) => (
              <div key={index} className="p-6 bg-brand-bg/30 border border-[#777]/30 group hover:border-[#9B2B2C] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-[#9B2B2C] group-hover:w-8 transition-all" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#9B2B2C]">{item}</span>
                </div>
                <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose">
                  [DEMO_CONTENT_PROTOCOL] // This section is currently in demo mode. Final content will be updated soon via the Admin Control Center settings protocol.
                </p>
              </div>
            ))}
          </div>

          <div className="mt-20 pt-10 border-t border-[#777]/20 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
             <span>{siteName} // Terminal_Info</span>
             <span>Ref_ID: {path.replace('/', '').toUpperCase()}_2026</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Info = HelpCircle; // Fallback icon

export default InfoPage;
