import React from 'react';
import { User } from 'lucide-react';

interface UserMessageProps {
  content: string;
  timestamp?: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content, timestamp }) => {
  return (
    <div className="w-full py-4 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto flex justify-end gap-3">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
          <div className="bg-[#F5F5F3] text-[#141414] px-4 py-2.5 rounded-2xl rounded-tr-sm border border-neutral-200/70 shadow-2xs text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </div>
          {timestamp && (
            <span className="text-[10px] text-neutral-400 mt-1 mr-1 font-mono">
              {timestamp}
            </span>
          )}
        </div>
        <div className="shrink-0 w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
