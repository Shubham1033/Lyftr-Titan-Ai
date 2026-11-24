import React from 'react';
import { Zap, ShieldCheck, X } from 'lucide-react';

export interface ToastData {
  id: string;
  keyId: string;
  fallbackAttempts: number;
  message: string;
}

interface FailoverToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export const FailoverToast: React.FC<FailoverToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-250 select-none">
      <div className="p-3.5 rounded-xl border border-amber-500/30 bg-neutral-900/95 text-white shadow-2xl backdrop-blur-md flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 border border-amber-500/40">
          <Zap className="w-4 h-4 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Automatic Key Failover
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              +{toast.fallbackAttempts} attempt
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            {toast.message}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-neutral-400">
            <span>Responding Key: <span className="text-emerald-400 font-semibold">{toast.keyId}</span></span>
            <span>·</span>
            <span className="text-neutral-400">Zero turn dropped</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
