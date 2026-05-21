import { WORKSPACE_SIZE } from '../../data/mockCanvasData';

export default function WorkspaceGrid({ children }) {
  return (
    <div
      className="canvas-workspace relative"
      style={{
        width: WORKSPACE_SIZE.width,
        height: WORKSPACE_SIZE.height,
        minWidth: WORKSPACE_SIZE.width,
        minHeight: WORKSPACE_SIZE.height,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(42, 42, 42, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(42, 42, 42, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="canvas-modules-layer relative h-full w-full">{children}</div>
    </div>
  );
}
