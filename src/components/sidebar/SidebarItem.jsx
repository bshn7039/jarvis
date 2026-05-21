import { Link } from 'react-router-dom';

const itemClasses = (active, collapsed) =>
  [
    'group flex w-full items-center rounded-lg text-sm transition-colors duration-200',
    collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-2.5 py-2 text-left',
    active
      ? 'bg-white/5 text-jarvis-text'
      : 'text-jarvis-muted hover:bg-white/[0.03] hover:text-jarvis-text',
  ].join(' ');

export default function SidebarItem({
  label,
  icon: Icon,
  active = false,
  onClick,
  to,
  collapsed = false,
  className = '',
}) {
  const classes = `${itemClasses(active, collapsed)} ${className}`;

  const content = (
    <>
      {Icon && (
        <Icon
          className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100"
          strokeWidth={1.75}
        />
      )}
      {!collapsed && <span className="truncate">{label}</span>}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={classes}
        title={collapsed ? label : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      title={collapsed ? label : undefined}
    >
      {content}
    </button>
  );
}
