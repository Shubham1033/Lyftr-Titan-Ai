import React from 'react';
import { TitanLogo } from '../common/TitanLogo';
import { Sparkles, Terminal, Cpu, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      badge: 'Resilience',
      badgeColor: 'text-[#2563B0] dark:text-[#60A5FA] bg-blue-50 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-800/60',
      title: 'Explain Key Failover & Resilience',
      desc: 'How does automatic key fallback handle HTTP 429 quota exhaustion without dropping user turns?',
      icon: <ShieldCheck className="w-4 h-4 text-[#2563B0] dark:text-[#60A5FA]" />,
    },
    {
      badge: 'Optimization',
      badgeColor: 'text-[#D97706] dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-800/60',
      title: 'Compare Response Caching Models',
      desc: 'Why does hashing full message history prevent invalid cache hits in multi-turn conversations?',
      icon: <Cpu className="w-4 h-4 text-[#D97706] dark:text-amber-400]" />,
    },
    {
      badge: 'Architecture',
      badgeColor: 'text-[#059669] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-800/60',
      title: 'Design a Low-Latency Gateway',
      desc: 'Architect a production AI gateway using FastAPI, SQLite persistence, and LiteLLM pooling.',
      icon: <Terminal className="w-4 h-4 text-[#059669] dark:text-emerald-400" />,
    },
    {
      badge: 'Full-Stack',
      badgeColor: 'text-[#DC2626] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200/60 dark:border-rose-800/60',
      title: 'Debug an Asynchronous Service',
      desc: 'Identify bottlenecks and trace token usage metrics across distributed API clusters.',
      icon: <Sparkles className="w-4 h-4 text-[#DC2626] dark:text-rose-400" />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center max-w-3xl mx-auto select-none bg-dot-grid min-h-full">
      {/* Brand Header */}
      <div className="mb-6 inline-flex flex-col items-center">
        <div className="p-2.5 rounded-2xl bg-white dark:bg-[#121212] shadow-md border border-neutral-200/80 dark:border-neutral-800 mb-4 hover:scale-105 transition-transform">
          <TitanLogo size={42} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          Gateway Active · Gemini 3.5 Flash Lite
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
          What can we solve today?
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-md leading-relaxed">
          Your resilient conversation workspace with automatic API failover and sub-millisecond response caching.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left mt-2">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.desc)}
            className="p-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-[#101010] hover:border-[#2563B0]/50 dark:hover:border-[#3B82F6]/50 hover:shadow-md hover:-translate-y-0.5 transition-all text-left cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                {item.badge}
              </span>
              <div className="text-neutral-300 dark:text-neutral-600 group-hover:text-[#2563B0] dark:group-hover:text-[#60A5FA] transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              {item.icon}
              <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-[#2563B0] dark:group-hover:text-[#60A5FA] transition-colors">
                {item.title}
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
