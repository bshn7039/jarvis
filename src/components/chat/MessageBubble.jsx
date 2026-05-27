import { useChatStore } from '../../store/chatStore';

export default function MessageBubble({ messageId, role, content, timestamp, model, toolCalls, contextReferences }) {
  const isUser = role === 'user';
  const activeChatId = useChatStore((s) => s.activeChatId);
  const confirmToolCall = useChatStore((s) => s.confirmToolCall);
  const cancelToolCall = useChatStore((s) => s.cancelToolCall);

  return (
    <div
      className={[
        'flex w-full transition-opacity duration-300',
        isUser ? 'justify-end' : 'justify-start',
      ].join(' ')}
    >
      <div
        className={[
          'max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed sm:max-w-[75%]',
          isUser
            ? 'bg-jarvis-panel text-jarvis-text border border-jarvis-border'
            : 'bg-transparent text-jarvis-text/90',
        ].join(' ')}
      >
        {!isUser && (model || contextReferences?.length > 0) && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {model && (
              <span className="rounded bg-jarvis-muted/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-jarvis-muted">
                {model}
              </span>
            )}
            {contextReferences?.map(ref => (
              <span key={ref} className="rounded border border-jarvis-border/40 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-jarvis-muted/70">
                ctx:{ref}
              </span>
            ))}
          </div>
        )}
        
        {content && <p className="whitespace-pre-wrap">{content}</p>}

        {/* Tool confirmation logs */}
        {!isUser && toolCalls && toolCalls.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {toolCalls.map((tc) => (
              <div key={tc.id} className="my-1.5 rounded-xl border border-jarvis-border bg-jarvis-panel/40 p-3 text-[13px] text-left">
                <div className="flex items-center justify-between border-b border-jarvis-border/60 pb-1.5 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-jarvis-text/80">Proposed System Action</span>
                  <span className="text-[10px] text-jarvis-muted px-1.5 py-0.5 border border-jarvis-border rounded uppercase font-mono">{tc.name}</span>
                </div>
                <pre className="overflow-x-auto rounded bg-black/20 p-2 text-[11px] text-jarvis-muted/90 font-mono mb-3 max-h-40">
                  {JSON.stringify(tc.args, null, 2)}
                </pre>
                
                {tc.status === 'pending_confirmation' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => confirmToolCall(activeChatId, messageId, tc.id)}
                      className="flex-1 rounded-lg bg-jarvis-text text-jarvis-bg px-3 py-1.5 text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      Confirm Execute
                    </button>
                    <button 
                      onClick={() => cancelToolCall(activeChatId, messageId, tc.id)}
                      className="flex-1 rounded-lg border border-jarvis-border text-jarvis-text px-3 py-1.5 text-xs font-semibold hover:bg-jarvis-muted/10 active:scale-[0.98] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {tc.status === 'executing' && (
                  <p className="text-jarvis-muted animate-pulse text-xs">System executing proposed action...</p>
                )}
                
                {tc.status === 'executed' && (
                  <p className="text-emerald-500 font-medium text-xs">✓ Action executed: {tc.result?.message || 'Success'}</p>
                )}
                
                {tc.status === 'cancelled' && (
                  <p className="text-jarvis-muted line-through text-xs">✗ Action cancelled by user</p>
                )}
                
                {tc.status === 'error' && (
                  <p className="text-red-400 font-medium text-xs">⚠ Action execution error: {tc.result?.error || 'Unknown error'}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {(timestamp || !isUser) && (
          <div className="mt-2 flex items-center justify-between text-[10px] text-jarvis-muted/70">
            <span>{timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
