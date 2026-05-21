export default function VisibilityCheckbox({ checked, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
      className={[
        'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-200',
        checked
          ? 'border-jarvis-muted/60 bg-jarvis-muted/20'
          : 'border-jarvis-border bg-transparent hover:border-jarvis-muted/50',
      ].join(' ')}
      aria-label={label ?? (checked ? 'Hide' : 'Show')}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-jarvis-text" fill="none">
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
