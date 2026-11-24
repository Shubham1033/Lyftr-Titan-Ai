import React, { useEffect } from 'react';
import type { ResponseMetadata } from '../../types/chat';
import { X, Activity, Zap, Database, Clock } from 'lucide-react';

interface InspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ResponseMetadata | null;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  isOpen,
  onClose,
  metadata,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isCache = metadata?.resolution_source === 'LLM_CACHE';

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm sm:max-w-md bg-white border-l border-neutral-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-150 bg-[#F5F5F3]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#2563B0]" />
          <h2 className="text-sm font-semibold text-neutral-800">Request Inspector</h2>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700 p-1 rounded hover:bg-neutral-200/60 cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {!metadata ? (
          <div className="text-center py-12 text-neutral-400 text-xs">
            Select an assistant message to inspect its request details.
          </div>
        ) : (
          <>
            {/* Section A: Request Overview */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                A. Request Overview
              </span>
              <div className="bg-[#FBFAF6] p-3.5 rounded-lg border border-neutral-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Resolution Source</span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                      isCache
                        ? 'bg-[#F6CF1D]/30 text-yellow-900 border border-[#F6CF1D]/60'
                        : 'bg-[#1F9D5B]/15 text-[#1F9D5B] border border-[#1F9D5B]/30'
                    }`}
                  >
                    {isCache ? <Database className="w-3 h-3 text-yellow-700" /> : <Zap className="w-3 h-3" />}
                    {metadata.resolution_source}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Model Name</span>
                  <span className="font-mono text-xs text-neutral-800 font-medium">
                    {metadata.model}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Server Latency</span>
                  <span className="font-mono text-xs text-neutral-800 font-semibold inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    {metadata.latency_ms} ms
                  </span>
                </div>
              </div>
            </div>

            {/* Section B: Inference Information */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                B. Key Pool & Failover
              </span>
              <div className="bg-[#FBFAF6] p-3.5 rounded-lg border border-neutral-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Active Key ID</span>
                  <span className="font-mono text-xs text-neutral-800">
                    {metadata.key_id ? (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#2563B0] font-semibold border border-blue-200">
                        {metadata.key_id}
                      </span>
                    ) : (
                      <span className="text-neutral-400 italic">null (Cached)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Fallback Attempts</span>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      metadata.fallback_attempts > 0 ? 'text-[#F2721C]' : 'text-neutral-700'
                    }`}
                  >
                    {metadata.fallback_attempts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Cache Status</span>
                  <span className="text-xs font-medium text-neutral-700">
                    {isCache ? 'HIT (Memory cache)' : 'MISS (Live inference)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section C: Execution Flow */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                C. Execution Flow
              </span>
              <div className="p-3.5 rounded-lg border border-neutral-200/80 bg-white space-y-3">
                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 font-mono text-[10px] text-neutral-600">
                    1
                  </div>
                  <div>
                    <span className="font-medium text-neutral-800">Request Received</span>
                    <p className="text-[11px] text-neutral-500">Client message validated and hashed.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 font-mono text-[10px] text-neutral-600">
                    2
                  </div>
                  <div>
                    <span className="font-medium text-neutral-800">Cache Lookup</span>
                    <p className="text-[11px] text-neutral-500">
                      {isCache ? 'Cache key matched previous prompt!' : 'No cache match found.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 font-mono text-[10px] text-neutral-600">
                    3
                  </div>
                  <div>
                    <span className="font-medium text-neutral-800">
                      {isCache ? 'Cache Retrieval' : 'Key Pool Execution'}
                    </span>
                    <p className="text-[11px] text-neutral-500">
                      {isCache
                        ? 'Served directly from memory cache.'
                        : metadata.fallback_attempts > 0
                        ? `Primary key failed → Fallback key (${metadata.key_id}) succeeded!`
                        : `Primary key (${metadata.key_id}) succeeded on first attempt.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-[#1F9D5B]/15 text-[#1F9D5B] flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-medium text-[#1F9D5B]">Response Delivered</span>
                    <p className="text-[11px] text-neutral-500">
                      Saved to SQLite session history and delivered to UI.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section D: Token Performance */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                D. Per-Request Token Usage
              </span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-lg border border-neutral-200 bg-[#FBFAF6]">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Prompt Tokens</span>
                  <p className="text-lg font-mono font-bold text-neutral-800 mt-0.5">
                    {metadata.input_tokens}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-neutral-200 bg-[#FBFAF6]">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Output Tokens</span>
                  <p className="text-lg font-mono font-bold text-neutral-800 mt-0.5">
                    {metadata.output_tokens}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
