import { deepClone } from './deepClone';

export const STORAGE_KEY = 'jarvis-ui-storage';
export const PERSIST_VERSION = 2;

export const CANVAS_ZOOM_MIN = 0.5;
export const CANVAS_ZOOM_MAX = 2;
export const CANVAS_PAN_MAX = 8000;
export const DEFAULT_MODULE_POSITION = { x: 300, y: 200 };

const devWarn = (message, value) => {
  if (import.meta.env.DEV) {
    console.warn(`[jarvis] ${message}`, value);
  }
};

export function safeParseJson(value, fallback = null) {
  if (value == null || value === '') return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch (error) {
    devWarn('failed to parse persisted JSON', error);
    return fallback;
  }
}

export function sanitizeZoom(value, fallback = 1) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    devWarn('invalid canvas zoom, using default', value);
    return fallback;
  }
  return Math.min(CANVAS_ZOOM_MAX, Math.max(CANVAS_ZOOM_MIN, value));
}

export function sanitizePan(value, fallback = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    devWarn('invalid canvas pan, using default', value);
    return fallback;
  }
  return Math.min(CANVAS_PAN_MAX, Math.max(-CANVAS_PAN_MAX, value));
}

export function sanitizeModuleCoord(value, fallback) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(10000, Math.max(-500, Math.round(value)));
}

export function sanitizePosition(position, fallback = DEFAULT_MODULE_POSITION) {
  const base = fallback ?? DEFAULT_MODULE_POSITION;
  return {
    x: sanitizeModuleCoord(position?.x, base.x),
    y: sanitizeModuleCoord(position?.y, base.y),
  };
}

export function sanitizeUi(ui = {}) {
  return {
    sidebarCollapsed: Boolean(ui.sidebarCollapsed),
    canvasZoom: sanitizeZoom(ui.canvasZoom),
    canvasPositionX: sanitizePan(ui.canvasPositionX),
    canvasPositionY: sanitizePan(ui.canvasPositionY),
  };
}

export function isValidDatabaseTree(tree) {
  const isValidNode = (node) => {
    if (!node || typeof node !== 'object' || typeof node.id !== 'string') return false;
    if (node.children === undefined) return true;
    if (!Array.isArray(node.children)) return false;
    return node.children.every(isValidNode);
  };

  return Array.isArray(tree) && tree.length > 0 && tree.every(isValidNode);
}

export function sanitizeDatabaseTree(tree, fallback) {
  if (!isValidDatabaseTree(tree)) {
    devWarn('invalid database tree, using defaults', tree);
    return deepClone(fallback);
  }
  return tree;
}

export function sanitizeModules(persistedModules, baseModules, initialModules) {
  const result = { ...baseModules };

  initialModules.forEach((module) => {
    const saved = persistedModules?.[module.id];
    const base = baseModules[module.id];
    if (!saved || typeof saved !== 'object') return;

    result[module.id] = {
      position: sanitizePosition(saved.position, module.position ?? DEFAULT_MODULE_POSITION),
      visible: typeof saved.visible === 'boolean' ? saved.visible : base.visible,
      collapsed: Boolean(saved.collapsed),
    };
  });

  return result;
}

export function sanitizeModuleFieldExpanded(expanded, defaults) {
  if (!expanded || typeof expanded !== 'object') return defaults;
  const result = { ...defaults };
  Object.entries(expanded).forEach(([key, value]) => {
    if (typeof key === 'string' && typeof value === 'boolean') {
      result[key] = value;
    }
  });
  return result;
}

export function sanitizeCommand(command, defaults) {
  const schedule = Array.isArray(command?.schedule)
    ? command.schedule.filter((item) => item && typeof item.id === 'string')
    : defaults.schedule;

  const expanded =
    command?.expanded && typeof command.expanded === 'object'
      ? { ...defaults.expanded, ...command.expanded }
      : defaults.expanded;

  return { schedule, expanded };
}

export function sanitizePersistedPayload(persisted, current, initialModules = []) {
  if (!persisted || typeof persisted !== 'object') return null;

  const state = persisted.state ?? persisted;
  if (!state || typeof state !== 'object') return null;

  return {
    ui: sanitizeUi({ ...current.ui, ...state.ui }),
    modules: sanitizeModules(state.modules, current.modules, initialModules),
    databaseTree: sanitizeDatabaseTree(state.databaseTree, current.databaseTree),
    moduleFieldExpanded: sanitizeModuleFieldExpanded(
      state.moduleFieldExpanded,
      current.moduleFieldExpanded,
    ),
    command: sanitizeCommand(state.command, current.command),
  };
}

export function canvasViewNeedsReset(ui) {
  const zoom = ui?.canvasZoom;
  const x = ui?.canvasPositionX;
  const y = ui?.canvasPositionY;
  return (
    (zoom !== undefined && (typeof zoom !== 'number' || !Number.isFinite(zoom))) ||
    (x !== undefined && (typeof x !== 'number' || !Number.isFinite(x))) ||
    (y !== undefined && (typeof y !== 'number' || !Number.isFinite(y)))
  );
}
