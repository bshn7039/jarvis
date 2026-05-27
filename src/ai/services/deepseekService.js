const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

export class DeepSeekService {
  constructor(apiKey) {
    this.apiKey = apiKey || import.meta.env.VITE_DEEPSEEK_API_KEY;
  }

  async sendMessage(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key is missing. Please check your .env file.');
    }

    const {
      model = 'deepseek-v4-flash',
      temperature = 0.7,
      max_tokens = 2048,
      systemPrompt,
      tools,
      signal,
      timeout = 30000,
      retries = 3
    } = options;

    // Combine system prompt if provided
    let apiMessages = [...messages];
    if (systemPrompt) {
      apiMessages = [{ role: 'system', content: systemPrompt }, ...apiMessages];
    }

    const requestBody = {
      model,
      messages: apiMessages.map(m => ({ role: m.role, content: m.content || '', tool_calls: m.toolCalls || m.tool_calls })),
      temperature,
      max_tokens,
    };

    if (tools && tools.length > 0) {
      requestBody.tools = tools;
    }

    let lastError = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      if (signal) {
        signal.addEventListener('abort', () => controller.abort());
      }

      try {
        const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Log token usage
        if (data.usage) {
          console.log(`[DeepSeek API Token Usage] Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens}, Total: ${data.usage.total_tokens}`);
        }

        return {
          id: data.id,
          content: data.choices[0].message?.content || '',
          toolCalls: data.choices[0].message?.tool_calls || null,
          model: data.model,
          usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          role: 'assistant',
          createdAt: new Date().toISOString(),
        };

      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        if (signal && signal.aborted) {
          throw new Error('Request aborted by user');
        }

        if (error.name === 'AbortError') {
          console.warn(`[DeepSeek Service] Attempt ${attempt} timed out.`);
        } else {
          console.warn(`[DeepSeek Service] Attempt ${attempt} failed: ${error.message}`);
        }

        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after maximum retries');
  }
}

export const deepSeekService = new DeepSeekService();
