import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Sliders, Cpu, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onOpenSystemPrompt: () => void;
  hasCustomSystemPrompt: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onOpenSystemPrompt,
  hasCustomSystemPrompt,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || trimmed.length > 4000) return;

    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = input.trim().length;
  const isOverLimit = charCount > 4000;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-5 pt-2">
      <div className="relative border border-neutral-300/80 focus-within:border-[#2563B0] focus-within:ring-3 focus-within:ring-[#2563B0]/10 rounded-2xl bg-white shadow-lg transition-all overflow-hidden">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          data-testid="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message TITAN AI... (ask any question or test cache)"
          rows={1}
          disabled={isLoading}
          className="w-full resize-none bg-transparent px-4.5 pt-3.5 pb-11 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden disabled:opacity-50 font-normal leading-relaxed"
        />

        {/* Footer controls inside container */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Model Chip */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-[11px] font-mono text-neutral-600 border border-neutral-200">
              <Cpu className="w-3 h-3 text-[#2563B0]" />
              gemini-3.5-flash-lite
            </div>

            {/* System prompt toggle button */}
            <button
              type="button"
              onClick={onOpenSystemPrompt}
              className={`px-2 py-1 rounded-md text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer border ${
                hasCustomSystemPrompt
                  ? 'text-[#2563B0] bg-blue-50 border-blue-200 font-medium'
                  : 'text-neutral-500 hover:text-neutral-800 bg-neutral-50 border-neutral-200/80 hover:bg-neutral-100'
              }`}
              title="Configure system prompt"
            >
              <Sliders className="w-3 h-3" />
              <span>{hasCustomSystemPrompt ? 'Custom Prompt Active' : 'System Prompt'}</span>
            </button>

            {/* Char count */}
            {charCount > 0 && (
              <span
                className={`text-[11px] font-mono ${
                  isOverLimit ? 'text-[#E4262D] font-bold' : 'text-neutral-400'
                }`}
              >
                {charCount}/4000
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
              Enter <CornerDownLeft className="w-3 h-3" />
            </span>

            {/* Send Button */}
            <button
              type="button"
              data-testid="send-button"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading || isOverLimit}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                input.trim() && !isLoading && !isOverLimit
                  ? 'bg-[#2563B0] text-white hover:bg-blue-700 shadow-md hover:scale-105 active:scale-95'
                  : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="text-center mt-2.5">
        <p className="text-[11px] text-neutral-400 font-mono">
          TITAN AI · Resilience & Cache Gateway · Press Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};
