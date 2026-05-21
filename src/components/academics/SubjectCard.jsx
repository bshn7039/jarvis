import ProgressBar from '../ui/ProgressBar';

export default function SubjectCard({ subject, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(subject.id)}
      className={[
        'w-full rounded-xl border p-3 text-left transition',
        selected
          ? 'border-jarvis-accent/40 bg-jarvis-accent/10'
          : 'border-jarvis-border bg-black/20 hover:border-jarvis-muted/40',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-jarvis-text">{subject.name}</p>
        <span className="text-[11px] text-jarvis-muted">{subject.code}</span>
      </div>
      <p className="mt-1 text-[11px] text-jarvis-muted">
        Exam: {new Date(subject.nextExam).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
      <div className="mt-2">
        <ProgressBar value={subject.progress} />
      </div>
    </button>
  );
}
