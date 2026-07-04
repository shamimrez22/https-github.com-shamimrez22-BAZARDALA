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
          content: `Need to get in touch? You can reach us via email at ${settings?.contactEmail || 'info@bazardala.com'} or call our hotline at ${settings?.contactPhone || '+880 1XXX XXXXXX'}.`,
          details: ['Customer Hotline', 'Email Support', 'Office Address', 'Social Media'],
          customAction: settings?.whatsappNumber ? (
            <a 
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center gap-4 bg-[#25D366] text-white px-8 py-4 font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all active:scale-95 shadow-xl"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WHATSAPP_SUPPORT_PROTOCOL
            </a>
          ) : null
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

  const { title, icon: Icon, content, details, customAction } = getPageContent();

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
                 <div className="w-1.5 h-1.5 bg-brand-primary rounded-none animate-pulse" />
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Authorized Information Resource // 2026</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <p className="flex-1 text-lg md:text-xl font-black text-slate-600 tracking-tight leading-relaxed text-center md:text-left">
              {content}
            </p>
            {customAction && (
              <div className="w-full md:w-auto shrink-0 flex justify-center md:justify-start">
                {customAction}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {details.map((item, index) => (
              <div key={index} className="p-6 bg-slate-50 rounded-none border-2 border-transparent hover:border-brand-primary/10 hover:bg-white hover:shadow-xl transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-1 bg-brand-primary/20 rounded-none group-hover:w-12 group-hover:bg-brand-primary transition-all duration-500" />
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
