export default function ProgressBar({ value = 0, className = '' }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={['h-2 w-full overflow-hidden rounded-full bg-black/30', className].join(' ')}>
      <div
        className="h-full rounded-full bg-jarvis-accent/85 transition-all duration-300"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
