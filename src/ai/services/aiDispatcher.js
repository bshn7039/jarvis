import { deepSeekService } from './deepseekService';
import { geminiService } from './geminiService';
import { useAiStore } from '../../store/aiStore';

export const aiDispatcher = {
  async sendMessage(messages, options = {}) {
    // Dynamically retrieve the current model from state
    const currentModel = useAiStore.getState().currentModel;

    if (currentModel.startsWith('gemini')) {
      return geminiService.sendMessage(messages, {
        ...options,
        model: currentModel,
      });
    } else {
      return deepSeekService.sendMessage(messages, {
        ...options,
        model: currentModel,
      });
    }
  }
};
