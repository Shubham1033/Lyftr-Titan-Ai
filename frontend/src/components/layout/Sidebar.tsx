import React from 'react';
import { TitanLogo } from '../common/TitanLogo';
import { Plus, ShieldAlert, Layers } from 'lucide-react';
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
          className="fixed inset-0 z-30 bg-black/30 md:hidden backdrop-blur-2xs"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#F5F5F3] border-r border-neutral-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-neutral-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TitanLogo size={24} />
            <div>
              <span className="font-bold text-sm tracking-tight text-[#141414]">TITAN AI</span>
              <span className="block text-[10px] text-neutral-400 font-medium">Modular Intelligence</span>
            </div>
          </div>
        </div>

        {/* Action: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#2563B0] hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-3 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Current Session details */}
        <div className="px-3 py-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
            Current Session
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">ID:</span>
              <span className="font-mono text-[11px] font-semibold text-neutral-800 truncate max-w-[130px]" title={sessionId}>
                {sessionId}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-neutral-100">
              <span className="text-neutral-500">Storage:</span>
              <span className="text-[11px] text-[#1F9D5B] font-medium flex items-center gap-1">
                <Layers className="w-3 h-3" /> SQLite
              </span>
            </div>
          </div>
        </div>

        {/* Failover Simulator (Test Hook for Demo) */}
        <div className="px-3 py-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#F2721C]" />
            Failover Test Hook
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-neutral-200/80 shadow-2xs space-y-2">
            <label className="text-[11px] text-neutral-500 block leading-tight">
              Inject <code className="bg-neutral-100 px-1 py-0.5 rounded text-[10px]">X-Simulate-Failure</code>
            </label>
            <select
              value={simulateHeader}
              onChange={(e) => onSimulateHeaderChange(e.target.value)}
              className="w-full text-xs p-1.5 rounded border border-neutral-200 bg-[#F5F5F3] text-neutral-800 font-mono focus:outline-hidden focus:border-[#2563B0]"
            >
              <option value="">Normal (No failure)</option>
              <option value="key_1=429">key_1=429 (Failover to key_2)</option>
              <option value="key_1=500">key_1=500 (Failover to key_2)</option>
              <option value="*=429">*=429 (All fail -&gt; 503)</option>
            </select>
            {simulateHeader && (
              <span className="text-[10px] text-[#F2721C] font-mono block">
                Header: {simulateHeader}
              </span>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: Backend Health & Status */}
        <div className="p-3 border-t border-neutral-200/80 bg-[#F5F5F3]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 px-1">
            System Gateway
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-neutral-200/80 text-xs shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Backend:</span>
              {healthLoading ? (
                <span className="text-neutral-400 text-[11px]">Connecting...</span>
              ) : health?.status === 'ok' ? (
                <span className="text-[#1F9D5B] font-semibold text-[11px] inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F9D5B] animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="text-[#E4262D] font-semibold text-[11px]">Offline</span>
              )}
            </div>

            {health && (
              <div className="mt-1.5 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                <span>Keys: {health.keys_configured}</span>
                <span>Cache: {health.cache_enabled ? 'ON' : 'OFF'}</span>
              </div>
            )}
          </div>

          <div className="text-center mt-2">
            <span className="text-[10px] text-neutral-400">TITAN AI v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
