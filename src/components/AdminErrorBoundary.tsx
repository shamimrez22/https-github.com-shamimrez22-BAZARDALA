import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL ADMIN ERROR:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f4e4d4] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#ead9c4] border-2 border-[#9B2B2C] shadow-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 bg-[#9B2B2C] text-white text-[8px] font-black uppercase tracking-widest">
              PROTOCOL_FAILURE
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#9B2B2C] flex items-center justify-center rounded-none shadow-lg">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">
              SYSTEM_HALTED
            </h1>
            
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed mb-8">
              A critical exception occurred in the Admin interface ({this.state.error?.name}).
              The requested resource could not be rendered safely.
            </p>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-[#9B2B2C] hover:bg-slate-900 text-white font-black uppercase tracking-widest h-12 rounded-none"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> REBOOT_SYSTEM
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full bg-white border-[#777] text-slate-900 font-black uppercase tracking-widest h-12 rounded-none"
              >
                <Home className="mr-2 h-4 w-4" /> EXIT_TO_DASHBOARD
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#777]/30">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Protocol: Admin_Guard_v3.0 // Stack_Trace_Logged
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default AdminErrorBoundary;
