import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { canvasModules } from '../config/canvasModules';
import {
  databaseTree as initialDatabaseTree,
  findNodeInTree,
  setNodeCheckedInTree,
  toggleTreeExpanded as toggleTreeExpandedInTree,
} from '../data/databaseTree';
import { defaultSchedule, defaultGoalsTree } from '../data/mockCommandData';
import { buildVisibilityMap } from '../utils/fieldVisibility';
import { deepClone } from '../utils/deepClone';
import { createSafeLocalStorage, clearPersistedUi } from '../utils/persistStorage';
import {
  STORAGE_KEY,
  PERSIST_VERSION,
  sanitizeUi,
  sanitizeZoom,
  sanitizePan,
  sanitizePosition,
  sanitizePersistedPayload,
  sanitizeModules,
  sanitizeDatabaseTree,
  sanitizeModuleFieldExpanded,
  sanitizeCommandCenter,
  canvasViewNeedsReset,
} from '../utils/safePersist';

const initialModules = canvasModules;

function buildModulesState() {
  return Object.fromEntries(
    initialModules.map((module) => [
      module.id,
      {
        position: { ...module.position },
        visible: module.visible,
        collapsed: false,
      },
    ]),
  );
}

function buildDefaultModuleFieldExpanded(modules) {
  const expanded = {};
  modules.forEach((module) => {
    expanded[`${module.id}:module`] = true;
  });
  return expanded;
}

const defaultCommand = {
  goalsTree: deepClone(defaultGoalsTree),
  schedule: deepClone(defaultSchedule),
  collapsedSections: {
    'command:tasks': true,
    'command:goals': true,
    'command:schedule': true,
    'goals:main': true,
    'goals:phase': true,
  },
  widgetVisibility: {},
  widgetLayout: {},
};

export function resetPersistedUiState() {
  clearPersistedUi();
  const defaults = buildModulesState();
  useUiStore.setState({
    ui: sanitizeUi({
      sidebarCollapsed: false,
      canvasZoom: 1,
      canvasPositionX: 0,
      canvasPositionY: 0,
    }),
    modules: defaults,
    treeExpansion: {},
    treeChecked: {},
    moduleFieldExpanded: buildDefaultModuleFieldExpanded(initialModules),
    commandCenter: deepClone(defaultCommand),
  });
}

