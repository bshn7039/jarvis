export function safeParse(value, fallback = null) {
  if (value == null || value === '') return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function clamp(value, min, max, fallback = min) {
  if (!isFiniteNumber(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function resetCorruptState(storageKey) {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}
