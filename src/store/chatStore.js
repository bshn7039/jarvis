import { create } from 'zustand';
import { BaseService } from '../database/services/baseService';
import { STORES } from '../database/core/localDatabase';
import { deepClone } from '../utils/deepClone';
import { useAiStore } from './aiStore';
import { aiDispatcher } from '../ai/services/aiDispatcher';
import { buildAiContext } from '../ai/context/contextResolver';
import { buildSystemPrompt } from '../ai/prompts/promptBuilder';
import { TOOL_SCHEMAS, TOOL_PERMISSIONS, PERMISSION_LEVELS, TOOL_ALIASES, getFilteredTools } from '../ai/tools/toolRegistry';
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

    let apiMessages = currentMessages.slice(-15).map(m => ({
      role: m.role,
      content: m.content,
      reasoningContent: m.reasoningContent || m.reasoning_content || null,
      toolCalls: m.toolCalls || m.tool_calls,
      tool_call_id: m.tool_call_id || m.toolCallId,
      name: m.name
    }));

    let loopCount = 0;
    const maxLoops = 5;
    let currentChat = get().chatHistory.find(c => c.id === chatId);
    let aiActionsPerformed = [...(currentChat?.aiActionsPerformed || [])];
    let cumulativeTokens = {
      promptTokens: currentChat?.tokenUsage?.promptTokens || 0,
      completionTokens: currentChat?.tokenUsage?.completionTokens || 0,
      totalTokens: currentChat?.tokenUsage?.totalTokens || 0
    };

    try {
      while (loopCount < maxLoops) {
        loopCount++;
        
        const response = await aiDispatcher.sendMessage(apiMessages, {
          systemPrompt,
          tools: getFilteredTools(contextSummary, promptText),
          model
        });

        cumulativeTokens.promptTokens += (response.usage?.prompt_tokens || 0);
        cumulativeTokens.completionTokens += (response.usage?.completion_tokens || 0);
        cumulativeTokens.totalTokens += (response.usage?.total_tokens || 0);

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

        currentChat = {
          ...currentChat,
          messages: [...currentChat.messages, assistantMsg],
          contextSummary: Array.from(new Set([...(currentChat.contextSummary || []), ...contextSummary])),
          tokenUsage: cumulativeTokens,
          updatedAt: new Date().toISOString(),
        };

        await chatService.update(chatId, currentChat);
        set(state => ({
          chatHistory: state.chatHistory.map(c => c.id === chatId ? currentChat : c)
        }));

        if (!assistantMsg.toolCalls || assistantMsg.toolCalls.length === 0) {
          aiStore.setExecutionStatus('completed');
          try {
            if (assistantMsg.content) {
              const { speakText } = await import('../utils/speakText');
              speakText(assistantMsg.content);
            }
          } catch (err) {
            console.warn('[Speak Hook Error]:', err);
          }
          return;
        }

        const hasPendingConfirmation = assistantMsg.toolCalls.some(tc => tc.status === 'pending_confirmation');
        if (hasPendingConfirmation) {
          aiStore.setExecutionStatus('idle');
          try {
            if (assistantMsg.content) {
              const { speakText } = await import('../utils/speakText');
              speakText(assistantMsg.content);
            }
          } catch (err) {
            console.warn('[Speak Hook Error]:', err);
          }
          return;
        }

        aiStore.setExecutionStatus('executing');
        const toolResults = [];

        for (const tc of assistantMsg.toolCalls) {
          if (tc.status === 'pending_execution') {
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
          toolResults.push(tc);
        }

        currentChat.aiActionsPerformed = Array.from(new Set(aiActionsPerformed));

        await chatService.update(chatId, currentChat);
        set(state => ({
          chatHistory: state.chatHistory.map(c => c.id === chatId ? currentChat : c)
        }));

        apiMessages = [
          ...apiMessages,
          {
            role: 'assistant',
            content: response.content,
            reasoningContent: response.reasoningContent || response.reasoning_content || null,
            tool_calls: response.toolCalls ? response.toolCalls.map(tc => ({
              id: tc.id,
              type: 'function',
              function: {
                name: tc.function.name,
                arguments: tc.function.arguments
              }
            })) : undefined
          },
          ...toolResults.map(tr => ({
            role: 'tool',
            name: tr.name,
            tool_call_id: tr.id,
            content: JSON.stringify(tr.result)
          }))
        ];
      }

      aiStore.setExecutionStatus('completed');

      // Speak final assistant response if TTS is enabled
      try {
        const finalChatRecord = get().chatHistory.find(c => c.id === chatId);
        const lastMessage = finalChatRecord?.messages[finalChatRecord.messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content) {
          const { speakText } = await import('../utils/speakText');
          speakText(lastMessage.content);
        }
      } catch (err) {
        console.warn('[Speak Hook Error]:', err);
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
        
        const { contextSummary, formattedString } = buildAiContext(chat.messages[historyIdx - 1]?.content || '', { historyMessages: chat.messages.slice(0, historyIdx) });
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

        let apiMessages = [...messagesWithTools];
        let loopCount = 0;
        const maxLoops = 5;
        let currentChat = get().chatHistory.find(c => c.id === chatId);
        let aiActionsPerformed = [...(currentChat?.aiActionsPerformed || [])];
        let cumulativeTokens = {
          promptTokens: currentChat?.tokenUsage?.promptTokens || 0,
          completionTokens: currentChat?.tokenUsage?.completionTokens || 0,
          totalTokens: currentChat?.tokenUsage?.totalTokens || 0
        };

        while (loopCount < maxLoops) {
          loopCount++;
          const nextResponse = await aiDispatcher.sendMessage(apiMessages, {
            systemPrompt,
            model: useAiStore.getState().currentModel,
            tools: getFilteredTools(contextSummary, chat.messages[historyIdx - 1]?.content || '')
          });

          cumulativeTokens.promptTokens += (nextResponse.usage?.prompt_tokens || 0);
          cumulativeTokens.completionTokens += (nextResponse.usage?.completion_tokens || 0);
          cumulativeTokens.totalTokens += (nextResponse.usage?.total_tokens || 0);

          const assistantMsg = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: nextResponse.content,
            reasoningContent: nextResponse.reasoningContent || null,
            createdAt: new Date().toISOString(),
            toolCalls: nextResponse.toolCalls ? nextResponse.toolCalls.map(tc => {
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

          currentChat = {
            ...currentChat,
            messages: [...currentChat.messages, assistantMsg],
            tokenUsage: cumulativeTokens,
            updatedAt: new Date().toISOString()
          };

          await chatService.update(chatId, currentChat);
          set(state => ({
            chatHistory: state.chatHistory.map(c => c.id === chatId ? currentChat : c)
          }));

          if (!assistantMsg.toolCalls || assistantMsg.toolCalls.length === 0) {
            break;
          }

          const hasPendingConfirmation = assistantMsg.toolCalls.some(tc => tc.status === 'pending_confirmation');
          if (hasPendingConfirmation) {
            break;
          }

          const toolResults = [];
          for (const tc of assistantMsg.toolCalls) {
            if (tc.status === 'pending_execution') {
              try {
                const result = await executeAiTool(tc.name, tc.args);
                tc.status = 'executed';
                tc.result = result;
                aiActionsPerformed.push(tc.name);
              } catch (err) {
                tc.status = 'error';
                tc.result = { error: err.message };
              }
            }
            toolResults.push(tc);
          }

          currentChat.aiActionsPerformed = Array.from(new Set(aiActionsPerformed));
          await chatService.update(chatId, currentChat);
          set(state => ({
            chatHistory: state.chatHistory.map(c => c.id === chatId ? currentChat : c)
          }));

          apiMessages = [
            ...apiMessages,
            {
              role: 'assistant',
              content: nextResponse.content,
              reasoningContent: nextResponse.reasoningContent || nextResponse.reasoning_content || null,
              tool_calls: nextResponse.toolCalls ? nextResponse.toolCalls.map(tc => ({
                id: tc.id,
                type: 'function',
                function: {
                  name: tc.function.name,
                  arguments: tc.function.arguments
                }
              })) : undefined
            },
            ...toolResults.map(tr => ({
              role: 'tool',
              name: tr.name,
              tool_call_id: tr.id,
              content: JSON.stringify(tr.result)
            }))
          ];
        }

        // Speak final assistant response if TTS is enabled
        try {
          const finalChatRecord = get().chatHistory.find(c => c.id === chatId);
          const lastMessage = finalChatRecord?.messages[finalChatRecord.messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content) {
            const { speakText } = await import('../utils/speakText');
            speakText(lastMessage.content);
          }
        } catch (err) {
          console.warn('[Speak Hook Error]:', err);
        }
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
        
        const { contextSummary, formattedString } = buildAiContext(chat.messages[historyIdx - 1]?.content || '', { historyMessages: chat.messages.slice(0, historyIdx) });
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

        let apiMessages = [...messagesWithTools];
        let loopCount = 0;
        const maxLoops = 5;
        let currentChat = get().chatHistory.find(c => c.id === chatId);
        let aiActionsPerformed = [...(currentChat?.aiActionsPerformed || [])];
        let cumulativeTokens = {
          promptTokens: currentChat?.tokenUsage?.promptTokens || 0,
          completionTokens: currentChat?.tokenUsage?.completionTokens || 0,
          totalTokens: currentChat?.tokenUsage?.totalTokens || 0
        };

        while (loopCount < maxLoops) {
          loopCount++;
          const nextResponse = await aiDispatcher.sendMessage(apiMessages, {
            systemPrompt,
            model: useAiStore.getState().currentModel,
            tools: getFilteredTools(contextSummary, chat.messages[historyIdx - 1]?.content || '')
          });

          cumulativeTokens.promptTokens += (nextResponse.usage?.prompt_tokens || 0);
          cumulativeTokens.completionTokens += (nextResponse.usage?.completion_tokens || 0);
          cumulativeTokens.totalTokens += (nextResponse.usage?.total_tokens || 0);

          const assistantMsg = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: nextResponse.content,
            reasoningContent: nextResponse.reasoningContent || null,
            createdAt: new Date().toISOString(),
            toolCalls: nextResponse.toolCalls ? nextResponse.toolCalls.map(tc => {
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

          currentChat = {
            ...currentChat,
            messages: [...currentChat.messages, assistantMsg],
            tokenUsage: cumulativeTokens,
            updatedAt: new Date().toISOString()
          };

          await chatService.update(chatId, currentChat);
          set(state => ({
            chatHistory: state.chatHistory.map(c => c.id === chatId ? currentChat : c)
          }));

          if (!assistantMsg.toolCalls || assistantMsg.toolCalls.length === 0) {
            break;
          }

          const hasPendingConfirmation = assistantMsg.toolCalls.some(tc => tc.status === 'pending_confirmation');
          if (hasPendingConfirmation) {
            break;
          }

          const toolResults = [];
          for (const tc of assistantMsg.toolCalls) {
            if (tc.status === 'pending_execution') {
              try {
                const result = await executeAiTool(tc.name, tc.args);
                tc.status = 'executed';
                tc.result = result;
                aiActionsPerformed.push(tc.name);
              } catch (err) {
                tc.status = 'error';
                tc.result = { error: err.message };
              }
            }
            toolResults.push(tc);
          }

          currentChat.aiActionsPerformed = Array.from(new Set(aiActionsPerformed));
          await chatService.update(chatId, currentChat);
          set(state => ({
            chatHistory: state.chatHistory.map(c => c.id === chatId ? currentChat : c)
          }));

          apiMessages = [
            ...apiMessages,
            {
              role: 'assistant',
              content: nextResponse.content,
              reasoningContent: nextResponse.reasoningContent || nextResponse.reasoning_content || null,
              tool_calls: nextResponse.toolCalls ? nextResponse.toolCalls.map(tc => ({
                id: tc.id,
                type: 'function',
                function: {
                  name: tc.function.name,
                  arguments: tc.function.arguments
                }
              })) : undefined
            },
            ...toolResults.map(tr => ({
              role: 'tool',
              name: tr.name,
              tool_call_id: tr.id,
              content: JSON.stringify(tr.result)
            }))
          ];
        }

        // Speak final assistant response if TTS is enabled
        try {
          const finalChatRecord = get().chatHistory.find(c => c.id === chatId);
          const lastMessage = finalChatRecord?.messages[finalChatRecord.messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content) {
            const { speakText } = await import('../utils/speakText');
            speakText(lastMessage.content);
          }
        } catch (err) {
          console.warn('[Speak Hook Error]:', err);
        }
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
