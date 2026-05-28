import { deepSeekService } from './deepseekService';
import { geminiService } from './geminiService';
import { useAiStore } from '../../store/aiStore';

export const aiDispatcher = {
  async sendMessage(messages, options = {}) {
    // Dynamically retrieve the current model from state
    const currentModel = useAiStore.getState().currentModel;

    // Check if it is a custom model configured in settings
    let customModels = [];
    try {
      customModels = JSON.parse(localStorage.getItem('jarvis_custom_models')) || [];
    } catch (e) {
      console.warn('Failed to parse custom models from localStorage', e);
    }
    const customModel = customModels.find(m => m.id === currentModel);

    if (customModel && customModel.provider === 'custom') {
      const baseUrl = customModel.baseUrl || 'https://api.openai.com/v1';
      const apiKey = localStorage.getItem(`jarvis_api_key_custom_${customModel.id}`) || customModel.apiKey;
      
      if (!apiKey) {
        throw new Error(`API key is missing for custom model "${customModel.name}". Please edit the API key in Settings.`);
      }

      const requestBody = {
        model: customModel.modelId || currentModel,
        messages: messages.map(m => ({ role: m.role, content: m.content || '' })),
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
        max_tokens: options.max_tokens || 2048,
      };

      if (options.systemPrompt) {
        requestBody.messages.unshift({ role: 'system', content: options.systemPrompt });
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        content: data.choices[0].message?.content || '',
        reasoningContent: data.choices[0].message?.reasoning_content || null,
        toolCalls: null,
        model: data.model,
        usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        responseTime: 0,
        role: 'assistant',
        createdAt: new Date().toISOString(),
      };
    }

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
