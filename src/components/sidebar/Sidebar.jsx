import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  LayoutDashboard,
  ClipboardList,
  Target,
  NotebookText,
  WalletCards,
  Dumbbell,
  Handshake,
  GraduationCap,
  X,
} from 'lucide-react';
import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';
import SidebarToggle from './SidebarToggle';
import Divider from '../ui/Divider';
import { chatHistory } from '../../data/mockChats';
import { useLayout } from '../../context/LayoutContext';

const navItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/home' },
  { id: 'canvas', label: 'Canvas', icon: LayoutGrid, path: '/canvas' },
  { id: 'command', label: 'Command Center', icon: LayoutDashboard, path: '/command' },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList, path: '/tasks' },
  { id: 'goals', label: 'Goals', icon: Target, path: '/goals' },
  { id: 'journal', label: 'Journal', icon: NotebookText, path: '/journal' },
  { id: 'finance', label: 'Finance', icon: WalletCards, path: '/finance' },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell, path: '/fitness' },
  { id: 'crm', label: 'CRM', icon: Handshake, path: '/crm' },
  { id: 'academics', label: 'Academics', icon: GraduationCap, path: '/academics' },
];

function formatChatLabel({ date, title }) {
  return `${date} - ${title}`;
}

export default function Sidebar() {
  const { pathname } = useLocation();
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useLayout();
  const isHome = pathname === '/home';
  const isCanvas = pathname === '/canvas';

  const widthClass = collapsed ? 'w-[72px]' : 'w-[260px] lg:w-[280px]';

  const positionClasses = isCanvas
    ? 'relative z-20 h-screen shrink-0 translate-x-0'
    : [
        'fixed inset-y-0 left-0 z-50 h-screen shrink-0',
        'md:relative md:z-20 md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ');

  return (
    <>
      {!isCanvas && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        className={[
          'flex flex-col border-r border-jarvis-border bg-jarvis-panel transition-all duration-200 ease-out',
          widthClass,
          positionClasses,
        ].join(' ')}
      >
        <div
          className={[
            'flex shrink-0 items-center border-b border-jarvis-border/60 px-3 py-4',
            collapsed ? 'justify-center' : 'justify-between gap-2',
          ].join(' ')}
        >
          <div
            className={[
              'flex items-center gap-2',
              collapsed ? 'flex-col' : 'min-w-0 flex-1',
            ].join(' ')}
          >
            <SidebarToggle collapsed={collapsed} onToggle={toggleCollapsed} />
            {!collapsed && (
              <Link
                to="/home"
                onClick={closeMobile}
                className="truncate text-sm font-semibold tracking-[0.2em] text-jarvis-text transition-colors duration-200 hover:text-white"
              >
                JARVIS
              </Link>
            )}
          </div>
          {!collapsed && !isCanvas && (
            <button
              type="button"
              onClick={closeMobile}
              className="rounded-lg p-1.5 text-jarvis-muted transition-colors duration-200 hover:bg-white/5 hover:text-jarvis-text md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex shrink-0 justify-center py-3">
            <Link
              to="/home"
              onClick={closeMobile}
              className="text-[10px] font-semibold tracking-[0.15em] text-jarvis-text transition-colors duration-200 hover:text-white"
              title="JARVIS Home"
            >
              J
            </Link>
          </div>
        )}

        <nav className={['flex shrink-0 flex-col gap-0.5 mt-2', collapsed ? 'px-1.5' : 'px-2'].join(' ')}>
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              to={item.path}
              collapsed={collapsed}
              active={pathname === item.path}
              onClick={closeMobile}
            />
          ))}
        </nav>

        {!collapsed && (
          <>
            <div className="my-4 shrink-0 px-4">
              <Divider />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
              {isHome && (
                <SidebarSection title="Recent Chats">
                  {chatHistory.map((chat) => (
                    <button
                      key={chat.id}
                      type="button"
                      className="w-full truncate rounded-lg px-2.5 py-2 text-left text-[13px] text-jarvis-muted transition-colors duration-200 hover:bg-white/[0.03] hover:text-jarvis-text"
                    >
                      {formatChatLabel(chat)}
                    </button>
                  ))}
                </SidebarSection>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
