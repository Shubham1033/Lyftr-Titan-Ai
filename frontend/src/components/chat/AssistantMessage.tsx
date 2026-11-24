import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ResponseMetadata } from '../../types/chat';
import { TitanLogo } from '../common/TitanLogo';
import { Copy, Check, Zap, Database, ArrowRight } from 'lucide-react';

interface AssistantMessageProps {
  content: string;
  metadata?: ResponseMetadata;
  onInspect: (meta: ResponseMetadata) => void;
}

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
      className="group w-full py-4 px-4 sm:px-6 hover:bg-neutral-50/60 transition-colors"
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          <TitanLogo size={24} />
        </div>

        {/* Content & Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-neutral-800">TITAN AI</span>
            <button
              onClick={handleCopy}
              className="text-neutral-400 hover:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-neutral-100 cursor-pointer"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#1F9D5B]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Response Text rendered as Markdown */}
          <div className="prose prose-sm max-w-none text-[#141414] leading-relaxed break-words">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* Response Metadata Strip */}
          {metadata && (
            <div className="mt-3 pt-2.5 border-t border-neutral-150">
              <button
                onClick={() => onInspect(metadata)}
                className="inline-flex flex-wrap items-center gap-2 text-xs text-neutral-600 hover:text-[#2563B0] bg-neutral-100/80 hover:bg-neutral-100 px-2.5 py-1.5 rounded border border-neutral-200/80 transition-all cursor-pointer group/meta"
                title="Click to view Request Inspector"
              >
                {/* Resolution Source */}
                <span
                  data-testid="meta-source"
                  className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                    isCached
                      ? 'bg-[#F6CF1D]/30 text-yellow-900 border border-[#F6CF1D]/60'
                      : 'bg-[#1F9D5B]/15 text-[#1F9D5B] border border-[#1F9D5B]/30'
                  }`}
                >
                  {isCached ? (
                    <>
                      <Database className="w-3 h-3 text-yellow-700" />
                      LLM_CACHE
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 text-[#1F9D5B]" />
                      LIVE_INFERENCE
                    </>
                  )}
                </span>

                <span className="text-neutral-300">·</span>

                {/* Model */}
                <span data-testid="meta-model" className="font-mono text-[11px] text-neutral-700">
                  {metadata.model}
                </span>

                <span className="text-neutral-300">·</span>

                {/* Latency */}
                <span data-testid="meta-latency" className="font-mono text-[11px]">
                  {metadata.latency_ms} ms
                </span>

                <span className="text-neutral-300">·</span>

                {/* Tokens */}
                <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                  <span data-testid="meta-input-tokens">{metadata.input_tokens}</span> in
                  <span>/</span>
                  <span data-testid="meta-output-tokens">{metadata.output_tokens}</span> out
                </span>

                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover/meta:translate-x-0.5 transition-transform ml-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