export const useUiStore = create(
  persist(
    (set, get) => ({
      ui: sanitizeUi({
        sidebarCollapsed: false,
        canvasZoom: 1,
        canvasPositionX: 0,
        canvasPositionY: 0,
      }),
      modules: buildModulesState(),
      treeExpansion: {},
      treeChecked: {},
      moduleFieldExpanded: buildDefaultModuleFieldExpanded(initialModules),

      commandCenter: deepClone(defaultCommand),

      toggleSidebarCollapsed: () =>
        set((state) => ({
          ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
        })),

      setSidebarCollapsed: (collapsed) =>
        set((state) => ({
          ui: { ...state.ui, sidebarCollapsed: Boolean(collapsed) },
        })),

      setCanvasView: ({ scale, positionX, positionY }) => {
        const nextUi = sanitizeUi({
          ...get().ui,
          ...(scale !== undefined && { canvasZoom: scale }),
          ...(positionX !== undefined && { canvasPositionX: positionX }),
          ...(positionY !== undefined && { canvasPositionY: positionY }),
        });

        const prev = get().ui;
        const unchanged =
          prev.canvasZoom === nextUi.canvasZoom &&
          prev.canvasPositionX === nextUi.canvasPositionX &&
          prev.canvasPositionY === nextUi.canvasPositionY;

        if (unchanged) return;
        set({ ui: nextUi });
      },

      resetCanvasView: () =>
        set((state) => ({
          ui: sanitizeUi({
            ...state.ui,
            canvasZoom: 1,
            canvasPositionX: 0,
            canvasPositionY: 0,
          }),
        })),

      updateModulePosition: (moduleId, x, y) => {
        const base = initialModules.find((m) => m.id === moduleId);
        const position = sanitizePosition(
          { x, y },
          base?.position ?? { x: 300, y: 200 },
        );

        set((state) => ({
          modules: {
            ...state.modules,
            [moduleId]: {
              ...state.modules[moduleId],
              position,
            },
          },
        }));
      },

      setModuleCollapsed: (moduleId, collapsed) =>
        set((state) => ({
          modules: {
            ...state.modules,
            [moduleId]: { ...state.modules[moduleId], collapsed: Boolean(collapsed) },
          },
        })),

      toggleModuleCollapsed: (moduleId) =>
        set((state) => ({
          modules: {
            ...state.modules,
            [moduleId]: {
              ...state.modules[moduleId],
              collapsed: !state.modules[moduleId]?.collapsed,
            },
          },
        })),

      setModuleVisibility: (moduleId, visible) => {
        set((state) => ({
          modules: {
            ...state.modules,
            [moduleId]: { ...state.modules[moduleId], visible: Boolean(visible) },
          },
          treeChecked: {
            ...state.treeChecked,
            [moduleId]: Boolean(visible),
          },
        }));
      },

      toggleModuleVisibility: (moduleId) => {
        const module = get().modules[moduleId];
        if (module) {
          get().setModuleVisibility(moduleId, !module.visible);
        }
      },

      toggleTreeCheck: (path) => {
        const current = get().treeChecked[path] !== false;
        const next = !current;
        
        const node = findNodeInTree(initialDatabaseTree, path);
        if (!node) return;

        const newCheckedMap = { ...get().treeChecked };
        
        const walk = (n) => {
          newCheckedMap[n.id] = next;
          if (n.children) n.children.forEach(walk);
        };
        
        walk(node);

        set({ treeChecked: newCheckedMap });

        // If it's a top-level module, sync with modules state
        if (initialModules.some(m => m.id === path)) {
          get().setModuleVisibility(path, next);
        }
      },

      toggleTreeExpand: (path) =>
        set((state) => ({
          treeExpansion: {
            ...state.treeExpansion,
            [path]: !state.treeExpansion[path],
          },
        })),

      setModuleFieldExpanded: (moduleId, nodeId, expanded) =>
        set((state) => ({
          moduleFieldExpanded: {
            ...state.moduleFieldExpanded,
            [`${moduleId}:${nodeId}`]: Boolean(expanded),
          },
        })),

      toggleModuleFieldExpanded: (moduleId, nodeId) => {
        const key = `${moduleId}:${nodeId}`;
        const current = get().moduleFieldExpanded[key] ?? true;
        get().setModuleFieldExpanded(moduleId, nodeId, !current);
      },

      isModuleFieldExpanded: (moduleId, nodeId) => {
        const key = `${moduleId}:${nodeId}`;
        const value = get().moduleFieldExpanded[key];
        return value !== undefined ? value : true;
      },

      toggleCommandExpanded: (key) =>
        set((state) => ({
          commandCenter: {
            ...state.commandCenter,
            collapsedSections: {
              ...state.commandCenter.collapsedSections,
              [key]: !state.commandCenter.collapsedSections[key],
            },
          },
        })),

      isCommandExpanded: (key) => get().commandCenter.collapsedSections[key] ?? false,

      setCommandSchedule: (schedule) =>
        set((state) => ({
          commandCenter: {
            ...state.commandCenter,
            schedule: Array.isArray(schedule) ? schedule : state.commandCenter.schedule,
          },
        })),
      setCommandGoalsTree: (goalsTree) =>
        set((state) => ({
          commandCenter: {
            ...state.commandCenter,
            goalsTree:
              goalsTree && typeof goalsTree === 'object'
                ? goalsTree
                : state.commandCenter.goalsTree,
          },
        })),
      setCommandWidgetVisibility: (widgetId, visible) =>
        set((state) => ({
          commandCenter: {
            ...state.commandCenter,
            widgetVisibility: {
              ...state.commandCenter.widgetVisibility,
              [widgetId]: Boolean(visible),
            },
          },
        })),
      setCommandWidgetLayoutPref: (prefId, enabled) =>
        set((state) => ({
          commandCenter: {
            ...state.commandCenter,
            widgetLayout: {
              ...state.commandCenter.widgetLayout,
              [prefId]: Boolean(enabled),
            },
          },
        })),
    }),
    {
      name: STORAGE_KEY,
      version: PERSIST_VERSION,
      storage: createSafeLocalStorage(),
      partialize: (state) => ({
        ui: state.ui,
        modules: state.modules,
        treeExpansion: state.treeExpansion,
        treeChecked: state.treeChecked,
        moduleFieldExpanded: state.moduleFieldExpanded,
        commandCenter: state.commandCenter,
      }),
      migrate: (persisted, version) => {
        if (!persisted || version < PERSIST_VERSION) {
          if (import.meta.env.DEV && persisted) {
            console.warn('[jarvis] migrating persisted state to version', PERSIST_VERSION);
          }
        }
        return persisted;
      },
      merge: (persisted, current) => {
        const raw = persisted?.state ?? persisted;
        const hadInvalidCanvas = raw?.ui && canvasViewNeedsReset(raw.ui);

        const sanitized = sanitizePersistedPayload(
          { state: raw },
          {
            ...current,
            modules: buildModulesState(),
            treeExpansion: {},
            treeChecked: {},
            moduleFieldExpanded: buildDefaultModuleFieldExpanded(initialModules),
            commandCenter: deepClone(defaultCommand),
          },
          initialModules,
        );

        if (!sanitized) {
          if (import.meta.env.DEV) {
            console.warn('[jarvis] persisted state unusable, using defaults');
          }
          clearPersistedUi();
          return current;
        }

        if (hadInvalidCanvas && import.meta.env.DEV) {
          console.warn('[jarvis] reset invalid canvas transform values');
        }

        return {
          ...current,
          ui: sanitized.ui,
          modules: sanitized.modules,
          treeExpansion: sanitized.treeExpansion || {},
          treeChecked: sanitized.treeChecked || {},
          moduleFieldExpanded: sanitized.moduleFieldExpanded,
          commandCenter: sanitized.commandCenter,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          if (import.meta.env.DEV) {
            console.warn('[jarvis] rehydration error, resetting persisted UI', error);
          }
          clearPersistedUi();
          resetPersistedUiState();
          return;
        }

        if (state?.ui && canvasViewNeedsReset(state.ui)) {
          useUiStore.setState({
            ui: sanitizeUi({
              ...state.ui,
              canvasZoom: 1,
              canvasPositionX: 0,
              canvasPositionY: 0,
            }),
          });
        }
      },
    },
  ),
);

