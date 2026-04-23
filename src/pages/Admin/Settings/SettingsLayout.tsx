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
    <div className="space-y-6 pb-10">
      <div className="bg-[#ead9c4] border border-[#777] p-8 shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#9B2B2C] uppercase tracking-tighter flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" /> System <span className="text-slate-900">Control</span>
          </h1>
          <p className="text-[11px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">
            Independent Module Management // V4.0
          </p>
        </div>
        
        <Button 
          onClick={() => setShowMobileView(true)} 
          variant="outline"
          className="w-full md:w-auto border-[#9B2B2C] text-[#9B2B2C] hover:bg-[#9B2B2C] hover:text-white font-black uppercase text-[11px] tracking-widest h-12 rounded-none transition-all px-6"
        >
          <Smartphone className="mr-2 h-4 w-4" /> Preview Mobile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Mobile Dropdown Navigation */}
        <div className="lg:hidden px-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full bg-slate-900 text-white h-14 rounded-none font-black uppercase text-xs tracking-widest flex justify-between px-6 shadow-[4px_4px_0px_#9B2B2C]">
                <div className="flex items-center gap-3">
                  <currentItem.icon className="h-4 w-4" />
                  {currentItem.label}
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100vw-42px)] mx-4 bg-white border-2 border-slate-900 rounded-none p-2 shadow-2xl z-[150]">
              {menuItems.map((item) => (
                <DropdownMenuItem 
                  key={item.path} 
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 p-4 font-black uppercase text-[12px] tracking-widest focus:bg-[#ead9c4] focus:text-[#9B2B2C]"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sidebar Navigation - Hidden on Mobile */}
        <div className="hidden lg:block lg:col-span-3 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 p-4 font-black uppercase text-[10px] tracking-widest border transition-all
                ${isActive 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-[4px_4px_0px_#9B2B2C]' 
                  : 'bg-white text-slate-600 border-[#777] hover:border-[#9B2B2C] hover:text-[#9B2B2C]'}
              `}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200">
             <h4 className="text-[10px] font-black text-yellow-900 uppercase mb-2 flex items-center gap-2">
               <Zap className="h-3 w-3" /> Information
             </h4>
             <p className="text-[9px] font-bold text-yellow-700 uppercase leading-relaxed">
               Each section operates independently. Changes in one module do not affect others until saved.
             </p>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="lg:col-span-9 px-1">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
