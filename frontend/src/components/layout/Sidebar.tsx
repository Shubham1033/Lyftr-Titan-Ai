import React from 'react';
import { TitanLogo } from '../common/TitanLogo';
import { GatewayEfficiencyCard } from './GatewayEfficiencyCard';
import { Plus, ShieldAlert, Layers, CheckCircle2, AlertCircle, Heart } from 'lucide-react';
import type { HealthResponsePayload } from '../../types/chat';

interface SidebarProps {
  sessionId: string;
  onNewChat: () => void;
  health: HealthResponsePayload | null;
  healthLoading: boolean;
  simulateHeader: string;
  onSimulateHeaderChange: (val: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  totalRequests: number;
  cacheHits: number;
  timeSavedMs: number;
  tokensSaved: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessionId,
  onNewChat,
  health,
  healthLoading,
  simulateHeader,
  onSimulateHeaderChange,
  isOpen,
  onCloseMobile,
  totalRequests,
  cacheHits,
  timeSavedMs,
  tokensSaved,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-2xs"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#F8F9FA] dark:bg-[#0A0A0A] border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-200 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-black">
          <div className="flex items-center gap-2.5">
            <TitanLogo size={26} />
            <div>
              <span className="font-extrabold text-sm tracking-tight text-neutral-900 dark:text-white">TITAN AI</span>
              <span className="block text-[10px] text-neutral-400 font-medium">Modular Intelligence</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#2563B0] dark:text-[#60A5FA] font-semibold border border-blue-200 dark:border-blue-800">
            v1.0
          </span>
        </div>

        {/* Action: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#2563B0] hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Chat
          </button>
        </div>

        {/* Scrollable middle area */}
        <div className="flex-1 overflow-y-auto px-3 space-y-3 pb-3">
          {/* Gateway Efficiency Card */}
          <GatewayEfficiencyCard
            totalRequests={totalRequests}
            cacheHits={cacheHits}
            timeSavedMs={timeSavedMs}
            tokensSaved={tokensSaved}
          />

          {/* Active Session Card */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 px-1">
              Active Session
            </div>
            <div className="bg-white dark:bg-[#121212] p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-500 font-medium">ID:</span>
                <span className="font-mono text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]" title={sessionId}>
                  {sessionId}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 font-medium">Storage:</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  <Layers className="w-3 h-3" /> SQLite Volume
                </span>
              </div>
            </div>
          </div>

          {/* Failover Simulator (Test Hook for Demo) */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 px-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-[#F2721C]" />
              Failover Test Hook
            </div>
            <div className="bg-white dark:bg-[#121212] p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-1.5">
              <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block font-medium">
                Inject X-Simulate-Failure:
              </label>
              <select
                value={simulateHeader}
                onChange={(e) => onSimulateHeaderChange(e.target.value)}
                className="w-full text-xs p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-[#F8F9FA] dark:bg-[#1A1A1A] text-neutral-800 dark:text-neutral-200 font-mono focus:outline-hidden focus:border-[#2563B0] cursor-pointer"
              >
                <option value="">Normal (No failure)</option>
                <option value="key_1=429">key_1=429 (Fallback to key_2)</option>
                <option value="key_1=500">key_1=500 (Fallback to key_2)</option>
                <option value="*=429">*=429 (All keys fail -&gt; 503)</option>
              </select>
              {simulateHeader && (
                <span className="text-[10px] text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 p-1 rounded font-mono block">
                  Active: {simulateHeader}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Backend Health & Status */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
          <div className="bg-[#FAF9F6] dark:bg-[#121212] p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Gateway:</span>
              {healthLoading ? (
                <span className="text-neutral-400 text-[11px]">Connecting...</span>
              ) : health?.status === 'ok' ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                  Connected
                </span>
              ) : (
                <span className="text-rose-700 dark:text-rose-400 font-bold text-[10px] inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                  <AlertCircle className="w-3 h-3 text-[#DC2626]" />
                  Offline
                </span>
              )}
            </div>

            {health && (
              <div className="pt-1.5 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                <span>Pool: {health.keys_configured} keys</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Cache: ON</span>
              </div>
            )}
          </div>

          {/* Footer Developer Credit */}
          <div className="text-center mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium flex items-center justify-center gap-1">
              Made with <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" /> by
            </p>
            <p className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
              Shubham Singh Mewada
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
