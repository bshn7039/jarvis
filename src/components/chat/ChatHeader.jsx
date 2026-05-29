import { Menu, Plus, ChevronDown, Settings, Trash2, Key, Eye, EyeOff, Check, X, Volume2, VolumeX } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { useChatStore } from '../../store/chatStore';
import { useAiStore } from '../../store/aiStore';
import { MODEL_CONFIG } from '../../config/aiModels';
import NowPlayingBar from '../layout/NowPlayingBar';
import { useState, useEffect, useRef } from 'react';
import { soundService } from '../../services/soundService';

function AiSettingsModal({ isOpen, onClose, targetModelId, onSave }) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  
  // Custom model fields
  const [provider, setProvider] = useState('custom');
  const [modelId, setModelId] = useState('');
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const isBuiltIn = targetModelId && ['deepseek-v4-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'].includes(targetModelId);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setShowKey(false);

    if (isBuiltIn) {
      // Load active key from localstorage if any
      const providerName = targetModelId.startsWith('gemini') ? 'gemini' : 'deepseek';
      setKey(localStorage.getItem(`jarvis_api_key_${providerName}`) || '');
    } else if (targetModelId && targetModelId !== 'new') {
      // Load custom model details
      try {
        const customModels = JSON.parse(localStorage.getItem('jarvis_custom_models')) || [];
        const model = customModels.find(m => m.id === targetModelId);
        if (model) {
          setProvider(model.provider || 'custom');
          setModelId(model.modelId || '');
          setName(model.name || '');
          setBaseUrl(model.baseUrl || '');
          setDescription(model.description || '');
          setKey(localStorage.getItem(`jarvis_api_key_custom_${model.id}`) || '');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // New custom model
      setProvider('custom');
      setModelId('');
      setName('');
      setBaseUrl('https://api.openai.com/v1');
      setDescription('');
      setKey('');
    }
  }, [isOpen, targetModelId, isBuiltIn]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (isBuiltIn) {
      const providerName = targetModelId.startsWith('gemini') ? 'gemini' : 'deepseek';
      if (key.trim()) {
        localStorage.setItem(`jarvis_api_key_${providerName}`, key.trim());
      } else {
        localStorage.removeItem(`jarvis_api_key_${providerName}`);
      }
      onSave();
      onClose();
    } else {
      // Validate fields
      if (!modelId.trim() || !name.trim()) {
        setError('Model ID and Name are required.');
        return;
      }

      const newModelId = targetModelId === 'new' ? `custom-${modelId.trim()}` : targetModelId;

      const newModel = {
        id: newModelId,
        modelId: modelId.trim(),
        name: name.trim(),
        description: description.trim() || 'Custom OpenAI-compatible API model.',
        provider: 'custom',
        baseUrl: baseUrl.trim() || 'https://api.openai.com/v1',
      };

      try {
        let customModels = JSON.parse(localStorage.getItem('jarvis_custom_models')) || [];
        if (targetModelId === 'new') {
          // Check for duplicate id
          if (customModels.some(m => m.id === newModelId) || ['deepseek-v4-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'].includes(newModelId)) {
            setError('A model with this ID already exists.');
            return;
          }
          customModels.push(newModel);
        } else {
          customModels = customModels.map(m => m.id === targetModelId ? newModel : m);
        }
        localStorage.setItem('jarvis_custom_models', JSON.stringify(customModels));
        if (key.trim()) {
          localStorage.setItem(`jarvis_api_key_custom_${newModelId}`, key.trim());
        } else {
          localStorage.removeItem(`jarvis_api_key_custom_${newModelId}`);
        }
        
        onSave();
        onClose();
      } catch (err) {
        setError('Failed to save configuration.');
      }
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove the model "${name}"?`)) {
      try {
        let customModels = JSON.parse(localStorage.getItem('jarvis_custom_models')) || [];
        customModels = customModels.filter(m => m.id !== targetModelId);
        localStorage.setItem('jarvis_custom_models', JSON.stringify(customModels));
        localStorage.removeItem(`jarvis_api_key_custom_${targetModelId}`);
        
        // If the deleted model was currently active, reset it to default
        if (useAiStore.getState().currentModel === targetModelId) {
          useAiStore.getState().setModel('deepseek-v4-flash');
        }

        onSave();
        onClose();
      } catch (err) {
        setError('Failed to delete model.');
      }
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      <div 
        className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-md rounded-2xl border border-jarvis-border/60 bg-jarvis-panel/95 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl p-5 md:p-6"
      >
        <div className="flex items-center justify-between border-b border-jarvis-border/30 pb-3 mb-4">
          <h3 className="text-sm font-semibold text-jarvis-text uppercase tracking-wider">
            {targetModelId === 'new' ? 'Add Custom API Model' : isBuiltIn ? `Configure ${targetModelId.startsWith('gemini') ? 'Gemini' : 'DeepSeek'} Key` : 'Edit Custom Model Configuration'}
          </h3>
          <button onClick={onClose} className="text-jarvis-muted hover:text-jarvis-text transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {isBuiltIn ? (
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-jarvis-muted">
                {targetModelId.startsWith('gemini') ? 'Gemini' : 'DeepSeek'} API Key
              </label>
              <div className="relative flex items-center">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="Enter API Key... (falls back to .env if empty)"
                  className="w-full rounded-xl border border-jarvis-border bg-black/25 pl-3 pr-10 py-2.5 text-xs text-jarvis-text placeholder:text-jarvis-muted/50 focus:outline-none focus:border-jarvis-accent/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 text-jarvis-muted hover:text-jarvis-text transition-colors"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[9px] text-jarvis-muted mt-1">
                This key is saved locally in your browser cache and never sent to any third party.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-jarvis-muted">Model ID</label>
                  <input
                    type="text"
                    required
                    disabled={targetModelId !== 'new'}
                    value={modelId}
                    onChange={e => setModelId(e.target.value)}
                    placeholder="e.g. llama-3.1-8b"
                    className="w-full rounded-xl border border-jarvis-border bg-black/25 px-3 py-2 text-xs text-jarvis-text placeholder:text-jarvis-muted/50 focus:outline-none focus:border-jarvis-accent/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-jarvis-muted">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Llama 3.1 (Groq)"
                    className="w-full rounded-xl border border-jarvis-border bg-black/25 px-3 py-2 text-xs text-jarvis-text placeholder:text-jarvis-muted/50 focus:outline-none focus:border-jarvis-accent/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-jarvis-muted font-mono">Base URL</label>
                <input
                  type="url"
                  required
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                  placeholder="e.g. https://api.groq.com/openai/v1"
                  className="w-full rounded-xl border border-jarvis-border bg-black/25 px-3 py-2 text-xs text-jarvis-text placeholder:text-jarvis-muted/50 focus:outline-none focus:border-jarvis-accent/50 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-jarvis-muted font-mono">API Key</label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    placeholder="Enter Custom API key..."
                    className="w-full rounded-xl border border-jarvis-border bg-black/25 pl-3 pr-10 py-2.5 text-xs text-jarvis-text placeholder:text-jarvis-muted/50 focus:outline-none focus:border-jarvis-accent/50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 text-jarvis-muted hover:text-jarvis-text transition-colors"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-jarvis-muted">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. High-performance model running on custom endpoint"
                  className="w-full rounded-xl border border-jarvis-border bg-black/25 px-3 py-2 text-xs text-jarvis-text placeholder:text-jarvis-muted/50 focus:outline-none focus:border-jarvis-accent/50"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 border-t border-jarvis-border/30 pt-4 mt-2">
            {!isBuiltIn && targetModelId !== 'new' && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 active:scale-95 transition-all mr-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-jarvis-border px-3.5 py-2 text-xs font-semibold text-jarvis-muted hover:text-jarvis-text hover:bg-white/5 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-jarvis-accent px-4 py-2 text-xs font-semibold text-jarvis-bg hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              <Check className="h-3.5 w-3.5" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function ChatHeader({ title, onMenuClick }) {
  const createNewChat = useChatStore((s) => s.createNewChat);
  const currentModel = useAiStore((s) => s.currentModel);
  const setModel = useAiStore((s) => s.setModel);
  const [showModels, setShowModels] = useState(false);
  
  // Settings modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editModelId, setEditModelId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const dropdownRef = useRef(null);

  // Speech Output states
  const [speakOn, setSpeakOn] = useState(() => localStorage.getItem('jarvis_speak_replies') !== 'false');
  const [speakEngine, setSpeakEngine] = useState(() => localStorage.getItem('jarvis_speak_engine') || 'elevenlabs');

  const toggleSpeak = () => {
    const nextVal = !speakOn;
    setSpeakOn(nextVal);
    localStorage.setItem('jarvis_speak_replies', String(nextVal));
    soundService.playConfirm();
  };

  const changeSpeakEngine = (e) => {
    const nextEngine = e.target.value;
    setSpeakEngine(nextEngine);
    localStorage.setItem('jarvis_speak_engine', nextEngine);
    soundService.playClick();
  };

  useEffect(() => {
    if (!showModels) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowModels(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModels]);

  // Get active models list: default MODEL_CONFIG + custom models from localstorage
  let customModels = [];
  try {
    customModels = JSON.parse(localStorage.getItem('jarvis_custom_models')) || [];
  } catch (e) {
    console.warn(e);
  }
  const allModels = [...MODEL_CONFIG, ...customModels];
  const selectedModel = allModels.find(m => m.id === currentModel) || allModels[0];

  return (
    <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-jarvis-border/20 jarvis-glass px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <IconButton
          icon={Menu}
          label="Open menu"
          onClick={onMenuClick}
          className="md:hidden"
          size="md"
        />
        <div className="flex flex-col">
          {title ? (
            <h1 className="max-w-[150px] truncate text-sm font-medium text-jarvis-text sm:max-w-[300px]">{title}</h1>
          ) : (
            <span className="text-sm text-jarvis-muted md:hidden">Jarvis</span>
          )}
        </div>

        {/* Now Playing / Ambient — always visible beside header title */}
        <NowPlayingBar />
      </div>

      <div className="flex items-center gap-2">
        {/* TTS Toggle and Engine Select */}
        <div className="flex items-center gap-1 border border-jarvis-border/40 bg-jarvis-panel/40 px-2 py-1 rounded-lg">
          <button
            onClick={toggleSpeak}
            className={[
              "p-1 rounded transition-colors cursor-pointer",
              speakOn 
                ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" 
                : "text-jarvis-muted hover:text-jarvis-text hover:bg-white/5"
            ].join(' ')}
            title={speakOn ? "Turn Voice Outputs OFF" : "Turn Voice Outputs ON"}
          >
            {speakOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
          
          <select
            value={speakEngine}
            onChange={changeSpeakEngine}
            className="bg-transparent border-none text-[9px] font-bold uppercase tracking-wider text-jarvis-muted focus:ring-0 cursor-pointer outline-none hover:text-jarvis-text pr-1 text-center"
            title="Select Voice Synthesis Engine"
          >
            <option value="elevenlabs" className="bg-jarvis-panel text-jarvis-text text-left">11Labs</option>
            <option value="browser" className="bg-jarvis-panel text-jarvis-text text-left">Chrome</option>
          </select>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowModels(!showModels)}
            className="flex items-center gap-1.5 rounded-lg border border-jarvis-border bg-jarvis-panel/50 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-jarvis-muted transition-colors hover:bg-jarvis-panel"
          >
            {selectedModel.name}
            <ChevronDown className={["h-3 w-3 transition-transform duration-200", showModels ? "rotate-180" : ""].join(' ')} />
          </button>

          {showModels && (
            <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-jarvis-border bg-jarvis-panel p-1.5 shadow-xl">
                <div className="max-h-60 overflow-y-auto space-y-0.5">
                  {allModels.map((model) => (
                    <div 
                      key={model.id}
                      onClick={() => {
                        console.log(`[ChatHeader] User selected model: ${model.id}`);
                        setModel(model.id);
                        setShowModels(false);
                      }}
                      className={[
                        "group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors",
                        currentModel === model.id ? "bg-jarvis-muted/10" : "hover:bg-jarvis-muted/5"
                      ].join(' ')}
                    >
                      <div className="flex-1 text-left min-w-0">
                        <div className={["text-[12px] font-medium", currentModel === model.id ? "text-jarvis-accent" : "text-jarvis-text"].join(' ')}>{model.name}</div>
                        <div className="text-[10px] opacity-60 line-clamp-1">{model.description}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditModelId(model.id);
                          setIsSettingsOpen(true);
                          setShowModels(false);
                        }}
                        className="p-1 rounded text-jarvis-muted hover:text-jarvis-accent hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5"
                        title="Edit API Key / Settings"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-jarvis-border/40 mt-1.5 pt-1.5">
                  <button
                    onClick={() => {
                      setEditModelId('new');
                      setIsSettingsOpen(true);
                      setShowModels(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-jarvis-accent bg-jarvis-accent/5 border border-jarvis-accent/20 hover:bg-jarvis-accent/15 transition-all text-center"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Model / API
                  </button>
                </div>
              </div>
          )}
        </div>

        <IconButton
          icon={Plus}
          label="New Chat"
          onClick={() => createNewChat()}
          size="md"
          variant="ghost"
        />
      </div>

      <AiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        targetModelId={editModelId}
        onSave={() => setRefreshTrigger(prev => prev + 1)}
      />
    </header>
  );
}
