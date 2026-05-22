const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

export class DeepSeekClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async sendMessage(messages, model = 'deepseek-chat', options = {}) {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key is missing. Please check your .env file.');
    }

    try {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeResponse(data);
    } catch (error) {
      console.error('DeepSeek AI Error:', error);
      throw error;
    }
  }

  normalizeResponse(data) {
    return {
      id: data.id,
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
      role: 'assistant',
      createdAt: new Date().toISOString(),
    };
  }
}

export const aiClient = new DeepSeekClient(import.meta.env.VITE_DEEPSEEK_API_KEY);
