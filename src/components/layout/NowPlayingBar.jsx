import { useState, useRef, useEffect } from 'react';
import { Music2, Play, Pause, Volume2, VolumeX, ChevronDown, Square } from 'lucide-react';
import { useSpotifyStore } from '../../store/spotifyStore';
import { useAmbientStore } from '../../store/ambientStore';

/* ─── Mini equalizer bars ─── */
function MiniEqualizer() {
  return (
    <div className="npb-equalizer">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="npb-eq-bar" style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </div>
  );
}

/* ─── Spotify Now Playing display ─── */
function SpotifyNowPlaying({ track, isPlaying, onToggle }) {
  const albumArt =
    track?.album?.images?.[2]?.url || track?.album?.images?.[0]?.url;
  const name = track?.name || 'Unknown';
  const artist = track?.artists?.map((a) => a.name).join(', ') || '';

  return (
    <button
      className="npb-spotify-track"
      onClick={onToggle}
      title={isPlaying ? 'Pause' : 'Resume'}
    >
      {albumArt ? (
        <img src={albumArt} alt="" className="npb-album-art" />
      ) : (
        <div className="npb-album-placeholder">
          <Music2 style={{ width: 10, height: 10 }} />
        </div>
      )}

      <div className="npb-track-info">
        <span className="npb-track-name">{name}</span>
        <span className="npb-track-artist">{artist}</span>
      </div>

      {isPlaying ? <MiniEqualizer /> : <Play style={{ width: 10, height: 10, opacity: 0.5 }} />}
    </button>
  );
}

/* ─── Ambient sound picker dropdown ─── */
function AmbientPicker({ isOpen, onClose }) {
  const { sounds, activeId, volume, play, stop, setVolume, isLoading } =
    useAmbientStore();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={panelRef} className="npb-ambient-panel">
      {/* Accent line */}
      <div className="npb-ambient-glow" />

      <div className="npb-ambient-header">
        <span className="npb-ambient-title">Ambient Sounds</span>
        <span className="npb-ambient-subtitle">Infinite loop • Focus mode</span>
      </div>

      <div className="npb-ambient-grid">
        {sounds.map((s) => {
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => play(s.id)}
              className={`npb-ambient-btn ${isActive ? 'npb-ambient-btn--active' : ''}`}
              disabled={isLoading && !isActive}
            >
              <span className="npb-ambient-emoji">{s.emoji}</span>
              <span className="npb-ambient-label">{s.label}</span>
              {isActive && (
                <span className="npb-ambient-playing">
                  <MiniEqualizer />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Volume */}
      {activeId && (
        <div className="npb-ambient-volume">
          <button
            onClick={() => setVolume(volume === 0 ? 40 : 0)}
            className="npb-ambient-vol-icon"
          >
            {volume === 0 ? (
              <VolumeX style={{ width: 12, height: 12 }} />
            ) : (
              <Volume2 style={{ width: 12, height: 12 }} />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="npb-ambient-slider"
          />
          <span className="npb-ambient-vol-pct">{volume}%</span>
        </div>
      )}

      {activeId && (
        <button onClick={stop} className="npb-ambient-stop">
          <Square style={{ width: 10, height: 10 }} />
          Stop
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function NowPlayingBar() {
  const spotifyPlaying = useSpotifyStore((s) => s.isPlaying);
  const spotifyTrack = useSpotifyStore((s) => s.currentTrack);
  const spotifyPause = useSpotifyStore((s) => s.pause);
  const spotifyPlay = useSpotifyStore((s) => s.play);
  const spotifyToken = useSpotifyStore((s) => s.token);

  const ambientActiveId = useAmbientStore((s) => s.activeId);
  const ambientSounds = useAmbientStore((s) => s.sounds);

  const [ambientOpen, setAmbientOpen] = useState(false);

  const isSpotifyActive = spotifyToken && spotifyTrack && spotifyPlaying;
  const activeAmbient = ambientSounds.find((s) => s.id === ambientActiveId);

  const handleSpotifyToggle = () => {
    if (spotifyPlaying) spotifyPause();
    else spotifyPlay();
  };

  // Automatically pause/stop ambient sounds when Spotify starts playing
  useEffect(() => {
    if (spotifyPlaying && spotifyToken && spotifyTrack) {
      useAmbientStore.getState().stop();
    }
  }, [spotifyPlaying, spotifyToken, spotifyTrack]);

  return (
    <div className="npb-root" id="jarvis-now-playing">
      {isSpotifyActive ? (
        /* ── Spotify is active: show track ── */
        <SpotifyNowPlaying
          track={spotifyTrack}
          isPlaying={spotifyPlaying}
          onToggle={handleSpotifyToggle}
        />
      ) : (
        /* ── No Spotify: ambient controls ── */
        <div className="npb-ambient-trigger-wrap">
          <button
            className={`npb-ambient-trigger ${activeAmbient ? 'npb-ambient-trigger--active' : ''}`}
            onClick={() => setAmbientOpen((p) => !p)}
          >
            {activeAmbient ? (
              <>
                <span className="npb-ambient-trigger-emoji">{activeAmbient.emoji}</span>
                <span className="npb-ambient-trigger-label">{activeAmbient.label}</span>
                <MiniEqualizer />
              </>
            ) : (
              <>
                <Music2 style={{ width: 12, height: 12, opacity: 0.5 }} />
                <span className="npb-ambient-trigger-label">Ambience</span>
              </>
            )}
            <ChevronDown
              style={{ width: 10, height: 10, opacity: 0.4 }}
              className={ambientOpen ? 'npb-chevron-flip' : ''}
            />
          </button>

          <AmbientPicker isOpen={ambientOpen} onClose={() => setAmbientOpen(false)} />
        </div>
      )}
    </div>
  );
}
