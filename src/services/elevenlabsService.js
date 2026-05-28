export class ElevenlabsService {
  constructor() {
    // Expose ElevenLabs key to Vite client-side
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  }

  /**
   * Synthesizes text into speech.
   * @param {string} text The text to synthesize.
   * @param {string} voiceId The ElevenLabs Voice ID (defaults to Adam).
   * @param {boolean} forceBrowser Whether to bypass ElevenLabs and use browser SpeechSynthesis directly.
   * @returns {Promise<{audioUrl?: string, utterance?: SpeechSynthesisUtterance, source: 'elevenlabs' | 'browser' | null}>}
   */
  async textToSpeech(text, voiceId, forceBrowser = false) {
    if (forceBrowser) {
      console.log('[TTS] Bypassing ElevenLabs, forcing browser synthesis.');
      return this.fallbackSpeechSynthesis(text);
    }

    // Allow custom voice from localStorage, fallback to pre-made Adam ID
    const activeVoice = voiceId 
      || localStorage.getItem('jarvis_elevenlabs_voice') 
      || 'EXAVITQu4vr4xnSDxMaL';

    if (!this.apiKey || this.apiKey.includes('elevenlabs-sk_YOUR_KEY')) {
      console.warn('[ElevenLabs] API key is missing. Falling back to browser synthesis.');
      return this.fallbackSpeechSynthesis(text);
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${activeVoice}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey.trim(),
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ElevenLabs API Error] Status: ${response.status}. Message: ${errorText}`);
        throw new Error(`ElevenLabs TTS response status: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      return { audioUrl, source: 'elevenlabs' };
    } catch (err) {
      console.error('[ElevenLabs] API call failed, falling back to browser synthesis:', err);
      return this.fallbackSpeechSynthesis(text);
    }
  }

  fallbackSpeechSynthesis(text) {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('[ElevenLabs Fallback] Browser does not support speech synthesis.');
        resolve({ source: null });
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Fetch all voices available in Chrome, Edge, Safari
      const voices = window.speechSynthesis.getVoices();
      
      // 1. Prioritize Indian English voices (e.g. en-IN, Ravi, Karishma, Heera, etc.)
      // 2. Fall back to standard Google, Microsoft, or system English voices
      const preferredVoice = voices.find(v => v.lang === 'en-IN')
        || voices.find(v => v.lang.startsWith('en-IN'))
        || voices.find(v => v.name.toLowerCase().includes('india'))
        || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) 
        || voices.find(v => v.lang.startsWith('en')) 
        || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log(`[TTS Fallback] Speaking with native voice: ${preferredVoice.name} (${preferredVoice.lang})`);
      }
      
      utterance.rate = 1.05; // Adjust speed for a professional, helpful assistant tone
      utterance.pitch = 1.0;
      
      resolve({ utterance, source: 'browser' });
    });
  }
}

export const elevenlabsService = new ElevenlabsService();
