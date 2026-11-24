import React from 'react';
import { TitanLogo } from '../common/TitanLogo';
import { Sparkles, Terminal, Cpu, Bug } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      title: 'Explain a technical concept',
      desc: 'How does response caching and key failover work in modern AI architectures?',
      icon: <Cpu className="w-4 h-4 text-[#2563B0]" />,
    },
    {
      title: 'Help me debug code',
      desc: 'Identify race conditions and memory leaks in an asynchronous Python service.',
      icon: <Bug className="w-4 h-4 text-[#E4262D]" />,
    },
    {
      title: 'Design a system architecture',
      desc: 'Architect a low-latency multi-region LLM gateway with SQLite persistence.',
      icon: <Terminal className="w-4 h-4 text-[#1F9D5B]" />,
    },
    {
      title: 'Explain a programming problem',
      desc: 'Compare the trade-offs of in-memory caching vs distributed key-value stores.',
      icon: <Sparkles className="w-4 h-4 text-[#F2721C]" />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto select-none">
      <div className="mb-6 flex items-center justify-center">
        <TitanLogo size={48} />
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-[#141414] mb-3">
        What can we solve today?
      </h1>
      <p className="text-neutral-500 text-sm max-w-md mb-8">
        Your intelligent workspace for conversations, ideas and problem-solving.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.desc)}
            className="p-3.5 rounded-lg border border-neutral-200 bg-white hover:border-[#2563B0]/40 hover:bg-[#FBFAF6] transition-all text-left shadow-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              {item.icon}
              <span className="text-xs font-medium text-[#141414] group-hover:text-[#2563B0] transition-colors">
                {item.title}
              </span>
            </div>
            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
