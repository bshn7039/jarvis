import { useEffect, useRef, useState } from 'react';
import { LayoutProvider, useLayout } from '../../context/LayoutContext';
import Sidebar from '../sidebar/Sidebar';
import ChatHeader from '../chat/ChatHeader';
import ChatWindow from '../chat/ChatWindow';
import PromptBar from '../chat/PromptBar';
import BootPanel from '../chat/BootPanel';
import JarvisLetterAnimation from '../chat/JarvisLetterAnimation';
import SpotifyPanel from './SpotifyPanel';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { Terminal } from 'lucide-react';

function CenteredLandingState({ showEntrance }) {
  const [animationFinished, setAnimationFinished] = useState(false);
  const user = useAuthStore((s) => s.user);
  const userName = user?.username || 'Commander';

  const showGreeting = !showEntrance || animationFinished;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-32">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute h-12 w-12 animate-ping rounded-full bg-jarvis-text/5 duration-[3000ms]" />
          <JarvisLetterAnimation triggered={showEntrance} onSettle={() => setAnimationFinished(true)} />
        </div>

        {showGreeting && (
          <div className="animate-greeting-in mt-4 text-[15px] font-semibold tracking-[0.2em] uppercase select-none bg-gradient-to-r from-sky-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            Hi, {userName}
          </div>
        )}
      </div>
    </div>
  );
}

function BootButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      id="jarvis-boot-btn"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-jarvis-border/60 bg-jarvis-panel/80 px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.15em] text-jarvis-muted shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all duration-300 hover:border-jarvis-accent/50 hover:text-jarvis-accent hover:shadow-[0_4px_30px_rgba(125,211,252,0.12)]"
    >
      {/* Shimmer sweep */}
      <span
        className={`pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-jarvis-accent/10 to-transparent transition-transform duration-500 ${
          hovered ? 'translate-x-full' : '-translate-x-full'
        }`}
      />
      <Terminal className="h-3.5 w-3.5 shrink-0" />
      <span className="relative">Boot</span>
    </button>
  );
}

function MainLayoutContent() {
  const { openMobile } = useLayout();
  const chatHistory   = useChatStore((s) => s.chatHistory);
  const activeChatId  = useChatStore((s) => s.activeChatId);

  const [showEntrance] = useState(() => {
    const flag = sessionStorage.getItem('jarvis_entrance');
    if (flag === '1') {
      sessionStorage.removeItem('jarvis_entrance');
      return true;
    }
    return false;
  });
  const [bootOpen, setBootOpen]         = useState(false);

  const activeChat = chatHistory.find((c) => c.id === activeChatId);
  const messages   = activeChat?.messages || [];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-jarvis-bg text-jarvis-text">
      <Sidebar />

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ChatHeader
          title={activeChatId ? (activeChat?.title || 'Conversation') : null}
          onMenuClick={openMobile}
        />

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {activeChatId ? (
            <ChatWindow messages={messages} showEmpty={false} />
          ) : (
            <CenteredLandingState showEntrance={showEntrance} />
          )}

          {/* BOOT button — only in idle state (no active chat) */}
          {!activeChatId && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-end px-4 pb-[7rem]">
              <div className="pointer-events-auto flex flex-col items-center gap-2">
                <BootButton onClick={() => setBootOpen(true)} />
              </div>
            </div>
          )}

          <PromptBar />
        </div>
      </main>

      {/* Spotify — always mounted, manages own open/close */}
      <SpotifyPanel />

      {/* Boot panel overlay */}
      <BootPanel isOpen={bootOpen} onClose={() => setBootOpen(false)} />
    </div>
  );
}

export default function MainLayout(props) {
  return (
    <LayoutProvider>
      <MainLayoutContent {...props} />
    </LayoutProvider>
  );
}
