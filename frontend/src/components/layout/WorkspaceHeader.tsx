import React, { useState } from 'react';
import { Menu, Activity, Sliders, Cpu, Copy, Check } from 'lucide-react';

interface WorkspaceHeaderProps {
  sessionId: string;
  onToggleSidebar: () => void;
  onToggleInspector: () => void;
  onOpenSystemPrompt: () => void;
  isInspectorOpen: boolean;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  sessionId,
  onToggleSidebar,
  onToggleInspector,
  onOpenSystemPrompt,
  isInspectorOpen,
}) => {
  const [copiedSession, setCopiedSession] = useState(false);

  const handleCopySession = () => {
    navigator.clipboard.writeText(sessionId);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  return (
    <header className="h-14 border-b border-neutral-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-neutral-500 hover:text-neutral-800 p-1.5 rounded-lg hover:bg-neutral-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider uppercase text-neutral-900">
            AI WORKSPACE
          </span>
          <span className="text-neutral-300">/</span>
          <button
            onClick={handleCopySession}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-neutral-100 text-xs font-mono text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
            title="Click to copy session ID"
          >
            <span>{sessionId}</span>
            {copiedSession ? (
              <Check className="w-3 h-3 text-[#10B981]" />
            ) : (
              <Copy className="w-3 h-3 text-neutral-400" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-700 font-medium">
          <Cpu className="w-3.5 h-3.5 text-[#2563B0]" />
          gemini-3.5-flash-lite
        </div>

        {/* System prompt toggle */}
        <button
          onClick={onOpenSystemPrompt}
          className="p-1.5 px-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs inline-flex items-center gap-1.5 cursor-pointer font-medium transition-colors"
          title="Configure System Prompt"
        >
          <Sliders className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden sm:inline">System Prompt</span>
        </button>

        {/* Request Inspector Toggle */}
        <button
          onClick={onToggleInspector}
          className={`p-1.5 px-3 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
            isInspectorOpen
              ? 'bg-[#2563B0] text-white border-transparent shadow-xs'
              : 'border-neutral-200 text-neutral-800 hover:bg-neutral-50'
          }`}
          title="Toggle Request Telemetry drawer"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Request Inspector</span>
        </button>
      </div>
    </header>
  );
};
