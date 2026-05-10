import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Globe, Megaphone, LayoutGrid, Shield, Settings as SettingsIcon, Zap, Smartphone, X, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

const SettingsLayout = () => {
  const [showMobileView, setShowMobileView] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'General Settings', path: '/admin/settings/general', icon: Globe },
    { label: 'Ads & Notices', path: '/admin/settings/ads', icon: Megaphone },
    { label: 'Design & Theme', path: '/admin/settings/design', icon: LayoutGrid },
    { label: 'Security & Access', path: '/admin/settings/security', icon: Shield },
  ];

  const currentItem = menuItems.find(item => location.pathname === item.path) || menuItems[0];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-slate-50 border-b border-slate-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-6 bg-brand-primary" />
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              SYSTEM_CORE_CONFIG
            </h1>
          </div>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">
            Global_Parameters // Protocol_v4.5 // Maintenance: Nominal
          </p>
        </div>
        
        <button 
          onClick={() => setShowMobileView(true)} 
          className="h-10 px-6 bg-brand-primary hover:bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
        >
          <Smartphone className="mr-2 h-4 w-4" /> PREVIEW_MOBILE_COMMS
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Mobile Dropdown Navigation */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full bg-brand-primary text-white h-12 rounded-none font-black uppercase text-[10px] tracking-widest flex justify-between items-center px-6 transition-all active:scale-95">
                <div className="flex items-center gap-3">
                  <currentItem.icon className="h-4 w-4 text-white" />
                  {currentItem.label}
                </div>
                <ChevronDown className="h-4 w-4 text-white/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100vw-64px)] bg-white border border-slate-200 rounded-none p-1 shadow-2xl z-[150]">
              {menuItems.map((item) => (
                <DropdownMenuItem 
                  key={item.path} 
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 p-4 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 focus:bg-slate-50 focus:text-brand-primary cursor-pointer transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sidebar Navigation - Hidden on Mobile */}
        <div className="hidden lg:block lg:col-span-3 space-y-1">
          <div className="mb-4 px-4 py-2 bg-slate-50 border-l-2 border-brand-primary">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Navigation_Cluster</span>
          </div>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 p-4 font-black uppercase text-[10px] tracking-[0.1em] border transition-all duration-300
                ${isActive 
                  ? 'bg-brand-primary text-white border-brand-primary shadow-xl translate-x-2' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-brand-primary/30 hover:text-slate-900'}
              `}
            >
              <item.icon className={`h-4 w-4 transition-colors ${location.pathname === item.path ? 'text-white' : 'text-slate-300 group-hover:text-slate-500'}`} />
              {item.label}
            </NavLink>
          ))}
          
          <div className="mt-10 p-5 bg-slate-50 border border-slate-100 border-dashed">
             <h4 className="text-[10px] font-black text-slate-900 uppercase mb-3 flex items-center gap-2">
               <Zap className="h-3 w-3 text-brand-primary" /> SYSTEM_LOG
             </h4>
             <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
               Isolated Operability Protocols // Delta changes impact local node cache only.
             </p>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="lg:col-span-9">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white border border-slate-200">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showMobileView && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-[400px] h-full max-h-[800px] bg-white border-[12px] border-slate-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col scale-90 md:scale-100">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-slate-900 rounded-b-3xl z-20" />
            <div className="absolute top-0 right-4 p-2 z-30">
               <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowMobileView(false)}
                className="text-white hover:bg-red-500 rounded-full h-8 w-8"
               >
                 <X className="h-5 w-5" />
               </Button>
            </div>
            
            <div className="flex-1 mt-6">
              <iframe 
                src="/" 
                className="w-full h-full border-none" 
                title="Mobile Preview System" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsLayout;
