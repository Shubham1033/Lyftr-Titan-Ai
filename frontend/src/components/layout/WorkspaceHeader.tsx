import React from 'react';
import { Menu, Activity, Sliders, Cpu } from 'lucide-react';

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
  return (
    <header className="h-14 border-b border-neutral-200/80 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-neutral-500 hover:text-neutral-800 p-1 rounded hover:bg-neutral-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider uppercase text-neutral-700">
            AI WORKSPACE
          </span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs font-mono text-neutral-400 truncate max-w-[120px] sm:max-w-[200px]" title={sessionId}>
            {sessionId}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F5F5F3] border border-neutral-200/80 text-xs font-mono text-neutral-600">
          <Cpu className="w-3.5 h-3.5 text-[#2563B0]" />
          gemini-3.5-flash-lite
        </div>

        {/* System prompt toggle */}
        <button
          onClick={onOpenSystemPrompt}
          className="p-1.5 rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-xs inline-flex items-center gap-1 cursor-pointer"
          title="System prompt"
        >
          <Sliders className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden sm:inline">System Prompt</span>
        </button>

        {/* Request Inspector Toggle */}
        <button
          onClick={onToggleInspector}
          className={`p-1.5 px-2.5 rounded border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            isInspectorOpen
              ? 'bg-[#2563B0] text-white border-transparent'
              : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
          }`}
          title="Toggle Request Inspector drawer"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Request Inspector</span>
        </button>
      </div>
    </header>
  );
};