useUiStore.persist.onFinishHydration(() => {
  const state = useUiStore.getState();
  const fixedUi = sanitizeUi(state.ui);
  if (
    fixedUi.canvasZoom !== state.ui.canvasZoom ||
    fixedUi.canvasPositionX !== state.ui.canvasPositionX ||
    fixedUi.canvasPositionY !== state.ui.canvasPositionY
  ) {
    useUiStore.setState({ ui: fixedUi });
  }
});

export function selectSafeCanvasView(state) {
  return {
    scale: sanitizeZoom(state.ui?.canvasZoom),
    positionX: sanitizePan(state.ui?.canvasPositionX),
    positionY: sanitizePan(state.ui?.canvasPositionY),
  };
}

export function getEnrichedModules(state) {
  return initialModules.map((base) => {
    const saved = state.modules?.[base.id];
    return {
      ...base,
      position: sanitizePosition(saved?.position, base.position),
      visible: typeof saved?.visible === 'boolean' ? saved.visible : base.visible,
      collapsed: Boolean(saved?.collapsed),
    };
  });
}

export function getVisibleModules(state) {
  return getEnrichedModules(state).filter((module) => module.visible);
}

export function useCanvasSelectors() {
  const modules = useUiStore(getEnrichedModules);
  const visibleModules = useUiStore(getVisibleModules);
  const treeExpansion = useUiStore((s) => s.treeExpansion);
  const treeChecked = useUiStore((s) => s.treeChecked);

  return { 
    modules, 
    visibleModules, 
    databaseTree: initialDatabaseTree,
    treeExpansion,
    treeChecked
  };
}
