import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Music2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Search, X, ChevronRight, Loader2, Link2, LogOut, Plus, ListMusic, FileText, Shuffle
} from 'lucide-react';
import { useSpotifyStore } from '../../store/spotifyStore';

function msToTime(ms) {
  if (!ms) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function ProgressBar({ progressMs, durationMs, onSeek }) {
  const barRef = useRef(null);
  const pct = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  const handleClick = (e) => {
    if (!barRef.current || !durationMs) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.floor(ratio * durationMs));
  };

  return (
    <div className="group flex items-center gap-2">
      <span className="w-8 shrink-0 text-right text-[10px] text-jarvis-muted">{msToTime(progressMs)}</span>
      <div
        ref={barRef}
        onClick={handleClick}
        className="relative h-1 flex-1 cursor-pointer rounded-full bg-jarvis-border/50 group-hover:h-1.5 transition-all duration-150"
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-jarvis-accent transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-[10px] text-jarvis-muted">{msToTime(durationMs)}</span>
    </div>
  );
}

function TrackRow({ track, onPlay, onAddToQueue }) {
  const img = track?.album?.images?.[2]?.url || track?.album?.images?.[0]?.url;
  const artists = track?.artists?.map(a => a.name).join(', ');
  return (
    <div className="group flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-jarvis-muted/10">
      <button
        onClick={() => onPlay(track.uri)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.98]"
      >
        {img ? (
          <img src={img} alt={track.name} className="h-8 w-8 shrink-0 rounded object-cover border border-jarvis-border/20" />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-jarvis-border/50">
            <Music2 className="h-3.5 w-3.5 text-jarvis-muted" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-jarvis-text group-hover:text-jarvis-accent transition-colors">{track.name}</p>
          <p className="truncate text-[10px] text-jarvis-muted">{artists}</p>
        </div>
      </button>
      {onAddToQueue && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToQueue(track.uri);
          }}
          className="rounded p-1 text-jarvis-muted opacity-0 group-hover:opacity-100 hover:bg-jarvis-border hover:text-jarvis-accent transition-all"
          title="Add to Queue"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function ConnectScreen({ onAuth }) {
  const redirectUri = window.location.origin.includes('localhost')
    ? window.location.origin.replace('localhost', '127.0.0.1') + '/home'
    : window.location.origin + '/home';
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-jarvis-border/50 bg-jarvis-bg/60">
        <Music2 className="h-8 w-8 text-jarvis-accent" />
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-jarvis-text">Connect Spotify</h3>
        <p className="mt-1 text-[12px] text-jarvis-muted leading-relaxed">
          Stream and control music directly from JARVIS
        </p>
      </div>
      <button
        onClick={onAuth}
        className="flex items-center gap-2 rounded-xl bg-[#1DB954] px-5 py-2.5 text-[13px] font-semibold text-black transition-all hover:bg-[#1ed760] hover:scale-[1.02] active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        Connect with Spotify
      </button>

      <div className="w-full rounded-lg border border-jarvis-border/40 bg-jarvis-bg/40 p-2.5 text-left">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-jarvis-accent mb-1">
          Required Redirect URI:
        </p>
        <code className="block select-all break-all rounded bg-black/40 px-1.5 py-1 text-[10px] font-mono text-jarvis-muted leading-tight">
          {redirectUri}
        </code>
        <p className="mt-1.5 text-[9px] text-jarvis-muted/70 leading-normal">
          Register this exact link under <strong>Redirect URIs</strong> in your Spotify Developer App settings, or Spotify will reject the connection.
        </p>
      </div>

      <p className="text-[10px] text-jarvis-muted/60">
        Requires Spotify Premium for playback control
      </p>
    </div>
  );
}

export default function SpotifyPanel() {
  const {
    token, isConnected, isPlaying, currentTrack, progressMs, durationMs,
    volume, searchQuery, searchResults, isSearching, isPanelOpen,
    togglePanel, authenticate, disconnect, initSDK, handleCallback,
    play, pause, next, prev, setVolume, seek, search, clearSearch,
    fetchCurrentPlayback, playlists, isPlaylistsLoading, fetchPlaylists,
    queue, isQueueLoading, fetchQueue, addToQueue, lyrics, isLyricsLoading, fetchLyrics,
    shuffle, toggleShuffle,
  } = useSpotifyStore();

  const [localSearch, setLocalSearch] = useState('');
  const [activeTab, setActiveTab] = useState('playlists'); // 'playlists' | 'queue' | 'lyrics'
  const searchTimeout = useRef(null);

  // On mount: process PKCE callback (if redirected from Spotify) then init SDK
  useEffect(() => {
    const initSpotify = async () => {
      await handleCallback();
      let t = useSpotifyStore.getState().token;
      
      // If access token is expired or missing but we have a refresh token, auto-refresh!
      if (!t && localStorage.getItem('jarvis_spotify_refresh')) {
        console.log('[Spotify] Access token missing or expired. Attempting automatic refresh...');
        t = await useSpotifyStore.getState().refreshToken();
      }

      if (t) {
        initSDK();
        fetchCurrentPlayback();
        fetchPlaylists();
        useSpotifyStore.getState().fetchQueue();
      }
    };

    initSpotify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch playlists when token changes
  useEffect(() => {
    if (token) {
      fetchPlaylists();
    }
  }, [token, fetchPlaylists]);

  // Fetch queue and lyrics when currently playing track changes
  useEffect(() => {
    if (token && currentTrack?.id) {
      fetchQueue();
    }
  }, [currentTrack?.id, token, fetchQueue]);

  useEffect(() => {
    if (currentTrack?.name) {
      const artist = currentTrack.artists?.[0]?.name || '';
      fetchLyrics(artist, currentTrack.name);
    }
  }, [currentTrack?.id, currentTrack?.name, fetchLyrics]);

  // Poll playback every 5 seconds when panel is open
  useEffect(() => {
    if (!isPanelOpen || !token) return;
    const interval = setInterval(() => fetchCurrentPlayback(), 5000);
    return () => clearInterval(interval);
  }, [isPanelOpen, token, fetchCurrentPlayback]);

  const handleSearch = useCallback((q) => {
    setLocalSearch(q);
    clearTimeout(searchTimeout.current);
    if (!q.trim()) { clearSearch(); return; }
    searchTimeout.current = setTimeout(() => search(q), 400);
  }, [search, clearSearch]);

  const trackName = currentTrack?.name || 'Nothing playing';
  const trackArtist = currentTrack?.artists?.map(a => a.name).join(', ') || '';
  const albumArt = currentTrack?.album?.images?.[1]?.url || currentTrack?.album?.images?.[0]?.url;

  const showSearch = localSearch.length > 0 || searchResults.length > 0;

  return (
    <>
      {/* Tab trigger — always visible on right edge */}
      <button
        id="spotify-tab-trigger"
        onClick={togglePanel}
        className={`fixed right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-l-xl border border-r-0 border-jarvis-border/60 bg-jarvis-panel/90 px-2 py-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-jarvis-panel ${
          isPanelOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Open Spotify player"
      >
        <Music2 className={`h-4 w-4 ${token ? 'text-[#1DB954]' : 'text-jarvis-muted'}`} />
        {isPlaying && (
          <div className="flex flex-col gap-0.5">
            {[3, 5, 4, 6, 3].map((h, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full bg-[#1DB954]"
                style={{
                  height: `${h}px`,
                  animation: `equalizer 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                }}
              />
            ))}
          </div>
        )}
        <ChevronRight className="h-3 w-3 text-jarvis-muted rotate-180" />
      </button>

      {/* Side Panel */}
      <div
        className={`fixed right-0 top-0 z-40 flex h-full w-[300px] flex-col border-l border-jarvis-border/60 bg-jarvis-panel/95 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform duration-300 ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Gradient top */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#1DB954]/40 to-transparent" />

        {/* Panel Header */}
        <div className="flex shrink-0 items-center justify-between px-4 py-3.5 border-b border-jarvis-border/40">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#1DB954]">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="text-[13px] font-semibold text-jarvis-text">Spotify</span>
            {isConnected && (
              <span className="rounded-full bg-[#1DB954]/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#1DB954]">
                Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {token && (
              <button
                onClick={disconnect}
                className="rounded-md p-1.5 text-jarvis-muted transition-colors hover:bg-jarvis-muted/10 hover:text-jarvis-text"
                title="Disconnect"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={togglePanel}
              className="rounded-md p-1.5 text-jarvis-muted transition-colors hover:bg-jarvis-muted/10 hover:text-jarvis-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!token ? (
          <ConnectScreen onAuth={authenticate} />
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Now Playing */}
            <div className="shrink-0 px-4 pt-4 pb-3">
              {/* Album Art */}
              <div className="relative mb-4 overflow-hidden rounded-xl aspect-square w-full border border-jarvis-border/30 bg-jarvis-bg/40">
                {albumArt ? (
                  <img
                    src={albumArt}
                    alt={trackName}
                    className="h-full w-full object-cover transition-all duration-500"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Music2 className="h-12 w-12 text-jarvis-muted/30" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                )}
              </div>

              {/* Track Info */}
              <div className="mb-3">
                <p className="truncate text-[15px] font-semibold text-jarvis-text">{trackName}</p>
                <p className="truncate text-[12px] text-jarvis-muted">{trackArtist}</p>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <ProgressBar progressMs={progressMs} durationMs={durationMs} onSeek={seek} />
              </div>

              {/* Controls */}
              <div className="mb-3 flex items-center justify-center gap-4">
                <button
                  onClick={toggleShuffle}
                  className={`rounded-full p-2 transition-all hover:bg-jarvis-muted/10 active:scale-90 ${
                    shuffle ? 'text-[#1DB954]' : 'text-jarvis-muted hover:text-jarvis-text'
                  }`}
                  title="Toggle Shuffle"
                >
                  <Shuffle className="h-4 w-4" />
                </button>
                <button
                  onClick={prev}
                  className="rounded-full p-2 text-jarvis-muted transition-all hover:bg-jarvis-muted/10 hover:text-jarvis-text active:scale-90"
                >
                  <SkipBack className="h-5 w-5" />
                </button>
                <button
                  onClick={isPlaying ? pause : () => play()}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
                </button>
                <button
                  onClick={next}
                  className="rounded-full p-2 text-jarvis-muted transition-all hover:bg-jarvis-muted/10 hover:text-jarvis-text active:scale-90"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVolume(volume === 0 ? 50 : 0)}
                  className="text-jarvis-muted transition-colors hover:text-jarvis-text"
                >
                  {volume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-jarvis-border/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
                <span className="w-6 text-right text-[10px] text-jarvis-muted">{volume}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-4 h-px bg-jarvis-border/30" />

            {/* Search */}
            <div className="shrink-0 px-4 pt-3 pb-2">
              <div className="flex items-center gap-2 rounded-lg border border-jarvis-border/50 bg-jarvis-bg/50 px-3 py-2 focus-within:border-jarvis-accent/40">
                {isSearching ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-jarvis-muted" />
                ) : (
                  <Search className="h-3.5 w-3.5 shrink-0 text-jarvis-muted" />
                )}
                <input
                  type="text"
                  value={localSearch}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search songs..."
                  className="flex-1 bg-transparent text-[13px] text-jarvis-text placeholder:text-jarvis-muted/50 focus:outline-none"
                />
                {localSearch && (
                  <button onClick={() => { setLocalSearch(''); clearSearch(); }}>
                    <X className="h-3 w-3 text-jarvis-muted" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results / Tabs / Scrollable */}
            {!showSearch && (
              <div className="flex border-b border-jarvis-border/30 px-3 py-1 gap-2 shrink-0">
                {['playlists', 'queue', 'lyrics'].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all border-b-2 ${
                      activeTab === t
                        ? 'border-jarvis-accent text-jarvis-accent'
                        : 'border-transparent text-jarvis-muted hover:text-jarvis-text'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-2 pb-4 pt-2">
              {showSearch ? (
                <>
                  {searchResults.length === 0 && !isSearching && localSearch && (
                    <p className="px-2 py-4 text-center text-[12px] text-jarvis-muted">No results for "{localSearch}"</p>
                  )}
                  {searchResults.map(track => (
                    <TrackRow key={track.id} track={track} onPlay={play} onAddToQueue={addToQueue} />
                  ))}
                </>
              ) : activeTab === 'playlists' ? (
                <div className="space-y-3 px-1">
                  <div className="flex items-center justify-between px-1.5 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-jarvis-muted/80">Your Playlists</span>
                    {isPlaylistsLoading && <Loader2 className="h-3 w-3 animate-spin text-jarvis-muted" />}
                  </div>

                  {playlists.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <Music2 className="h-5 w-5 text-jarvis-muted/30" />
                      <p className="text-[11px] text-jarvis-muted/50">No playlists found or loading...</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {playlists.map(pl => {
                        const img = pl.images?.[2]?.url || pl.images?.[0]?.url;
                        return (
                          <button
                            key={pl.id}
                            onClick={() => play(pl.uri)}
                            className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-jarvis-muted/10 active:scale-[0.98] group"
                          >
                            {img ? (
                              <img src={img} alt={pl.name} className="h-8 w-8 shrink-0 rounded object-cover border border-jarvis-border/20" />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-jarvis-border/50">
                                <Music2 className="h-3.5 w-3.5 text-jarvis-muted" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-medium text-jarvis-text group-hover:text-jarvis-accent transition-colors">{pl.name}</p>
                              <p className="truncate text-[10px] text-jarvis-muted">{pl.tracks?.total || 0} tracks</p>
                            </div>
                            <Play className="h-3 w-3 shrink-0 text-jarvis-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : activeTab === 'queue' ? (
                <div className="space-y-3 px-1">
                  <div className="flex items-center justify-between px-1.5 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-jarvis-muted/80">Play Queue</span>
                    {isQueueLoading && <Loader2 className="h-3 w-3 animate-spin text-jarvis-muted" />}
                  </div>

                  {queue.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <ListMusic className="h-5 w-5 text-jarvis-muted/30" />
                      <p className="text-[11px] text-jarvis-muted/50">Queue is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {queue.map((qTrack, idx) => {
                        const img = qTrack.album?.images?.[2]?.url || qTrack.album?.images?.[0]?.url;
                        return (
                          <div key={`${qTrack.id}-${idx}`} className="flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left">
                            <div className="text-[10px] text-jarvis-muted font-mono w-4 text-right">
                              {idx + 1}
                            </div>
                            {img ? (
                              <img src={img} alt={qTrack.name} className="h-7 w-7 shrink-0 rounded object-cover" />
                            ) : (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-jarvis-border/50">
                                <Music2 className="h-3 w-3 text-jarvis-muted" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-medium text-jarvis-text">{qTrack.name}</p>
                              <p className="truncate text-[10px] text-jarvis-muted">
                                {qTrack.artists?.map(a => a.name).join(', ')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 px-1">
                  <div className="flex items-center justify-between px-1.5 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-jarvis-muted/80">Lyrics</span>
                    {isLyricsLoading && <Loader2 className="h-3 w-3 animate-spin text-jarvis-muted" />}
                  </div>

                  {isLyricsLoading ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <Loader2 className="h-5 w-5 animate-spin text-jarvis-accent" />
                      <p className="text-[11px] text-jarvis-muted/70">Searching lyrics database...</p>
                    </div>
                  ) : lyrics ? (
                    <div className="px-2 py-1 select-text">
                      <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed text-jarvis-text/90 text-center select-text max-h-[300px] overflow-y-auto">
                        {lyrics}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <FileText className="h-5 w-5 text-jarvis-muted/30" />
                      <p className="text-[11px] text-jarvis-muted/50">No lyrics loaded. Start playing a track!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom glow */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#1DB954]/20 to-transparent" />
      </div>

      {/* Equalizer animation CSS */}
      <style>{`
        @keyframes equalizer {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </>
  );
}
