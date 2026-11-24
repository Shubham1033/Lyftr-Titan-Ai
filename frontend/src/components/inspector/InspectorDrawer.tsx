import React, { useEffect } from 'react';
import type { ResponseMetadata } from '../../types/chat';
import { X, Activity, Zap, Database, Clock, Key } from 'lucide-react';

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
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm sm:max-w-md bg-white border-l border-neutral-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#F8F9FA]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#2563B0]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Request Telemetry</h2>
            <p className="text-[10px] text-neutral-400 font-mono">Inspection & Execution Pipeline</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-200/60 transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {!metadata ? (
          <div className="text-center py-16 text-neutral-400 text-xs">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-30 animate-pulse" />
            Select an assistant message to inspect its request details.
          </div>
        ) : (
          <>
            {/* Section A: Request Overview */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                A. Resolution & Overview
              </span>
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-neutral-200/90 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium">Resolution Source</span>
                  <span
                    className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-md text-[11px] ${
                      isCache
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                    }`}
                  >
                    {isCache ? <Database className="w-3.5 h-3.5 text-amber-700" /> : <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />}
                    {metadata.resolution_source}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium">Model</span>
                  <span className="font-mono text-xs text-neutral-900 font-semibold bg-white px-2 py-0.5 rounded border border-neutral-200">
                    {metadata.model}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium">Server Latency</span>
                  <span className="font-mono text-xs font-bold inline-flex items-center gap-1 text-neutral-800">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    {metadata.latency_ms} ms
                  </span>
                </div>
              </div>
            </div>

            {/* Section B: Key Pool & Fallback */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                B. Key Pool & Failover
              </span>
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-neutral-200/90 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium">Responding Key ID</span>
                  <span className="font-mono text-xs">
                    {metadata.key_id ? (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563B0] font-bold border border-blue-200 inline-flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        {metadata.key_id}
                      </span>
                    ) : (
                      <span className="text-neutral-400 italic">null (Cached Response)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium">Fallback Attempts</span>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      metadata.fallback_attempts > 0
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'text-neutral-700'
                    }`}
                  >
                    {metadata.fallback_attempts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium">Cache Status</span>
                  <span className="text-xs font-semibold text-neutral-800">
                    {isCache ? 'HIT (Instant Memory Cache)' : 'MISS (Live Provider Inference)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section C: Execution Flow */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                C. Execution Pipeline
              </span>
              <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3 shadow-2xs">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 font-mono text-[10px] font-semibold text-neutral-600">
                    1
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-800">Request Validated & Hashed</span>
                    <p className="text-[11px] text-neutral-500">Input validated (1–4000 chars); cache hash computed.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 font-mono text-[10px] font-semibold text-neutral-600">
                    2
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-800">Deterministic Cache Lookup</span>
                    <p className="text-[11px] text-neutral-500">
                      {isCache ? 'Cache key matched identical prompt history!' : 'No previous cache entry matched.'}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 font-mono text-[10px] font-semibold text-neutral-600">
                    3
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-800">
                      {isCache ? 'Memory Cache Delivery' : 'Key Pool Execution'}
                    </span>
                    <p className="text-[11px] text-neutral-500">
                      {isCache
                        ? 'Zero LLM latency roundtrip.'
                        : metadata.fallback_attempts > 0
                        ? `Primary key rate-limited -> Fallback key (${metadata.key_id}) answered.`
                        : `Key (${metadata.key_id}) responded successfully.`}
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-700">Persisted in SQLite</span>
                    <p className="text-[11px] text-neutral-500">History stored with metadata for session recovery.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section D: Token Performance */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                D. Token Accounting
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-xl border border-neutral-200 bg-[#FAF9F6] text-center shadow-2xs">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Prompt Tokens</span>
                  <p className="text-xl font-mono font-bold text-neutral-900 mt-1">
                    {metadata.input_tokens}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-neutral-200 bg-[#FAF9F6] text-center shadow-2xs">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Completion Tokens</span>
                  <p className="text-xl font-mono font-bold text-neutral-900 mt-1">
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
