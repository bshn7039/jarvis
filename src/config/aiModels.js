export const AI_MODELS = {
  CHAT: 'deepseek-chat',
  REASONER: 'deepseek-reasoner',
};

export const DEFAULT_MODEL = AI_MODELS.CHAT;

export const MODEL_CONFIG = [
  {
    id: AI_MODELS.CHAT,
    name: 'DeepSeek Chat',
    description: 'General purpose fast and intelligent model.',
  },
  {
    id: AI_MODELS.REASONER,
    name: 'DeepSeek Reasoner',
    description: 'Advanced reasoning model for complex tasks.',
  },
];
