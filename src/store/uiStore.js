import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createInitialModules } from '../data/mockModules';
import {
  initialDatabaseTree,
  findNodeInTree,
  setNodeCheckedInTree,
  toggleTreeExpanded as toggleTreeExpandedInTree,
} from '../data/mockCanvasData';
import { defaultSchedule } from '../data/mockCommandData';
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
  sanitizeCommand,
  canvasViewNeedsReset,
} from '../utils/safePersist';

const initialModules = createInitialModules();

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
  const walk = (moduleId, node) => {
    const key = `${moduleId}:${node.id}`;
    if (node.children?.length) {
      expanded[key] = true;
      node.children.forEach((child) => walk(moduleId, child));
    }
  };
  modules.forEach((module) => {
    module.data.forEach((node) => walk(module.id, node));
  });
  return expanded;
}

const defaultCommand = {
  schedule: deepClone(defaultSchedule),
  expanded: {
    'command:tasks': true,
    'command:goals': true,
    'command:schedule': true,
    'goals:main': true,
    'goals:phase': true,
  },
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
    databaseTree: deepClone(initialDatabaseTree),
    moduleFieldExpanded: buildDefaultModuleFieldExpanded(initialModules),
    command: deepClone(defaultCommand),
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
      databaseTree: deepClone(initialDatabaseTree),
      moduleFieldExpanded: buildDefaultModuleFieldExpanded(initialModules),
      command: deepClone(defaultCommand),

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
          databaseTree: setNodeCheckedInTree(state.databaseTree, moduleId, visible),
        }));
      },

      toggleModuleVisibility: (moduleId) => {
        const module = get().modules[moduleId];
        if (module) {
          get().setModuleVisibility(moduleId, !module.visible);
        }
      },

      toggleTreeCheck: (nodeId) => {
        const tree = get().databaseTree;
        const node = findNodeInTree(tree, nodeId);
        if (!node) return;

        const nextChecked = !node.checked;

        if (node.isModule) {
          get().setModuleVisibility(nodeId, nextChecked);
          return;
        }

        set({ databaseTree: setNodeCheckedInTree(tree, nodeId, nextChecked) });
      },

      toggleTreeExpand: (nodeId) =>
        set((state) => ({
          databaseTree: toggleTreeExpandedInTree(state.databaseTree, nodeId),
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
          command: {
            ...state.command,
            expanded: {
              ...state.command.expanded,
              [key]: !state.command.expanded[key],
            },
          },
        })),

      isCommandExpanded: (key) => get().command.expanded[key] ?? false,

      setCommandSchedule: (schedule) =>
        set((state) => ({
          command: {
            ...state.command,
            schedule: Array.isArray(schedule) ? schedule : state.command.schedule,
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
        databaseTree: state.databaseTree,
        moduleFieldExpanded: state.moduleFieldExpanded,
        command: state.command,
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
            databaseTree: deepClone(initialDatabaseTree),
            moduleFieldExpanded: buildDefaultModuleFieldExpanded(initialModules),
            command: deepClone(defaultCommand),
          },
          initialModules,
        );

        if (!sanitized) {
          if (import.meta.env.DEV) {
            console.warn('[jarvis] persisted state unusable, using defaults');
          }
          return current;
        }

        if (hadInvalidCanvas && import.meta.env.DEV) {
          console.warn('[jarvis] reset invalid canvas transform values');
        }

        return {
          ...current,
          ui: sanitized.ui,
          modules: sanitized.modules,
          databaseTree: sanitized.databaseTree,
          moduleFieldExpanded: sanitized.moduleFieldExpanded,
          command: sanitized.command,
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

export function getFieldVisibilityMap(state) {
  const tree = sanitizeDatabaseTree(state.databaseTree, initialDatabaseTree);
  return buildVisibilityMap(tree);
}

export function useCanvasSelectors() {
  const modules = useUiStore(getEnrichedModules);
  const visibleModules = useUiStore(getVisibleModules);
  const databaseTree = useUiStore((s) =>
    sanitizeDatabaseTree(s.databaseTree, initialDatabaseTree),
  );
  const fieldVisibilityMap = useUiStore(getFieldVisibilityMap);

  return { modules, visibleModules, databaseTree, fieldVisibilityMap };
}
