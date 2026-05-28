export const AI_MODELS = {
  DEEPSEEK_FLASH: 'deepseek-v4-flash',
  GEMINI_FLASH: 'gemini-2.5-flash',
  GEMINI_PRO: 'gemini-2.5-pro',
};

export const DEFAULT_MODEL = AI_MODELS.DEEPSEEK_FLASH;

export const MODEL_CONFIG = [
  {
    id: AI_MODELS.DEEPSEEK_FLASH,
    name: 'DeepSeek V4 Flash',
    description: 'Fast, intelligent and reasoning-capable.',
  },
  {
    id: AI_MODELS.GEMINI_FLASH,
    name: 'Gemini 2.5 Flash',
    description: 'Ultra-fast, cost-effective Google AI model.',
  },
  {
    id: AI_MODELS.GEMINI_PRO,
    name: 'Gemini 2.5 Pro',
    description: 'Highly advanced model for deep reasoning.',
  },
];
