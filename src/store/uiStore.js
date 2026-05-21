import { create } from 'zustand';
import { canvasModules } from '../config/canvasModules';
import {
  findNodeInTree,
} from '../data/databaseTree';
import { deepClone } from '../utils/deepClone';
import { uiService } from '../database/services/uiService';

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

export const useUiStore = create((set, get) => ({
  ui: {
    sidebarCollapsed: false,
    canvasZoom: 1,
    canvasPositionX: 0,
    canvasPositionY: 0,
  },
  modules: buildModulesState(),
  explorerExpansion: {},
  canvasExpansion: {},
  treeChecked: {},
  moduleFieldExpanded: buildDefaultModuleFieldExpanded(initialModules),
  activeDetailPath: null,
  commandCenter: deepClone(defaultCommand),
  isHydrated: false,

  hydrate: async () => {
    try {
      const settings = await uiService.getSettings();
      const canvasRegistry = await uiService.getCanvasRegistry();
      const commandState = await uiService.getCommandCenterState();

      const profile = settings['user-profile'];
      const prefs = settings['user-preferences'];

      // Map canvas registry back to modules state
      const modules = get().modules;
      if (canvasRegistry.length > 0) {
        canvasRegistry.forEach(m => {
          if (modules[m.id]) {
            modules[m.id] = {
              ...modules[m.id],
              position: m.position || modules[m.id].position,
              visible: typeof m.visible === 'boolean' ? m.visible : modules[m.id].visible,
            };
          }
        });
      }

      set({
        ui: {
          ...get().ui,
          sidebarCollapsed: prefs?.sidebarCollapsed ?? false,
          canvasZoom: prefs?.canvasZoom ?? 1,
          canvasPositionX: prefs?.canvasPositionX ?? 0,
          canvasPositionY: prefs?.canvasPositionY ?? 0,
        },
        modules,
        commandCenter: commandState ? { ...get().commandCenter, ...commandState } : get().commandCenter,
        isHydrated: true,
      });
    } catch (err) {
      console.error('Failed to hydrate UI:', err);
    }
  },

  savePrefs: async () => {
    const { ui } = get();
    await uiService.saveSetting('user-preferences', {
      sidebarCollapsed: ui.sidebarCollapsed,
      canvasZoom: ui.canvasZoom,
      canvasPositionX: ui.canvasPositionX,
      canvasPositionY: ui.canvasPositionY,
    });
  },

  toggleSidebarCollapsed: () => {
    set((state) => ({
      ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
    }));
    get().savePrefs();
  },

  setSidebarCollapsed: (collapsed) => {
    set((state) => ({
      ui: { ...state.ui, sidebarCollapsed: Boolean(collapsed) },
    }));
    get().savePrefs();
  },

  setCanvasView: ({ scale, positionX, positionY }) => {
    set((state) => ({
      ui: {
        ...state.ui,
        ...(scale !== undefined && { canvasZoom: scale }),
        ...(positionX !== undefined && { canvasPositionX: positionX }),
        ...(positionY !== undefined && { canvasPositionY: positionY }),
      },
    }));
    get().savePrefs();
  },

  resetCanvasView: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        canvasZoom: 1,
        canvasPositionX: 0,
        canvasPositionY: 0,
      },
    }));
    get().savePrefs();
  },

  updateModulePosition: async (moduleId, x, y) => {
    set((state) => ({
      modules: {
        ...state.modules,
        [moduleId]: {
          ...state.modules[moduleId],
          position: { x, y },
        },
      },
    }));
    
    // Persist to IDB
    const moduleState = get().modules[moduleId];
    await uiService.saveCanvasModule({
      id: moduleId,
      position: { x, y },
      visible: moduleState.visible
    });
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

  setModuleVisibility: async (moduleId, visible) => {
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

    const moduleState = get().modules[moduleId];
    await uiService.saveCanvasModule({
      id: moduleId,
      position: moduleState.position,
      visible: Boolean(visible)
    });
  },

  toggleModuleVisibility: (moduleId) => {
    const module = get().modules[moduleId];
    if (module) {
      get().setModuleVisibility(moduleId, !module.visible);
    }
  },

  toggleTreeCheck: (path, tree) => {
    const current = get().treeChecked[path] !== false;
    const next = !current;
    
    if (!tree) return;
    const node = findNodeInTree(tree, path);
    if (!node) return;

    const newCheckedMap = { ...get().treeChecked };
    
    const walk = (n) => {
      newCheckedMap[n.id] = next;
      if (n.children) n.children.forEach(walk);
    };
    
    walk(node);

    set({ treeChecked: newCheckedMap });

    if (initialModules.some(m => m.id === path)) {
      get().setModuleVisibility(path, next);
    }
  },

  toggleExplorerExpand: (path) =>
    set((state) => ({
      explorerExpansion: {
        ...state.explorerExpansion,
        [path]: !state.explorerExpansion[path],
      },
    })),

  toggleCanvasExpand: (path) =>
    set((state) => ({
      canvasExpansion: {
        ...state.canvasExpansion,
        [path]: !state.canvasExpansion[path],
      },
    })),

  setActiveDetailPath: (path) => set({ activeDetailPath: path }),
  clearActiveDetailPath: () => set({ activeDetailPath: null }),

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

  toggleCommandExpanded: (key) => {
    set((state) => ({
      commandCenter: {
        ...state.commandCenter,
        collapsedSections: {
          ...state.commandCenter.collapsedSections,
          [key]: !state.commandCenter.collapsedSections[key],
        },
      },
    }));
    uiService.saveCommandCenterState(get().commandCenter);
  },

  isCommandExpanded: (key) => get().commandCenter.collapsedSections[key] ?? false,
}));

export function selectSafeCanvasView(state) {
  return {
    scale: state.ui?.canvasZoom || 1,
    positionX: state.ui?.canvasPositionX || 0,
    positionY: state.ui?.canvasPositionY || 0,
  };
}

export function getEnrichedModules(state) {
  return initialModules.map((base) => {
    const saved = state.modules?.[base.id];
    return {
      ...base,
      position: saved?.position || base.position,
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
  const explorerExpansion = useUiStore((s) => s.explorerExpansion);
  const canvasExpansion = useUiStore((s) => s.canvasExpansion);
  const treeChecked = useUiStore((s) => s.treeChecked);
  const activeDetailPath = useUiStore((s) => s.activeDetailPath);
  const setActiveDetailPath = useUiStore((s) => s.setActiveDetailPath);
  const clearActiveDetailPath = useUiStore((s) => s.clearActiveDetailPath);

  return { 
    modules, 
    visibleModules, 
    explorerExpansion,
    canvasExpansion,
    treeChecked,
    activeDetailPath,
    setActiveDetailPath,
    clearActiveDetailPath
  };
}

