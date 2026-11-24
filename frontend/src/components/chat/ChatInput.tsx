import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Sliders } from 'lucide-react';

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
      <div className="relative border border-neutral-200 focus-within:border-[#2563B0]/60 rounded-xl bg-white shadow-xs transition-all">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          data-testid="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message TITAN AI..."
          rows={1}
          disabled={isLoading}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-10 text-sm text-[#141414] placeholder-neutral-400 focus:outline-hidden disabled:opacity-50"
        />

        {/* Footer controls inside container */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* System prompt toggle button */}
            <button
              type="button"
              onClick={onOpenSystemPrompt}
              className={`p-1.5 rounded-md text-xs inline-flex items-center gap-1 transition-colors cursor-pointer ${
                hasCustomSystemPrompt
                  ? 'text-[#2563B0] bg-blue-50 hover:bg-blue-100 font-medium'
                  : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
              }`}
              title="Configure system prompt"
            >
              <Sliders className="w-3.5 h-3.5" />
              {hasCustomSystemPrompt && <span className="text-[10px]">Custom Prompt</span>}
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

          {/* Send Button */}
          <button
            type="button"
            data-testid="send-button"
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isLoading || isOverLimit}
            className={`p-2 rounded-lg pointer-events-auto transition-all cursor-pointer flex items-center justify-center ${
              input.trim() && !isLoading && !isOverLimit
                ? 'bg-[#2563B0] text-white hover:bg-blue-700 shadow-2xs'
                : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
            }`}
            title="Send message (Enter)"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-[11px] text-neutral-400">
          TITAN AI · Resilience & Cache Gateway · Press Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};
