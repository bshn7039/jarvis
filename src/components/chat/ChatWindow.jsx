import MessageBubble from './MessageBubble';
import { emptyState } from '../../data/mockChats';

export default function ChatWindow({ messages = [], showEmpty = true }) {
  const isEmpty = showEmpty || messages.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-32 pt-8 transition-opacity duration-300">
        <div className="flex max-w-md flex-col items-center text-center">
          <h2 className="text-2xl font-medium tracking-tight text-jarvis-text/90 sm:text-3xl">
            {emptyState.title}
          </h2>
          <p className="mt-3 text-sm text-jarvis-muted sm:text-base">
            {emptyState.subtitle}
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
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
