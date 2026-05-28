import { useState, useRef, useEffect } from 'react';
import { Sun, Volume2, VolumeX, Moon, ShieldAlert, Eye, Settings2, Sliders, Music, Check, Volume1, BellRing, BellOff } from 'lucide-react';
import { useFocusStore } from '../../store/focusStore';
import { useAmbientStore } from '../../store/ambientStore';
import { useSpotifyStore } from '../../store/spotifyStore';
import { soundService } from '../../services/soundService';

export default function FocusControls() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const { brightness, dnd, setBrightness, setDnd } = useFocusStore();
  const { activeId: ambientId, play: playAmbient, stop: stopAmbient, volume: ambientVol, setVolume: setAmbientVol, sounds: ambientList } = useAmbientStore();
  const { token: spotifyToken, isPlaying: spotifyPlaying, currentTrack: spotifyTrack, play: playSpotify, pause: pauseSpotify } = useSpotifyStore();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const toggleOpen = () => {
    soundService.playClick();
    setIsOpen(!isOpen);
  };

  const handleBrightnessChange = (e) => {
    setBrightness(Number(e.target.value));
  };

  const handleAmbientToggle = (id) => {
    soundService.playPop();
    playAmbient(id);
  };

  const handleDndToggle = () => {
    const nextDnd = !dnd;
    setDnd(nextDnd);
    if (!nextDnd) {
      // Play confirm sound after unmuting to give auditory feedback
      setTimeout(() => soundService.playConfirm(), 50);
    }
  };

  const handleSpotifyToggle = () => {
    soundService.playPop();
    if (spotifyPlaying) pauseSpotify();
    else playSpotify();
  };

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Control Panel */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-2xl jarvis-glass p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="mb-4 flex items-center justify-between border-b border-jarvis-border/20 pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-jarvis-accent" />
              <h3 className="text-[12px] font-bold uppercase tracking-[0.15em] text-jarvis-text">
                Focus Environment
              </h3>
            </div>
            <span className="text-[9px] font-mono text-jarvis-muted uppercase">Controls</span>
          </div>

          <div className="space-y-4">
            {/* 1. Screen Dimmer (Brightness) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-jarvis-muted flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5" /> Screen Brightness
                </span>
                <span className="font-mono text-jarvis-text">{brightness}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={100}
                value={brightness}
                onChange={handleBrightnessChange}
                className="w-full h-1.5 rounded-lg appearance-none bg-black/40 outline-none cursor-pointer accent-jarvis-accent"
                style={{
                  background: `linear-gradient(to right, var(--color-jarvis-accent) 0%, var(--color-jarvis-accent) ${brightness}%, rgba(0, 0, 0, 0.4) ${brightness}%, rgba(0, 0, 0, 0.4) 100%)`
                }}
              />
            </div>

            {/* 2. Ambience Loops */}
            <div className="space-y-2">
              <span className="text-xs text-jarvis-muted flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5" /> Ambience Soundscape
              </span>
              <div className="grid grid-cols-2 gap-2">
                {ambientList.map((sound) => {
                  const isActive = ambientId === sound.id;
                  return (
                    <button
                      key={sound.id}
                      onClick={() => handleAmbientToggle(sound.id)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${
                        isActive
                          ? 'bg-jarvis-accent/15 border-jarvis-accent/40 text-jarvis-accent font-semibold'
                          : 'bg-black/20 border-jarvis-border/40 text-jarvis-muted hover:border-jarvis-muted/50 hover:text-jarvis-text'
                      }`}
                    >
                      <span className="text-[14px]">{sound.emoji}</span>
                      <span className="truncate">{sound.label}</span>
                    </button>
                  );
                })}
              </div>
              {ambientId && (
                <div className="flex items-center gap-3 rounded-xl bg-black/20 border border-jarvis-border/20 p-2.5 mt-2">
                  <button
                    onClick={() => setAmbientVol(ambientVol === 0 ? 40 : 0)}
                    className="text-jarvis-muted hover:text-jarvis-text"
                  >
                    {ambientVol === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={ambientVol}
                    onChange={(e) => setAmbientVol(Number(e.target.value))}
                    className="flex-1 h-1 rounded-lg appearance-none bg-black/40 outline-none accent-jarvis-accent"
                  />
                  <span className="text-[10px] font-mono text-jarvis-muted w-7 text-right">{ambientVol}%</span>
                </div>
              )}
            </div>

            {/* 3. Focus Music (Spotify Bridge) */}
            {spotifyToken && (
              <div className="space-y-1.5 border-t border-jarvis-border/10 pt-3">
                <span className="text-xs text-jarvis-muted flex items-center gap-1.5">
                  <Music className="h-3.5 w-3.5" /> Focus Music (Spotify)
                </span>
                <div className="flex items-center justify-between rounded-xl bg-black/20 border border-jarvis-border/20 p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-jarvis-text">
                      {spotifyTrack?.name || 'No Track Selected'}
                    </p>
                    <p className="truncate text-[10px] text-jarvis-muted">
                      {spotifyTrack?.artists?.map((a) => a.name).join(', ') || 'Connected'}
                    </p>
                  </div>
                  <button
                    onClick={handleSpotifyToggle}
                    className="ml-3 rounded-lg bg-jarvis-accent/15 border border-jarvis-accent/30 text-jarvis-accent px-3 py-1 text-xs hover:bg-jarvis-accent/25 transition-all shrink-0 font-medium"
                  >
                    {spotifyPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>
              </div>
            )}

            {/* 4. Do Not Disturb (Sound & Notifications Mute) */}
            <div className="flex items-center justify-between border-t border-jarvis-border/10 pt-3">
              <span className="text-xs text-jarvis-muted flex items-center gap-1.5">
                {dnd ? <BellOff className="h-3.5 w-3.5 text-red-400" /> : <BellRing className="h-3.5 w-3.5" />} 
                Quiet Mode (DND)
              </span>
              <button
                onClick={handleDndToggle}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  dnd ? 'bg-red-500/80' : 'bg-black/40'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    dnd ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={toggleOpen}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-jarvis-accent border-jarvis-accent text-jarvis-bg rotate-90 shadow-[0_0_15px_rgba(125,211,252,0.25)]'
            : 'jarvis-glass border-jarvis-border hover:border-jarvis-accent/50 text-jarvis-text hover:text-jarvis-accent'
        }`}
        title="Environment Settings"
      >
        <Settings2 className="h-5 w-5" />
      </button>
    </div>
  );
}
