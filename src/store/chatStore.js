import { create } from 'zustand';
import { BaseService } from '../database/services/baseService';
import { STORES } from '../database/core/localDatabase';
import { deepClone } from '../utils/deepClone';
import { useAiStore } from './aiStore';
import { aiDispatcher } from '../ai/services/aiDispatcher';
import { buildAiContext } from '../ai/context/contextResolver';
import { buildSystemPrompt } from '../ai/prompts/promptBuilder';
import { TOOL_SCHEMAS, TOOL_PERMISSIONS, PERMISSION_LEVELS, TOOL_ALIASES } from '../ai/tools/toolRegistry';
import { executeAiTool } from '../ai/execution/toolExecutor';

function safeParseJson(str) {
  if (!str) return {};
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn('[safeParseJson] Initial JSON parse failed, attempting automatic repair:', e, str);
    
    let repaired = str.trim();
    
    // Repair common single quote LLM errors: replace single quotes surrounding keys/values with double quotes
    // protecting apostrophes in words like McDonald's
    repaired = repaired
      .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (match, group) => {
        return '"' + group.replace(/"/g, '\\"') + '"';
      });
      
    // Remove trailing commas
    repaired = repaired.replace(/,(\s*[\]}])/g, '$1');

    // Fix unescaped control chars
    repaired = repaired
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');

    try {
      return JSON.parse(repaired);
    } catch (innerErr) {
      console.error('[safeParseJson] Repair failed, trying regex extraction: ', innerErr, repaired);
      try {
        const obj = {};
        const keyValueRegex = /"([^"]+)"\s*:\s*(?:"([^"]*)"|(\d+(?:\.\d+)?)|(true|false)|(null))/g;
        let match;
        while ((match = keyValueRegex.exec(str)) !== null) {
          const key = match[1];
          const valStr = match[2];
          const numStr = match[3];
          const boolStr = match[4];
          const nullStr = match[5];
          
          if (valStr !== undefined) {
            obj[key] = valStr;
          } else if (numStr !== undefined) {
            obj[key] = Number(numStr);
          } else if (boolStr !== undefined) {
            obj[key] = boolStr === 'true';
          } else if (nullStr !== undefined) {
            obj[key] = null;
          }
        }
        
        if (Object.keys(obj).length > 0) {
          console.log('[safeParseJson] Successfully recovered args via regex extraction:', obj);
          return obj;
        }
      } catch (regexErr) {
        console.error('[safeParseJson] Regex recovery failed:', regexErr);
      }
      throw e;
    }
  }
}

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
        activeChatId: null
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
      contextSummary: [],
      linkedEntities: [],
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      aiActionsPerformed: [],
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

    aiStore.setGenerating(true);
    aiStore.clearError();

    try {
      await get().processAiResponse(updatedChat.id, updatedChat.messages, content);
    } catch (error) {
      aiStore.setError(error.message);
    } finally {
      aiStore.setGenerating(false);
    }
  },

  processAiResponse: async (chatId, currentMessages, promptText) => {
    const aiStore = useAiStore.getState();
    const model = aiStore.currentModel;
    
    aiStore.setExecutionStatus('analyzing');
    aiStore.clearError();

    const { contextSummary, formattedString } = buildAiContext(promptText, { historyMessages: currentMessages });
    const systemPrompt = buildSystemPrompt(formattedString);

    const historyMessages = currentMessages.slice(-15);

    try {
      const response = await aiDispatcher.sendMessage(historyMessages, {
        systemPrompt,
        tools: TOOL_SCHEMAS,
        model
      });

      const chat = get().chatHistory.find(c => c.id === chatId);
      const cumulativeTokens = {
        promptTokens: (chat.tokenUsage?.promptTokens || 0) + (response.usage?.prompt_tokens || 0),
        completionTokens: (chat.tokenUsage?.completionTokens || 0) + (response.usage?.completion_tokens || 0),
        totalTokens: (chat.tokenUsage?.totalTokens || 0) + (response.usage?.total_tokens || 0)
      };

      const assistantMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        reasoningContent: response.reasoningContent || null,
        createdAt: new Date().toISOString(),
        contextReferences: contextSummary,
        toolCalls: response.toolCalls ? response.toolCalls.map(tc => {
          const resolvedName = TOOL_ALIASES[tc.function.name] || tc.function.name;
          const perm = TOOL_PERMISSIONS[resolvedName] || PERMISSION_LEVELS.READ_ONLY;
          return {
            id: tc.id,
            name: tc.function.name,
            args: safeParseJson(tc.function.arguments || '{}'),
            status: perm === PERMISSION_LEVELS.CONFIRM_REQUIRED ? 'pending_confirmation' : 'pending_execution',
            result: null
          };
        }) : null
      };

      let updatedChat = {
        ...chat,
        messages: [...chat.messages, assistantMsg],
        contextSummary: Array.from(new Set([...(chat.contextSummary || []), ...contextSummary])),
        tokenUsage: cumulativeTokens,
        updatedAt: new Date().toISOString(),
      };

      const hasPendingConfirmation = assistantMsg.toolCalls?.some(tc => tc.status === 'pending_confirmation');

      if (hasPendingConfirmation) {
        aiStore.setExecutionStatus('idle');
        await chatService.update(chatId, updatedChat);
        set(state => ({
          chatHistory: state.chatHistory.map(c => c.id === chatId ? updatedChat : c)
        }));
        return;
      }

      if (assistantMsg.toolCalls && assistantMsg.toolCalls.length > 0) {
        aiStore.setExecutionStatus('executing');
        let aiActionsPerformed = [...(chat.aiActionsPerformed || [])];
        
        for (const tc of assistantMsg.toolCalls) {
          if (tc.status === 'pending_execution') {
            // Check Cooldown & Duplicate
            try {
              aiStore.addPendingTool(tc);
              const result = await executeAiTool(tc.name, tc.args);
              tc.status = 'executed';
              tc.result = result;
              aiActionsPerformed.push(tc.name);
              aiStore.updateToolStatus(tc.id, 'executed', result);
            } catch (err) {
              tc.status = 'error';
              tc.result = { error: err.message };
              aiStore.updateToolStatus(tc.id, 'error', { error: err.message });
            }
          }
        }

        updatedChat.aiActionsPerformed = Array.from(new Set(aiActionsPerformed));

        await chatService.update(chatId, updatedChat);
        set(state => ({
          chatHistory: state.chatHistory.map(c => c.id === chatId ? updatedChat : c)
        }));

        const messagesWithTools = [
          ...historyMessages.map(m => ({
            role: m.role,
            content: m.content,
            reasoningContent: m.reasoningContent || m.reasoning_content || null,
            toolCalls: m.toolCalls || m.tool_calls,
            tool_call_id: m.tool_call_id || m.toolCallId,
            name: m.name
          })),
          {
            role: 'assistant',
            content: assistantMsg.content,
            reasoningContent: assistantMsg.reasoningContent || assistantMsg.reasoning_content || null,
            tool_calls: assistantMsg.toolCalls.map(tc => ({
              id: tc.id,
              type: 'function',
              function: {
                name: tc.name,
                arguments: JSON.stringify(tc.args)
              }
            }))
          },
          ...assistantMsg.toolCalls.map(tc => ({
            role: 'tool',
            name: tc.name,
            tool_call_id: tc.id,
            content: JSON.stringify(tc.result)
          }))
        ];

        const nextResponse = await aiDispatcher.sendMessage(messagesWithTools, {
          systemPrompt,
          model,
          tools: TOOL_SCHEMAS
        });

        const finalChat = get().chatHistory.find(c => c.id === chatId);
        const finalCumulativeTokens = {
          promptTokens: (finalChat.tokenUsage?.promptTokens || 0) + (nextResponse.usage?.prompt_tokens || 0),
          completionTokens: (finalChat.tokenUsage?.completionTokens || 0) + (nextResponse.usage?.completion_tokens || 0),
          totalTokens: (finalChat.tokenUsage?.totalTokens || 0) + (nextResponse.usage?.total_tokens || 0)
        };

        const finalAssistantMsg = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: nextResponse.content,
          reasoningContent: nextResponse.reasoningContent || null,
          createdAt: new Date().toISOString(),
          contextReferences: contextSummary
        };

        const finalChatUpdated = {
          ...finalChat,
          messages: [...finalChat.messages, finalAssistantMsg],
          tokenUsage: finalCumulativeTokens,
          updatedAt: new Date().toISOString()
        };

        await chatService.update(chatId, finalChatUpdated);
        set(state => ({
          chatHistory: state.chatHistory.map(c => c.id === chatId ? finalChatUpdated : c)
        }));
        aiStore.setExecutionStatus('completed');

      } else {
        await chatService.update(chatId, updatedChat);
        set(state => ({
          chatHistory: state.chatHistory.map(c => c.id === chatId ? updatedChat : c)
        }));
        aiStore.setExecutionStatus('completed');
      }
    } catch (error) {
      aiStore.setError(error.message);
      aiStore.setExecutionStatus('failed');
      throw error;
    }
  },

  confirmToolCall: async (chatId, messageId, toolCallId) => {
    let history = get().chatHistory;
    let chat = history.find(c => c.id === chatId);
    if (!chat) return;

    let updatedMessages = chat.messages.map(m => {
      if (m.id === messageId && m.toolCalls) {
        return {
          ...m,
          toolCalls: m.toolCalls.map(tc => {
            if (tc.id === toolCallId) {
              return { ...tc, status: 'executing' };
            }
            return tc;
          })
        };
      }
      return m;
    });

    set(state => ({
      chatHistory: state.chatHistory.map(c => c.id === chatId ? { ...c, messages: updatedMessages } : c)
    }));

    const message = updatedMessages.find(m => m.id === messageId);
    const tc = message.toolCalls.find(t => t.id === toolCallId);
    
    let result;
    let newStatus = 'executed';
    try {
      result = await executeAiTool(tc.name, tc.args);
    } catch (err) {
      result = { error: err.message };
      newStatus = 'error';
    }

    updatedMessages = updatedMessages.map(m => {
      if (m.id === messageId && m.toolCalls) {
        return {
          ...m,
          toolCalls: m.toolCalls.map(t => {
            if (t.id === toolCallId) {
              return { ...t, status: newStatus, result };
            }
            return t;
          })
        };
      }
      return m;
    });

    const aiActionsPerformed = Array.from(new Set([...(chat.aiActionsPerformed || []), tc.name]));
    const updatedChat = {
      ...chat,
      messages: updatedMessages,
      aiActionsPerformed,
      updatedAt: new Date().toISOString()
    };

    await chatService.update(chatId, updatedChat);
    set(state => ({
      chatHistory: state.chatHistory.map(c => c.id === chatId ? updatedChat : c)
    }));

    const finalMsg = updatedMessages.find(m => m.id === messageId);
    const anyPending = finalMsg.toolCalls.some(t => t.status === 'pending_confirmation' || t.status === 'executing');

    if (!anyPending) {
      useAiStore.getState().setGenerating(true);
      try {
        const historyIdx = chat.messages.findIndex(m => m.id === messageId);
        const historyMessages = chat.messages.slice(0, historyIdx).slice(-15);
        
        const { formattedString } = buildAiContext(chat.messages[historyIdx - 1]?.content || '', { historyMessages: chat.messages.slice(0, historyIdx) });
        const systemPrompt = buildSystemPrompt(formattedString);

        const messagesWithTools = [
          ...historyMessages.map(m => ({
            role: m.role,
            content: m.content,
            reasoningContent: m.reasoningContent || m.reasoning_content || null,
            toolCalls: m.toolCalls || m.tool_calls,
            tool_call_id: m.tool_call_id || m.toolCallId,
            name: m.name
          })),
          {
            role: 'assistant',
            content: finalMsg.content,
            reasoningContent: finalMsg.reasoningContent || finalMsg.reasoning_content || null,
            tool_calls: finalMsg.toolCalls.map(t => ({
              id: t.id,
              type: 'function',
              function: {
                name: t.name,
                arguments: JSON.stringify(t.args)
              }
            }))
          },
          ...finalMsg.toolCalls.map(t => ({
            role: 'tool',
            name: t.name,
            tool_call_id: t.id,
            content: JSON.stringify(t.result)
          }))
        ];

        const nextResponse = await aiDispatcher.sendMessage(messagesWithTools, {
          systemPrompt,
          model: useAiStore.getState().currentModel,
          tools: TOOL_SCHEMAS
        });

        const activeChat = get().chatHistory.find(c => c.id === chatId);
        const cumulativeTokens = {
          promptTokens: (activeChat.tokenUsage?.promptTokens || 0) + (nextResponse.usage?.prompt_tokens || 0),
          completionTokens: (activeChat.tokenUsage?.completionTokens || 0) + (nextResponse.usage?.completion_tokens || 0),
          totalTokens: (activeChat.tokenUsage?.totalTokens || 0) + (nextResponse.usage?.total_tokens || 0)
        };

        const finalAssistantMsg = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: nextResponse.content,
          reasoningContent: nextResponse.reasoningContent || null,
          createdAt: new Date().toISOString()
        };

        const finalChatUpdated = {
          ...activeChat,
          messages: [...activeChat.messages, finalAssistantMsg],
          tokenUsage: cumulativeTokens,
          updatedAt: new Date().toISOString()
        };

        await chatService.update(chatId, finalChatUpdated);
        set(state => ({
          chatHistory: state.chatHistory.map(c => c.id === chatId ? finalChatUpdated : c)
        }));
      } catch (err) {
        useAiStore.getState().setError(err.message);
      } finally {
        useAiStore.getState().setGenerating(false);
      }
    }
  },

  cancelToolCall: async (chatId, messageId, toolCallId) => {
    let history = get().chatHistory;
    let chat = history.find(c => c.id === chatId);
    if (!chat) return;

    let updatedMessages = chat.messages.map(m => {
      if (m.id === messageId && m.toolCalls) {
        return {
          ...m,
          toolCalls: m.toolCalls.map(tc => {
            if (tc.id === toolCallId) {
              return { ...tc, status: 'cancelled', result: { error: 'User cancelled this action' } };
            }
            return tc;
          })
        };
      }
      return m;
    });

    const updatedChat = {
      ...chat,
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    };

    await chatService.update(chatId, updatedChat);
    set(state => ({
      chatHistory: state.chatHistory.map(c => c.id === chatId ? updatedChat : c)
    }));

    const finalMsg = updatedMessages.find(m => m.id === messageId);
    const anyPending = finalMsg.toolCalls.some(t => t.status === 'pending_confirmation' || t.status === 'executing');

    if (!anyPending) {
      useAiStore.getState().setGenerating(true);
      try {
        const historyIdx = chat.messages.findIndex(m => m.id === messageId);
        const historyMessages = chat.messages.slice(0, historyIdx).slice(-15);
        
        const { formattedString } = buildAiContext(chat.messages[historyIdx - 1]?.content || '', { historyMessages: chat.messages.slice(0, historyIdx) });
        const systemPrompt = buildSystemPrompt(formattedString);

        const messagesWithTools = [
          ...historyMessages.map(m => ({
            role: m.role,
            content: m.content,
            reasoningContent: m.reasoningContent || m.reasoning_content || null,
            toolCalls: m.toolCalls || m.tool_calls,
            tool_call_id: m.tool_call_id || m.toolCallId,
            name: m.name
          })),
          {
            role: 'assistant',
            content: finalMsg.content,
            reasoningContent: finalMsg.reasoningContent || finalMsg.reasoning_content || null,
            tool_calls: finalMsg.toolCalls.map(t => ({
              id: t.id,
              type: 'function',
              function: {
                name: t.name,
                arguments: JSON.stringify(t.args)
              }
            }))
          },
          ...finalMsg.toolCalls.map(t => ({
            role: 'tool',
            name: t.name,
            tool_call_id: t.id,
            content: JSON.stringify(t.result)
          }))
        ];

        const nextResponse = await aiDispatcher.sendMessage(messagesWithTools, {
          systemPrompt,
          model: useAiStore.getState().currentModel,
          tools: TOOL_SCHEMAS
        });

        const activeChat = get().chatHistory.find(c => c.id === chatId);
        const cumulativeTokens = {
          promptTokens: (activeChat.tokenUsage?.promptTokens || 0) + (nextResponse.usage?.prompt_tokens || 0),
          completionTokens: (activeChat.tokenUsage?.completionTokens || 0) + (nextResponse.usage?.completion_tokens || 0),
          totalTokens: (activeChat.tokenUsage?.totalTokens || 0) + (nextResponse.usage?.total_tokens || 0)
        };

        const finalAssistantMsg = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: nextResponse.content,
          createdAt: new Date().toISOString()
        };

        const finalChatUpdated = {
          ...activeChat,
          messages: [...activeChat.messages, finalAssistantMsg],
          tokenUsage: cumulativeTokens,
          updatedAt: new Date().toISOString()
        };

        await chatService.update(chatId, finalChatUpdated);
        set(state => ({
          chatHistory: state.chatHistory.map(c => c.id === chatId ? finalChatUpdated : c)
        }));
      } catch (err) {
        useAiStore.getState().setError(err.message);
      } finally {
        useAiStore.getState().setGenerating(false);
      }
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
