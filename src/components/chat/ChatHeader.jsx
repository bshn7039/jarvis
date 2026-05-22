import { Menu, Plus, ChevronDown } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { useChatStore } from '../../store/chatStore';
import { useAiStore } from '../../store/aiStore';
import { MODEL_CONFIG } from '../../config/aiModels';
import { useState } from 'react';

export default function ChatHeader({ title, onMenuClick }) {
  const createNewChat = useChatStore((s) => s.createNewChat);
  const currentModel = useAiStore((s) => s.currentModel);
  const setModel = useAiStore((s) => s.setModel);
  const [showModels, setShowModels] = useState(false);

  const selectedModel = MODEL_CONFIG.find(m => m.id === currentModel) || MODEL_CONFIG[0];

  return (
    <header className="relative flex shrink-0 items-center justify-between border-b border-jarvis-border px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <IconButton
          icon={Menu}
          label="Open menu"
          onClick={onMenuClick}
          className="md:hidden"
          size="md"
        />
        <div className="flex flex-col">
          {title ? (
            <h1 className="max-w-[150px] truncate text-sm font-medium text-jarvis-text sm:max-w-[300px]">{title}</h1>
          ) : (
            <span className="text-sm text-jarvis-muted md:hidden">Jarvis</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowModels(!showModels)}
            className="flex items-center gap-1.5 rounded-lg border border-jarvis-border bg-jarvis-panel/50 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-jarvis-muted transition-colors hover:bg-jarvis-panel"
          >
            {selectedModel.name}
            <ChevronDown className={["h-3 w-3 transition-transform duration-200", showModels ? "rotate-180" : ""].join(' ')} />
          </button>

          {showModels && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowModels(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-jarvis-border bg-jarvis-panel p-1.5 shadow-xl">
                {MODEL_CONFIG.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setModel(model.id);
                      setShowModels(false);
                    }}
                    className={[
                      "w-full rounded-lg px-3 py-2 text-left transition-colors",
                      currentModel === model.id 
                        ? "bg-jarvis-muted/10 text-jarvis-text" 
                        : "text-jarvis-muted hover:bg-jarvis-muted/5 hover:text-jarvis-text"
                    ].join(' ')}
                  >
                    <div className="text-[12px] font-medium">{model.name}</div>
                    <div className="text-[10px] opacity-60 line-clamp-1">{model.description}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <IconButton
          icon={Plus}
          label="New Chat"
          onClick={() => createNewChat()}
          size="md"
          variant="ghost"
        />
      </div>
    </header>
  );
}

