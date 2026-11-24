import React from 'react';
import { TitanLogo } from '../common/TitanLogo';
import { Plus, ShieldAlert, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
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
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/40 md:hidden backdrop-blur-2xs"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#F8F9FA] border-r border-neutral-200 flex flex-col transition-transform duration-200 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-4.5 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <TitanLogo size={24} />
            <div>
              <span className="font-extrabold text-sm tracking-tight text-neutral-900">TITAN AI</span>
              <span className="block text-[10px] text-neutral-400 font-medium">Modular Intelligence</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-[#2563B0] font-semibold border border-blue-200">
            v1.0
          </span>
        </div>

        {/* Action: New Chat */}
        <div className="p-3.5">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#2563B0] hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Chat
          </button>
        </div>

        {/* Current Session details */}
        <div className="px-3.5 py-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
            Active Session
          </div>
          <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-neutral-500 font-medium">ID:</span>
              <span className="font-mono text-[11px] font-bold text-neutral-800 truncate max-w-[130px]" title={sessionId}>
                {sessionId}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-neutral-100">
              <span className="text-neutral-500 font-medium">Storage:</span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <Layers className="w-3 h-3" /> SQLite
              </span>
            </div>
          </div>
        </div>

        {/* Failover Simulator (Test Hook for Demo) */}
        <div className="px-3.5 py-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#F2721C]" />
            Failover Test Hook
          </div>
          <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
            <label className="text-[11px] text-neutral-500 block leading-tight font-medium">
              Simulate Key Failure Header
            </label>
            <select
              value={simulateHeader}
              onChange={(e) => onSimulateHeaderChange(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-neutral-200 bg-[#F8F9FA] text-neutral-800 font-mono focus:outline-hidden focus:border-[#2563B0] cursor-pointer"
            >
              <option value="">Normal (No failure)</option>
              <option value="key_1=429">key_1=429 (Fallback to key_2)</option>
              <option value="key_1=500">key_1=500 (Fallback to key_2)</option>
              <option value="*=429">*=429 (All keys fail -&gt; 503)</option>
            </select>
            {simulateHeader ? (
              <span className="text-[10px] text-orange-700 bg-orange-50 border border-orange-200 p-1 rounded font-mono block">
                Header active: {simulateHeader}
              </span>
            ) : (
              <span className="text-[10px] text-neutral-400 block">
                Injects simulated HTTP error on demand.
              </span>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: Backend Health & Status */}
        <div className="p-3.5 border-t border-neutral-200 bg-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
            Gateway Telemetry
          </div>
          <div className="bg-[#FAF9F6] p-3 rounded-xl border border-neutral-200 text-xs shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Status:</span>
              {healthLoading ? (
                <span className="text-neutral-400 text-[11px]">Connecting...</span>
              ) : health?.status === 'ok' ? (
                <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                  Connected
                </span>
              ) : (
                <span className="text-rose-700 font-bold text-[11px] inline-flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  <AlertCircle className="w-3 h-3 text-[#DC2626]" />
                  Offline
                </span>
              )}
            </div>

            {health && (
              <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between text-[11px] font-mono text-neutral-600">
                <span>Pool: {health.keys_configured} keys</span>
                <span className="text-[#D97706] font-semibold">Cache: ON</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
