export default function IconButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const variantClasses = {
    default:
      'text-jarvis-muted hover:text-jarvis-text hover:bg-white/5',
    accent:
      'text-jarvis-muted hover:text-jarvis-accent hover:bg-jarvis-accent/10',
    primary:
      'bg-jarvis-text text-jarvis-bg hover:bg-white/90',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        'inline-flex items-center justify-center rounded-lg transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-jarvis-border',
        'disabled:opacity-40 disabled:pointer-events-none',
        sizeClasses[size],
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} strokeWidth={1.75} />
    </button>
  );
}
