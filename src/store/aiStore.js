import { create } from 'zustand';
import { DEFAULT_MODEL } from '../config/aiModels';

export const useAiStore = create((set, get) => ({
  isGenerating: false,
  currentModel: DEFAULT_MODEL,
  lastError: null,
  
  // AI Execution tracking
  executionStatus: 'idle', // 'idle' | 'analyzing' | 'executing' | 'completed' | 'failed'
  pendingTools: [],
  executedTools: [],
  toolCooldowns: {}, // { toolName: timestamp }

  setGenerating: (isGenerating) => set({ isGenerating }),
  setModel: (model) => set({ currentModel: model }),
  setError: (error) => set({ lastError: error }),
  clearError: () => set({ lastError: null }),
  
  setExecutionStatus: (status) => set({ executionStatus: status }),
  
  addPendingTool: (tool) => set((state) => ({ 
    pendingTools: [...state.pendingTools, { ...tool, status: 'pending', timestamp: Date.now() }] 
  })),
  
  updateToolStatus: (toolId, status, result = null) => set((state) => ({
    pendingTools: state.pendingTools.map(t => 
      t.id === toolId ? { ...t, status, result, completedAt: status === 'executed' ? Date.now() : null } : t
    ),
    executedTools: status === 'executed' 
      ? [...state.executedTools, { ...state.pendingTools.find(t => t.id === toolId), status, result, completedAt: Date.now() }]
      : state.executedTools
  })),

  setToolCooldown: (toolName) => set((state) => ({
    toolCooldowns: { ...state.toolCooldowns, [toolName]: Date.now() + 2000 } // 2 second cooldown
  })),

  isToolOnCooldown: (toolName) => {
    const cooldown = get().toolCooldowns[toolName];
    return cooldown && Date.now() < cooldown;
  },

  resetExecution: () => set({
    executionStatus: 'idle',
    pendingTools: [],
    executedTools: [],
    lastError: null
  })
}));
