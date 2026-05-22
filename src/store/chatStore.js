import { create } from 'zustand';
import { BaseService } from '../database/services/baseService';
import { STORES } from '../database/core/localDatabase';
import { deepClone } from '../utils/deepClone';
import { aiClient } from '../services/ai/deepseekClient';
import { useAiStore } from './aiStore';
import { DEFAULT_SYSTEM_PROMPT } from '../config/systemPrompts';

class ChatService extends BaseService {
  constructor() {
    super(STORES.CHATS);
  }
}

const chatService = new ChatService();

const initialState = {
  chatHistory: [],
  activeChatId: null,
  isHydrated: false,
};

export const useChatStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const history = await chatService.getAll();
      set({ 
        chatHistory: history.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), 
        isHydrated: true,
        activeChatId: null // Explicitly ensure no chat is auto-selected on load
      });
    } catch (err) {
      console.error('Failed to hydrate chats:', err);
    }
  },

  setActiveChatId: (id) => set({ activeChatId: id }),

  createNewChat: async () => {
    const newChat = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      messages: [],
      pinned: false,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const saved = await chatService.create(newChat);
    set(state => ({ 
      chatHistory: [saved, ...state.chatHistory],
      activeChatId: saved.id
    }));
    return saved.id;
  },

  addMessage: async (chatId, content) => {
    const aiStore = useAiStore.getState();
    let history = get().chatHistory;
    let chat = history.find(c => c.id === chatId);
    
    if (!chat) {
      const newId = await get().createNewChat();
      history = get().chatHistory;
      chat = history.find(c => c.id === newId);
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    };

    let updatedTitle = chat.title;
    if (chat.messages.length === 0) {
      updatedTitle = content.trim().slice(0, 40);
      if (content.length > 40) updatedTitle += '...';
    }

    const updatedChat = {
      ...chat,
      title: updatedTitle,
      messages: [...chat.messages, userMessage],
      updatedAt: new Date().toISOString(),
    };

    await chatService.update(updatedChat.id, updatedChat);
    
    set(state => ({
      chatHistory: state.chatHistory
        .map(c => c.id === updatedChat.id ? updatedChat : c)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      activeChatId: updatedChat.id
    }));

    // AI Response Flow
    aiStore.setGenerating(true);
    aiStore.clearError();

    try {
      const messagesForAi = [
        { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
        ...updatedChat.messages.map(m => ({ role: m.role, content: m.content }))
      ];

      const aiResponse = await aiClient.sendMessage(messagesForAi, aiStore.currentModel);

      const assistantMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse.content,
        model: aiResponse.model,
        createdAt: new Date().toISOString()
      };
      
      const currentChat = get().chatHistory.find(c => c.id === updatedChat.id);
      if (!currentChat) return;

      const withAssistant = {
        ...currentChat,
        messages: [...currentChat.messages, assistantMsg],
        updatedAt: new Date().toISOString(),
      };

      await chatService.update(withAssistant.id, withAssistant);
      
      set(state => ({
        chatHistory: state.chatHistory
          .map(c => c.id === withAssistant.id ? withAssistant : c)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      }));
    } catch (error) {
      aiStore.setError(error.message);
    } finally {
      aiStore.setGenerating(false);
    }
  },

  deleteChat: async (id) => {
    await chatService.delete(id);
    set(state => ({
      chatHistory: state.chatHistory.filter(c => c.id !== id),
      activeChatId: state.activeChatId === id ? null : state.activeChatId
    }));
  }
}));

