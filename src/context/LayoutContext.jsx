import { createContext, useCallback, useContext, useState } from 'react';
import { useUiStore } from '../store/uiStore';

const LayoutContext = createContext(null);

export function LayoutProvider({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarCollapsed = useUiStore((s) => s.ui.sidebarCollapsed);
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <LayoutContext.Provider
      value={{
        collapsed: sidebarCollapsed,
        mobileOpen,
        toggleCollapsed: toggleSidebarCollapsed,
        openMobile,
        closeMobile,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
}
