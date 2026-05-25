import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useUiStore, getEnrichedModules } from '../../store/uiStore';
import { useStoreHydrated } from '../../hooks/useStoreHydrated';
import { useLiveDatabaseTree } from '../../store/selectors/tree.selectors';
import { sanitizePan, sanitizeZoom } from '../../utils/safePersist';
import CanvasToolbar from './CanvasToolbar';
import WorkspaceGrid from './WorkspaceGrid';
import DraggableModule from './DraggableModule';
import DataDetailOverlay from '../ui/DataDetailOverlay';
import { useCombinedState } from '../../hooks/useCombinedState';
import CanvasNodeActionModals from './CanvasNodeActionModals';

const TOOLBAR_ZOOM_STEP = 0.08;
const TOOLBAR_ZOOM_ANIMATION_MS = 250;

export default function CanvasWorkspace({ onMenuClick }) {
  const hydrated = useStoreHydrated();
  const tree = useLiveDatabaseTree();
  const [workspaceScale, setWorkspaceScale] = useState(1);
  const [isDraggingModule, setIsDraggingModule] = useState(false);
  const [transformMountKey, setTransformMountKey] = useState('pending');
  const [nodeActionState, setNodeActionState] = useState(null);
  const persistReadyRef = useRef(false);
  const hasInitializedTransformRef = useRef(false);
  const initialTransformRef = useRef({
    scale: 1,
    positionX: 0,
    positionY: 0,
  });

  const combinedState = useCombinedState();
  const scale = useUiStore((s) => sanitizeZoom(s.ui?.canvasZoom));
  const positionX = useUiStore((s) => sanitizePan(s.ui?.canvasPositionX));
  const positionY = useUiStore((s) => sanitizePan(s.ui?.canvasPositionY));
  const modules = useUiStore((s) => s.modules);
  const setCanvasView = useUiStore((s) => s.setCanvasView);
  const resetCanvasView = useUiStore((s) => s.resetCanvasView);
  const toggleModuleVisibility = useUiStore((s) => s.toggleModuleVisibility);
  const updateModulePosition = useUiStore((s) => s.updateModulePosition);
  const setActiveDetailPath = useUiStore((s) => s.setActiveDetailPath);
  const visibleModules = useMemo(() => 
    getEnrichedModules({ modules }).filter((module) => module.visible),
    [modules]
  );

  useEffect(() => {
    if (!hydrated) {
      persistReadyRef.current = false;
      hasInitializedTransformRef.current = false;
      return undefined;
    }

    if (hasInitializedTransformRef.current) {
      return undefined;
    }

    const safeScale = sanitizeZoom(scale, 1);
    const safePositionX = sanitizePan(positionX, 0);
    const safePositionY = sanitizePan(positionY, 0);

    initialTransformRef.current = {
      scale: safeScale,
      positionX: safePositionX,
      positionY: safePositionY,
    };
    setWorkspaceScale(safeScale);
    setTransformMountKey(`hydrated:${safeScale}:${safePositionX}:${safePositionY}`);
    hasInitializedTransformRef.current = true;

    if (import.meta.env.DEV) {
      console.log('[jarvis] canvas hydration complete', initialTransformRef.current);
    }

    const frame = requestAnimationFrame(() => {
      persistReadyRef.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, [hydrated, scale, positionX, positionY]);

  const updateLocalScale = useCallback((_, state) => {
    const nextScale = sanitizeZoom(state?.scale, 1);
    setWorkspaceScale(nextScale);
  }, []);

  const persistView = useCallback(
    (_, state) => {
      if (!persistReadyRef.current || !state) return;

      const nextScale = sanitizeZoom(state.scale, 1);
      const nextPositionX = sanitizePan(state.positionX, 0);
      const nextPositionY = sanitizePan(state.positionY, 0);

      if (import.meta.env.DEV) {
        const sanitized =
          nextScale !== state.scale ||
          nextPositionX !== state.positionX ||
          nextPositionY !== state.positionY;
        if (sanitized) {
          console.warn('[jarvis] invalid transform values sanitized', {
            scale: state.scale,
            positionX: state.positionX,
            positionY: state.positionY,
          });
        }
      }

      setWorkspaceScale(nextScale);
      setCanvasView({
        scale: nextScale,
        positionX: nextPositionX,
        positionY: nextPositionY,
      });
    },
    [setCanvasView],
  );

  const zoomPercent = Math.round(workspaceScale * 100);
  const openNodeEdit = useCallback((path) => setNodeActionState({ mode: 'edit', path }), []);
  const openNodeDelete = useCallback((path) => setNodeActionState({ mode: 'delete', path }), []);
  const openNodeView = useCallback((path) => setActiveDetailPath(path), [setActiveDetailPath]);
  const closeNodeAction = useCallback(() => setNodeActionState(null), []);

  const handleVisibilityToggle = useCallback((id) => toggleModuleVisibility(id), [toggleModuleVisibility]);
  const handlePositionChange = useCallback((id, x, y) => updateModulePosition(id, x, y), [updateModulePosition]);
  const handleDragStart = useCallback(() => setIsDraggingModule(true), []);
  const handleDragStop = useCallback(() => setIsDraggingModule(false), []);

  if (!hydrated) {
    if (import.meta.env.DEV) {
      console.log('[jarvis] canvas hydration start');
    }
    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        <CanvasToolbar
          title="Canvas Workspace"
          zoom={100}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onReset={() => {}}
          onMenuClick={onMenuClick}
        />
        <div className="flex min-h-0 flex-1 items-center justify-center bg-jarvis-bg">
          <span className="text-sm text-jarvis-muted">Loading workspace…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <TransformWrapper
          key={transformMountKey}
          initialScale={initialTransformRef.current.scale}
          initialPositionX={initialTransformRef.current.positionX}
          initialPositionY={initialTransformRef.current.positionY}
          minScale={0.5}
          maxScale={2}
          limitToBounds={false}
          centerOnInit={false}
          smooth
          wheel={{
            step: 0.00015,
            smoothStep: 0.008,
            activationKeys: [],
            disabled: false,
            wheelDisabled: false,
            touchPadDisabled: false,
          }}
          pinch={{ step: 2 }}
          doubleClick={{ disabled: true }}
          velocityAnimation={{ disabled: true }}
          panning={{
            disabled: isDraggingModule,
            velocityDisabled: true,
            excluded: ['module-card', 'module-drag-handle', 'module-no-drag'],
          }}
          onZoom={updateLocalScale}
          onZoomStop={persistView}
          onPanningStop={persistView}
          onWheelStop={persistView}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <CanvasToolbar
                title="Canvas Workspace"
                zoom={zoomPercent}
                onZoomIn={() => zoomIn(TOOLBAR_ZOOM_STEP, TOOLBAR_ZOOM_ANIMATION_MS)}
                onZoomOut={() => zoomOut(TOOLBAR_ZOOM_STEP, TOOLBAR_ZOOM_ANIMATION_MS)}
                onReset={() => {
                  persistReadyRef.current = false;
                  resetTransform(TOOLBAR_ZOOM_ANIMATION_MS);
                  resetCanvasView();
                  setWorkspaceScale(1);
                  if (import.meta.env.DEV) {
                    console.log('[jarvis] transform reset to defaults');
                  }
                  requestAnimationFrame(() => {
                    persistReadyRef.current = true;
                  });
                }}
                onMenuClick={onMenuClick}
              />
              <div className="canvas-viewport relative min-h-0 flex-1 overflow-hidden bg-jarvis-bg">
                <TransformComponent wrapperClass="canvas-zoom-wrapper">
                  <WorkspaceGrid>
                    {visibleModules.map((module) => {
                      const moduleNode = tree.find(n => n.id === module.id);
                      return (
                        <DraggableModule
                          key={module.id}
                          module={module}
                          moduleNode={moduleNode}
                          scale={workspaceScale}
                          onVisibilityToggle={() => handleVisibilityToggle(module.id)}
                          onPositionChange={(x, y) =>
                            handlePositionChange(module.id, x, y)
                          }
                          onDragStart={handleDragStart}
                          onDragStop={handleDragStop}
                          onViewNode={openNodeView}
                          onEditNode={openNodeEdit}
                          onDeleteNode={openNodeDelete}
                        />
                      );
                    })}
                  </WorkspaceGrid>
                </TransformComponent>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>
      <DataDetailOverlay />
      <CanvasNodeActionModals
        actionState={nodeActionState}
        combinedState={combinedState}
        onClose={closeNodeAction}
      />
    </div>
  );
}
