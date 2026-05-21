export default function SidebarSection({ title, children, collapsed = false, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {title && !collapsed && (
        <h3 className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-wider text-jarvis-muted/80">
          {title}
        </h3>
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
