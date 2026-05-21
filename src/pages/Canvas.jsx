import { LayoutProvider, useLayout } from '../context/LayoutContext';
import Sidebar from '../components/sidebar/Sidebar';
import CanvasWorkspace from '../components/canvas/CanvasWorkspace';

function CanvasShell() {
  const { openMobile } = useLayout();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-jarvis-bg">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CanvasWorkspace onMenuClick={openMobile} />
      </div>
    </div>
  );
}

export default function Canvas() {
  return (
    <LayoutProvider>
      <CanvasShell />
    </LayoutProvider>
  );
}
