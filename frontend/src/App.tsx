import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { WorkspaceHeader } from './components/layout/WorkspaceHeader';
import { WelcomeScreen } from './components/chat/WelcomeScreen';
import { UserMessage } from './components/chat/UserMessage';
import { AssistantMessage } from './components/chat/AssistantMessage';
import { ChatInput } from './components/chat/ChatInput';
import { InspectorDrawer } from './components/inspector/InspectorDrawer';
import { SystemPromptModal } from './components/settings/SystemPromptModal';
import { FailoverToast, type ToastData } from './components/common/FailoverToast';
import { checkHealth, sendChatMessage, ApiError } from './services/api';
import type { ChatMessageItem, ResponseMetadata, HealthResponsePayload } from './types/chat';
import { AlertCircle } from 'lucide-react';

function generateSessionId(): string {
  // Generates client session ID: s- + 8 random hex chars
  const rand = Math.random().toString(36).substring(2, 8);
  return `s-${rand}`;
}

export function App() {
  const [sessionId, setSessionId] = useState<string>(() => generateSessionId());
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState<boolean>(false);

  const [selectedMetadata, setSelectedMetadata] = useState<ResponseMetadata | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  const [simulateHeader, setSimulateHeader] = useState<string>('');
  const [health, setHealth] = useState<HealthResponsePayload | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);

  // Theme State: 'dark' (Pitch Black) or 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('titan_theme');
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  // Failover Toast State
  const [failoverToast, setFailoverToast] = useState<ToastData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Apply dark class to documentElement
  useEffect(() => {
    localStorage.setItem('titan_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Poll backend health on mount
  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      try {
        setHealthLoading(true);
        const res = await checkHealth();
        if (isMounted) setHealth(res);
      } catch {
        if (isMounted) setHealth(null);
      } finally {
        if (isMounted) setHealthLoading(false);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle New Chat (starts fresh session)
  const handleNewChat = () => {
    setSessionId(generateSessionId());
    setMessages([]);
    setErrorBanner(null);
    setSelectedMetadata(null);
  };

  // Calculate live Gateway Efficiency Metrics
  const assistantMessages = messages.filter((m) => m.role === 'assistant' && m.metadata);
  const totalRequests = assistantMessages.length;
  const cachedMessages = assistantMessages.filter((m) => m.metadata?.resolution_source === 'LLM_CACHE');
  const cacheHits = cachedMessages.length;
  const tokensSaved = cachedMessages.reduce(
    (acc, m) => acc + (m.metadata?.input_tokens || 0) + (m.metadata?.output_tokens || 0),
    0
  );
  // Estimate ~2500ms baseline live inference latency
  const timeSavedMs = cachedMessages.reduce(
    (acc, m) => acc + Math.max(0, 2500 - (m.metadata?.latency_ms || 0)),
    0
  );

  // Handle sending a message
  const handleSendMessage = async (text: string) => {
    setErrorBanner(null);
    const userMsg: ChatMessageItem = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await sendChatMessage(
        {
          session_id: sessionId,
          message: text,
          system_prompt: systemPrompt || undefined,
        },
        simulateHeader
      );

      const assistantMsg: ChatMessageItem = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        metadata: res.metadata,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setSelectedMetadata(res.metadata);

      // Check if automatic key failover occurred
      if (res.metadata.fallback_attempts > 0) {
        setFailoverToast({
          id: `toast-${Date.now()}`,
          keyId: res.metadata.key_id || 'fallback_key',
          fallbackAttempts: res.metadata.fallback_attempts,
          message: `Primary key rate-limited or failed -> Automatically failed over to ${res.metadata.key_id} without dropping turn.`,
        });
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 503) {
          setErrorBanner('TITAN AI is temporarily unable to reach its AI providers. Please try again shortly.');
        } else if (err.status === 422) {
          setErrorBanner(`Validation error: ${err.detail}`);
        } else {
          setErrorBanner(err.detail);
        }
      } else {
        setErrorBanner('Unable to connect to TITAN AI. Check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'bg-black text-[#F8FAFC]' : 'bg-white text-[#0F172A]'}`}>
      {/* Failover Event Visual Toast */}
      <FailoverToast toast={failoverToast} onDismiss={() => setFailoverToast(null)} />

      {/* Sidebar */}
      <Sidebar
        sessionId={sessionId}
        onNewChat={handleNewChat}
        health={health}
        healthLoading={healthLoading}
        simulateHeader={simulateHeader}
        onSimulateHeaderChange={setSimulateHeader}
        isOpen={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        totalRequests={totalRequests}
        cacheHits={cacheHits}
        timeSavedMs={timeSavedMs}
        tokensSaved={tokensSaved}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <WorkspaceHeader
          sessionId={sessionId}
          onToggleSidebar={() => setIsSidebarOpenMobile((prev) => !prev)}
          onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
          onOpenSystemPrompt={() => setIsSystemPromptOpen(true)}
          isInspectorOpen={isInspectorOpen}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />

        {/* Messages or Welcome View */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <WelcomeScreen onSelectPrompt={handleSendMessage} />
          ) : (
            <div className="py-4">
              {messages.map((msg) =>
                msg.role === 'user' ? (
                  <UserMessage key={msg.id} content={msg.content} timestamp={msg.timestamp} />
                ) : (
                  <AssistantMessage
                    key={msg.id}
                    content={msg.content}
                    metadata={msg.metadata}
                    onInspect={(meta) => {
                      setSelectedMetadata(meta);
                      setIsInspectorOpen(true);
                    }}
                  />
                )
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="w-full py-4 px-4 sm:px-6">
                  <div className="max-w-3xl mx-auto flex gap-4 items-center text-xs text-neutral-400">
                    <div className="w-2 h-2 rounded-full bg-[#2563B0] animate-ping" />
                    <span>TITAN AI is thinking...</span>
                  </div>
                </div>
              )}

              {/* Error banner */}
              {errorBanner && (
                <div className="w-full py-3 px-4 sm:px-6">
                  <div className="max-w-3xl mx-auto p-4 rounded-xl border border-[#E4262D]/30 bg-[#E4262D]/10 flex items-start gap-3 text-xs text-[#E4262D]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">
                      <span className="font-bold block mb-0.5">Request Failed</span>
                      {errorBanner}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onOpenSystemPrompt={() => setIsSystemPromptOpen(true)}
          hasCustomSystemPrompt={Boolean(systemPrompt.trim())}
        />

        {/* Slide-out Request Inspector */}
        <InspectorDrawer
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          metadata={selectedMetadata}
        />

        {/* System Prompt Modal */}
        <SystemPromptModal
          isOpen={isSystemPromptOpen}
          onClose={() => setIsSystemPromptOpen(false)}
          systemPrompt={systemPrompt}
          onSave={(val) => setSystemPrompt(val)}
        />
      </div>
    </div>
  );
}

export default App;
