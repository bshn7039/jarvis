import { LayoutProvider, useLayout } from '../context/LayoutContext';
import Sidebar from '../components/sidebar/Sidebar';
import CanvasWorkspace from '../components/canvas/CanvasWorkspace';
import DatabaseTree from '../components/canvas/DatabaseTree';
import LiveWallpaper from '../components/layout/LiveWallpaper';
import FocusControls from '../components/layout/FocusControls';
import { useFocusStore } from '../store/focusStore';
import { useUiStore } from '../store/uiStore';
import { useLiveDatabaseTree } from '../store/selectors/tree.selectors';
import { Database } from 'lucide-react';

function DatabaseExplorer() {
  const tree = useLiveDatabaseTree();
  const toggleTreeCheck = useUiStore((s) => s.toggleTreeCheck);
  const toggleExplorerExpand = useUiStore((s) => s.toggleExplorerExpand);

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-jarvis-border/20 jarvis-glass">
      <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-jarvis-border px-5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-jarvis-muted" strokeWidth={2} />
          <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-jarvis-text">
            Canvas Board
          </h2>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-jarvis-border">
        <div className="rounded-xl border border-jarvis-border/30 bg-black/10 p-2">
          <DatabaseTree
            tree={tree}
            onToggleCheck={(id) => toggleTreeCheck(id, tree)}
            onToggleExpand={toggleExplorerExpand}
          />
        </div>
      </div>

      <footer className="border-t border-jarvis-border p-4">
        <div className="rounded-lg bg-jarvis-muted/5 p-3">
          <p className="text-[10px] text-jarvis-muted leading-relaxed">
            Toggle branches to control visual clusters on the infinite canvas.
          </p>
        </div>
      </footer>
    </aside>
  );
}

function CanvasShell() {
  const { openMobile } = useLayout();
  const brightness = useFocusStore((s) => s.brightness);
  const dimOpacity = (100 - brightness) / 100;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent">
      {/* Screen Dimmer Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 bg-black transition-opacity duration-200" 
        style={{ opacity: dimOpacity }} 
      />
      <LiveWallpaper />
      {/* Column 1: App Navigation */}
      <Sidebar />
      
      {/* Column 2: Database Explorer */}
      <DatabaseExplorer />

      {/* Column 3: Infinite Workspace */}
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
        <CanvasWorkspace onMenuClick={openMobile} />
      </main>

      {/* Focus Controls */}
      <FocusControls />
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
