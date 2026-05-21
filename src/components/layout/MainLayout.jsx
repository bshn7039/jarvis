import { LayoutProvider, useLayout } from '../../context/LayoutContext';
import Sidebar from '../sidebar/Sidebar';
import ChatHeader from '../chat/ChatHeader';
import ChatWindow from '../chat/ChatWindow';
import PromptBar from '../chat/PromptBar';
import { useChatStore } from '../../store/chatStore';

function MainLayoutContent({ showChat = false }) {
  const { openMobile } = useLayout();
  const chatHistory = useChatStore((s) => s.chatHistory);
  const activeChatId = useChatStore((s) => s.activeChatId);

  const activeChat = chatHistory.find((c) => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-jarvis-bg">
      <Sidebar />

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ChatHeader
          title={showChat ? (activeChat?.title || 'Chat') : null}
          onMenuClick={openMobile}
        />
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <ChatWindow
            messages={showChat ? messages : []}
            showEmpty={!showChat}
          />
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
