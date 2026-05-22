import { LayoutProvider, useLayout } from '../../context/LayoutContext';
import Sidebar from '../sidebar/Sidebar';
import ChatHeader from '../chat/ChatHeader';
import ChatWindow from '../chat/ChatWindow';
import PromptBar from '../chat/PromptBar';
import { useChatStore } from '../../store/chatStore';

function CenteredLandingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-32">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute h-12 w-12 animate-ping rounded-full bg-jarvis-text/5 duration-[3000ms]"></div>
          <h2 className="jarvis-title text-4xl font-semibold tracking-[0.3em] text-jarvis-text/90 sm:text-5xl">
            JARVIS
          </h2>
        </div>
      </div>
    </div>
  );
}

function MainLayoutContent() {
  const { openMobile } = useLayout();
  const chatHistory = useChatStore((s) => s.chatHistory);
  const activeChatId = useChatStore((s) => s.activeChatId);

  const activeChat = chatHistory.find((c) => c.id === activeChatId);
  const messages = activeChat?.messages || [];

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
            <ChatWindow
              messages={messages}
              showEmpty={false}
            />
          ) : (
            <CenteredLandingState />
          )}
          <PromptBar />
        </div>
      </main>
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

