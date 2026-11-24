import React, { useState } from 'react';
import { X, Sliders, RotateCcw } from 'lucide-react';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  onSave: (newPrompt: string) => void;
}

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  systemPrompt,
  onSave,
}) => {
  const [value, setValue] = useState(systemPrompt);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  const handleReset = () => {
    setValue('');
    onSave('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg p-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-150">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2563B0]" />
            <h2 className="text-sm font-semibold text-neutral-800">System Prompt Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-500 mb-3">
          Overrides the default system instructions for this conversation session.
        </p>

        <textarea
          data-testid="system-prompt-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="You are TITAN AI, an intelligent, resilient, and precise conversational assistant..."
          rows={5}
          className="w-full text-xs font-mono p-3 rounded-lg border border-neutral-200 focus:outline-hidden focus:border-[#2563B0] bg-[#F5F5F3]/50 text-neutral-800 leading-relaxed mb-4 resize-none"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 p-2 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to default
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-xs px-4 py-1.5 rounded bg-[#2563B0] text-white hover:bg-blue-700 font-medium shadow-2xs cursor-pointer"
            >
              Save Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
