export default function Divider({ className = '' }) {
  return (
    <div
      role="separator"
      className={`h-px w-full bg-jarvis-border ${className}`}
    />
  );
}
