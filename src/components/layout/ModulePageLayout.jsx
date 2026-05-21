import { Menu } from 'lucide-react';
import { LayoutProvider, useLayout } from '../../context/LayoutContext';
import Sidebar from '../sidebar/Sidebar';
import IconButton from '../ui/IconButton';

function LayoutFrame({ title, subtitle, headerActions, children }) {
  const { openMobile } = useLayout();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-jarvis-bg">
      <Sidebar />
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-jarvis-border bg-jarvis-bg px-4 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton
              icon={Menu}
              label="Open menu"
              onClick={openMobile}
              className="md:hidden"
              size="md"
            />
            <div>
              <h1 className="text-lg font-medium text-jarvis-text md:text-xl">{title}</h1>
              {subtitle && <p className="mt-1 text-xs text-jarvis-muted md:text-sm">{subtitle}</p>}
            </div>
          </div>
          {headerActions}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] space-y-5 p-4 pb-10 md:space-y-6 md:p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ModulePageLayout(props) {
  return (
    <LayoutProvider>
      <LayoutFrame {...props} />
    </LayoutProvider>
  );
}
