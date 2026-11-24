import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ResponseMetadata } from '../../types/chat';
import { TitanLogo } from '../common/TitanLogo';
import { Copy, Check, Zap, Database, ArrowUpRight, CheckCheck } from 'lucide-react';

interface AssistantMessageProps {
  content: string;
  metadata?: ResponseMetadata;
  onInspect: (meta: ResponseMetadata) => void;
}

// Code Block with Copy Button component
const CodeBlock: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'code';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 rounded-xl overflow-hidden border border-neutral-800 dark:border-neutral-700 bg-[#0F172A] dark:bg-[#080808] shadow-md text-xs font-mono">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#1E293B] dark:bg-[#161616] border-b border-neutral-800 dark:border-neutral-700 text-neutral-400 text-[11px]">
        <span className="font-semibold uppercase tracking-wider text-neutral-300 dark:text-neutral-200">{language}</span>
        <button
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <CheckCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[#10B981]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-neutral-100 leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  metadata,
  onInspect,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCached = metadata?.resolution_source === 'LLM_CACHE';

  return (
    <div
      data-testid="assistant-message"
      className="group w-full py-5 px-4 sm:px-6 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors"
    >
      <div className="max-w-3xl mx-auto flex gap-3.5 sm:gap-4 items-start">
        {/* Avatar */}
        <div className="shrink-0 mt-1 p-1 rounded-lg bg-white dark:bg-[#121212] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
          <TitanLogo size={22} />
        </div>

        {/* Content & Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-neutral-900 dark:text-white">TITAN AI</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                Agent
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Response Text rendered as Markdown */}
          <div className="prose prose-sm max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed break-words font-normal">
            <ReactMarkdown
              components={{
                code: ({ node, className, children, ...props }) => {
                  const isInline = !className && !String(children).includes('\n');
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[#2563B0] dark:text-[#60A5FA] font-mono text-[12px] border border-neutral-200/60 dark:border-neutral-700" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return <CodeBlock className={className}>{children}</CodeBlock>;
                },
                p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-2.5 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2.5 space-y-1">{children}</ol>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-3 border-[#2563B0] dark:border-[#3B82F6] pl-3 italic text-neutral-600 dark:text-neutral-400 my-2">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* Response Metadata Strip */}
          {metadata && (
            <div className="mt-4 pt-3 border-t border-neutral-150 dark:border-neutral-800/80">
              <button
                onClick={() => onInspect(metadata)}
                className="inline-flex flex-wrap items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:border-[#2563B0]/60 dark:hover:border-[#3B82F6]/60 hover:shadow-xs transition-all cursor-pointer group/meta text-xs"
                title="Click to view detailed telemetry in Request Inspector"
              >
                {/* Resolution Source Chip */}
                <span
                  data-testid="meta-source"
                  className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-md text-[10px] tracking-wide ${
                    isCached
                      ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {isCached ? (
                    <>
                      <Database className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                      LLM_CACHE
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                      LIVE_INFERENCE
                    </>
                  )}
                </span>

                {/* Model */}
                <span
                  data-testid="meta-model"
                  className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300 font-medium px-1.5 py-0.5 rounded bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700"
                >
                  {metadata.model}
                </span>

                {/* Latency */}
                <span
                  data-testid="meta-latency"
                  className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                    metadata.latency_ms < 100
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      : metadata.latency_ms < 2000
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {metadata.latency_ms} ms
                </span>

                {/* Token Usage */}
                <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700">
                  <span data-testid="meta-input-tokens" className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {metadata.input_tokens}
                  </span>
                  <span className="text-neutral-400">in</span>
                  <span className="text-neutral-300 dark:text-neutral-600">/</span>
                  <span data-testid="meta-output-tokens" className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {metadata.output_tokens}
                  </span>
                  <span className="text-neutral-400">out</span>
                </span>

                {/* Failover indicator if fallback occurred */}
                {metadata.fallback_attempts > 0 && (
                  <span className="font-mono text-[10px] font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 px-1.5 py-0.5 rounded">
                    Failover: {metadata.key_id} (+{metadata.fallback_attempts})
                  </span>
                )}

                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover/meta:text-[#2563B0] dark:group-hover/meta:text-[#60A5FA] group-hover/meta:translate-x-0.5 transition-all ml-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
