import { LayoutProvider, useLayout } from '../context/LayoutContext';
import Sidebar from '../components/sidebar/Sidebar';
import CanvasWorkspace from '../components/canvas/CanvasWorkspace';
import DatabaseTree from '../components/canvas/DatabaseTree';
import { useUiStore } from '../store/uiStore';
import { databaseTree as initialDatabaseTree } from '../data/databaseTree';
import { Database, Search, Filter } from 'lucide-react';

function DatabaseExplorer() {
  const toggleTreeCheck = useUiStore((s) => s.toggleTreeCheck);
  const toggleTreeExpand = useUiStore((s) => s.toggleTreeExpand);

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-jarvis-border bg-jarvis-panel/30 backdrop-blur-xl">
      <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-jarvis-border px-5">
        <div className="flex items-center gap-2.5">
          <Database className="h-4 w-4 text-jarvis-muted" strokeWidth={2} />
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-jarvis-text">
            Explorer
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-md p-1.5 text-jarvis-muted hover:bg-white/5 hover:text-jarvis-text transition-colors">
            <Search className="h-3.5 w-3.5" />
          </button>
          <button className="rounded-md p-1.5 text-jarvis-muted hover:bg-white/5 hover:text-jarvis-text transition-colors">
            <Filter className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-jarvis-border">
        <div className="rounded-xl border border-jarvis-border/30 bg-black/10 p-2">
          <DatabaseTree
            tree={initialDatabaseTree}
            onToggleCheck={toggleTreeCheck}
            onToggleExpand={toggleTreeExpand}
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-jarvis-bg">
      {/* Column 1: App Navigation */}
      <Sidebar />
      
      {/* Column 2: Database Explorer */}
      <DatabaseExplorer />

      {/* Column 3: Infinite Workspace */}
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-jarvis-bg">
        <CanvasWorkspace onMenuClick={openMobile} />
      </main>
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
