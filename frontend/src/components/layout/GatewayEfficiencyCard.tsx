import React from 'react';
import { Gauge, Clock, Zap, Database } from 'lucide-react';

interface GatewayEfficiencyCardProps {
  totalRequests: number;
  cacheHits: number;
  timeSavedMs: number;
  tokensSaved: number;
}

export const GatewayEfficiencyCard: React.FC<GatewayEfficiencyCardProps> = ({
  totalRequests,
  cacheHits,
  timeSavedMs,
  tokensSaved,
}) => {
  const hitRate = totalRequests > 0 ? Math.round((cacheHits / totalRequests) * 100) : 0;
  const timeSavedSec = (timeSavedMs / 1000).toFixed(2);

  return (
    <div className="bg-white dark:bg-[#121212] p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
          <Gauge className="w-3 h-3 text-[#2563B0] dark:text-[#3B82F6]" />
          Gateway Efficiency
        </span>
        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.2 rounded">
          {hitRate}% Hit Rate
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="text-[9px] uppercase font-semibold text-neutral-400 flex items-center justify-center gap-1">
            <Clock className="w-2.5 h-2.5 text-blue-500" /> Time Saved
          </div>
          <p className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-100 mt-0.5">
            {timeSavedSec}s
          </p>
        </div>

        <div className="p-2 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="text-[9px] uppercase font-semibold text-neutral-400 flex items-center justify-center gap-1">
            <Database className="w-2.5 h-2.5 text-emerald-500" /> Tokens Saved
          </div>
          <p className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-100 mt-0.5">
            {tokensSaved}
          </p>
        </div>
      </div>

      <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
        <span>Queries: {totalRequests}</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
          <Zap className="w-2.5 h-2.5" /> {cacheHits} from cache
        </span>
      </div>
    </div>
  );
};
