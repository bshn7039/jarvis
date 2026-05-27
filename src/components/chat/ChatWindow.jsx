import MessageBubble from './MessageBubble';
import { CHAT_EMPTY_STATE } from '../../utils/constants';
import { useAiStore } from '../../store/aiStore';
import { AlertCircle } from 'lucide-react';

export default function ChatWindow({ messages = [], showEmpty = true }) {
  const isGenerating = useAiStore((s) => s.isGenerating);
  const lastError = useAiStore((s) => s.lastError);
  const clearError = useAiStore((s) => s.clearError);
  
  const isEmpty = showEmpty && messages.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-32 pt-8 transition-opacity duration-300">
        <div className="flex max-w-md flex-col items-center text-center">
          <h2 className="text-2xl font-medium tracking-tight text-jarvis-text/90 sm:text-3xl">
            {CHAT_EMPTY_STATE.title}
          </h2>
          <p className="mt-3 text-sm text-jarvis-muted sm:text-base">
            {CHAT_EMPTY_STATE.subtitle}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              messageId={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.createdAt || message.timestamp}
              model={message.model}
              toolCalls={message.toolCalls}
              contextReferences={message.contextReferences}
            />
          ))}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-transparent px-4 py-3 text-jarvis-muted">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-jarvis-muted/40 [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-jarvis-muted/40 [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-jarvis-muted/40"></span>
                </div>
                <span className="text-[13px] font-medium tracking-wide">JARVIS is thinking...</span>
              </div>
            </div>
          )}

          {lastError && (
            <div className="flex justify-center px-4 py-2">
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <div className="flex-1">{lastError}</div>
                <button 
                  onClick={clearError}
                  className="rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wider hover:bg-red-500/10"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

