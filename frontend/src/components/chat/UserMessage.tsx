import React from 'react';
import { User } from 'lucide-react';

interface UserMessageProps {
  content: string;
  timestamp?: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content, timestamp }) => {
  return (
    <div className="w-full py-3.5 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto flex justify-end gap-3 items-start">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
          <div className="bg-[#18181B] dark:bg-[#1C1C1E] text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-sm text-sm leading-relaxed whitespace-pre-wrap break-words border border-neutral-800 dark:border-neutral-700">
            {content}
          </div>
          {timestamp && (
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 mr-1 font-mono">
              {timestamp}
            </span>
          )}
        </div>
        <div className="shrink-0 w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center text-xs font-medium shadow-xs border border-neutral-700 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
