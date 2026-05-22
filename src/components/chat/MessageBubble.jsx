export default function MessageBubble({ role, content, timestamp, model }) {
  const isUser = role === 'user';

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
        {!isUser && model && (
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="rounded bg-jarvis-muted/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-jarvis-muted">
              {model}
            </span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p className="mt-2 text-[11px] text-jarvis-muted/70">{timestamp}</p>
        )}
      </div>
    </div>
  );
}

