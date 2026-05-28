import { create } from 'zustand';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = (() => {
  const origin = window.location.origin;
  if (origin.includes('localhost')) {
    return origin.replace('localhost', '127.0.0.1') + '/home';
  }
  return origin + '/home';
})();
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ');

// ── PKCE helpers ──────────────────────────────────────────────────────────────
async function generateCodeVerifier(length = 64) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values).map(x => possible[x % possible.length]).join('');
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ── Token persistence ─────────────────────────────────────────────────────────
function getStoredToken() {
  try {
    const raw = localStorage.getItem('jarvis_spotify_token');
    if (!raw) return null;
    const { access_token, expires_at } = JSON.parse(raw);
    if (Date.now() > expires_at) {
      localStorage.removeItem('jarvis_spotify_token');
      return null;
    }
    return access_token;
  } catch { return null; }
}

function saveToken(access_token, expires_in) {
  const expires_at = Date.now() + expires_in * 1000 - 60_000; // 1 min buffer
  localStorage.setItem('jarvis_spotify_token', JSON.stringify({ access_token, expires_at }));
}

// ── Spotify Web API fetch ─────────────────────────────────────────────────────
async function spotifyFetch(path, token, options = {}) {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (res.status === 204 || res.status === 202 || res.status === 200 && res.headers.get('content-length') === '0') return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Spotify ${res.status}`);
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

export const useSpotifyStore = create((set, get) => ({
  token: getStoredToken(),
  isConnected: false,
  deviceId: null,
  player: null,

  // Playback
  isPlaying: false,
  currentTrack: null,
  progressMs: 0,
  durationMs: 0,
  volume: 50,
  shuffle: false,

  // UI
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  isPanelOpen: false,
  isSDKReady: false,

  // Playlists
  playlists: [],
  isPlaylistsLoading: false,

  // Queue
  queue: [],
  isQueueLoading: false,

  // Lyrics
  lyrics: null,
  isLyricsLoading: false,

  togglePanel: () => set(s => ({ isPanelOpen: !s.isPanelOpen })),
  openPanel:   () => set({ isPanelOpen: true }),
  closePanel:  () => set({ isPanelOpen: false }),

  // ── PKCE Auth ───────────────────────────────────────────────────────────────
  authenticate: async () => {
    const verifier = await generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    sessionStorage.setItem('spotify_code_verifier', verifier);

    const params = new URLSearchParams({
      response_type:         'code',
      client_id:             CLIENT_ID,
      redirect_uri:          REDIRECT_URI,
      scope:                 SCOPES,
      code_challenge_method: 'S256',
      code_challenge:        challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  },

  // Call this once on home page mount — processes the ?code= callback
  handleCallback: async () => {
    const params  = new URLSearchParams(window.location.search);
    const code    = params.get('code');
    const verifier = sessionStorage.getItem('spotify_code_verifier');
    if (!code || !verifier) return;

    // Immediately clean up URL and verifier
    window.history.replaceState({}, '', window.location.pathname);
    sessionStorage.removeItem('spotify_code_verifier');

    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'authorization_code',
          code,
          redirect_uri:  REDIRECT_URI,
          client_id:     CLIENT_ID,
          code_verifier: verifier,
        }),
      });
      const data = await res.json();
      if (data.access_token) {
        saveToken(data.access_token, data.expires_in);
        if (data.refresh_token) {
          localStorage.setItem('jarvis_spotify_refresh', data.refresh_token);
        }
        set({ token: data.access_token });
      } else {
        console.error('[Spotify] Token exchange error:', data);
      }
    } catch (err) {
      console.error('[Spotify] Token exchange failed:', err);
    }
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('jarvis_spotify_refresh');
    if (!refreshToken) return null;
    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'refresh_token',
          refresh_token: refreshToken,
          client_id:     CLIENT_ID,
        }),
      });
      const data = await res.json();
      if (data.access_token) {
        saveToken(data.access_token, data.expires_in);
        if (data.refresh_token) localStorage.setItem('jarvis_spotify_refresh', data.refresh_token);
        set({ token: data.access_token });
        return data.access_token;
      }
    } catch (err) {
      console.error('[Spotify] Refresh failed:', err);
    }
    return null;
  },

  disconnect: () => {
    localStorage.removeItem('jarvis_spotify_token');
    localStorage.removeItem('jarvis_spotify_refresh');
    const { player } = get();
    if (player) try { player.disconnect(); } catch {}
    set({ token: null, isConnected: false, deviceId: null, player: null,
          isPlaying: false, currentTrack: null, isSDKReady: false });
  },

  // ── Web Playback SDK ─────────────────────────────────────────────────────────
  initSDK: () => {
    const token = get().token;
    if (!token || get().isSDKReady) return;

    if (!document.getElementById('spotify-sdk')) {
      const s = document.createElement('script');
      s.id = 'spotify-sdk';
      s.src = 'https://sdk.scdn.co/spotify-player.js';
      s.async = true;
      document.body.appendChild(s);
    }

    const setupPlayer = () => {
      const player = new window.Spotify.Player({
        name: 'JARVIS Player',
        getOAuthToken: cb => cb(get().token),
        volume: get().volume / 100,
      });

      player.addListener('ready', ({ device_id }) => {
        set({ deviceId: device_id, isConnected: true, isSDKReady: true });
        spotifyFetch('/me/player', get().token, {
          method: 'PUT',
          body: JSON.stringify({ device_ids: [device_id], play: false }),
        }).catch(() => {});
      });

      player.addListener('not_ready', () => set({ isConnected: false }));

      player.addListener('player_state_changed', state => {
        if (!state) return;
        set({
          isPlaying: !state.paused,
          currentTrack: state.track_window?.current_track || null,
          progressMs: state.position,
          durationMs: state.duration,
          shuffle: state.shuffle ?? get().shuffle,
        });
      });

      player.addListener('authentication_error', () => get().disconnect());

      player.connect();
      set({ player });
    };

    if (window.Spotify) {
      setupPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = setupPlayer;
    }
  },

  // ── Playback controls ─────────────────────────────────────────────────────────
  play: async (uri) => {
    const { token, deviceId } = get();
    if (!token) return;
    const body = uri
      ? (uri.includes('track') ? { uris: [uri] } : { context_uri: uri })
      : undefined;
    await spotifyFetch(
      `/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`,
      token,
      { method: 'PUT', body: body ? JSON.stringify(body) : undefined }
    ).catch(e => console.warn('[Spotify] play:', e));
    set({ isPlaying: true });
  },

  pause: async () => {
    const { token } = get();
    if (!token) return;
    await spotifyFetch('/me/player/pause', token, { method: 'PUT' }).catch(() => {});
    set({ isPlaying: false });
  },

  next: async () => {
    const { token } = get();
    if (!token) return;
    await spotifyFetch('/me/player/next', token, { method: 'POST' }).catch(() => {});
  },

  prev: async () => {
    const { token } = get();
    if (!token) return;
    await spotifyFetch('/me/player/previous', token, { method: 'POST' }).catch(() => {});
  },

  setVolume: async (pct) => {
    const { token, player } = get();
    set({ volume: pct });
    if (player) player.setVolume(pct / 100).catch(() => {});
    if (token) spotifyFetch(`/me/player/volume?volume_percent=${pct}`, token, { method: 'PUT' }).catch(() => {});
  },

  seek: async (positionMs) => {
    const { token } = get();
    if (!token) return;
    await spotifyFetch(`/me/player/seek?position_ms=${positionMs}`, token, { method: 'PUT' }).catch(() => {});
    set({ progressMs: positionMs });
  },

  search: async (query) => {
    const { token } = get();
    if (!token || !query.trim()) { set({ searchResults: [] }); return; }
    set({ isSearching: true });
    try {
      const data = await spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=track&limit=8`, token);
      set({ searchResults: data?.tracks?.items || [], isSearching: false });
    } catch { set({ isSearching: false }); }
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [] }),

  fetchCurrentPlayback: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const data = await spotifyFetch('/me/player', token);
      if (data) {
        set({
          currentTrack: data.item ? {
            name: data.item.name,
            artists: data.item.artists,
            album: data.item.album,
            uri: data.item.uri,
            id: data.item.id,
          } : null,
          isPlaying: data.is_playing,
          progressMs: data.progress_ms,
          durationMs: data.item?.duration_ms || 0,
          shuffle: data.shuffle_state,
        });
      }
    } catch {}
  },

  fetchPlaylists: async () => {
    const { token } = get();
    if (!token) return;
    set({ isPlaylistsLoading: true });
    try {
      const data = await spotifyFetch('/me/playlists?limit=20', token);
      set({ playlists: data?.items || [], isPlaylistsLoading: false });
    } catch (e) {
      console.warn('[Spotify] fetchPlaylists failed:', e);
      set({ isPlaylistsLoading: false });
    }
  },

  fetchQueue: async () => {
    const { token } = get();
    if (!token) return;
    set({ isQueueLoading: true });
    try {
      const data = await spotifyFetch('/me/player/queue', token);
      set({ queue: data?.queue || [], isQueueLoading: false });
    } catch (e) {
      console.warn('[Spotify] fetchQueue failed:', e);
      set({ isQueueLoading: false });
    }
  },

  addToQueue: async (uri) => {
    const { token } = get();
    if (!token) return;
    try {
      await spotifyFetch(`/me/player/queue?uri=${encodeURIComponent(uri)}`, token, {
        method: 'POST',
      });
      await get().fetchQueue();
    } catch (e) {
      console.warn('[Spotify] addToQueue failed:', e);
    }
  },

  fetchLyrics: async (artist, title) => {
    if (!artist || !title) { set({ lyrics: null }); return; }
    set({ isLyricsLoading: true, lyrics: null });
    try {
      const cleanArtist = artist.split(',')[0].replace(/\(.*?\)/g, '').trim();
      const cleanTitle = title.replace(/\(.*?\)/g, '').split('-')[0].trim();
      
      const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`);
      if (res.ok) {
        const data = await res.json();
        set({ lyrics: data.lyrics || 'Instrumental or no lyrics available.', isLyricsLoading: false });
      } else {
        set({ lyrics: 'No lyrics found for this song.', isLyricsLoading: false });
      }
    } catch (e) {
      set({ lyrics: 'Failed to fetch lyrics.', isLyricsLoading: false });
    }
  },

  toggleShuffle: async () => {
    const { token, shuffle } = get();
    if (!token) return;
    const newState = !shuffle;
    try {
      await spotifyFetch(`/me/player/shuffle?state=${newState}`, token, { method: 'PUT' });
      set({ shuffle: newState });
    } catch (e) {
      console.warn('[Spotify] toggleShuffle failed:', e);
    }
  },
}));
