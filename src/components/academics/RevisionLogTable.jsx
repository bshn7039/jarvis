export default function RevisionLogTable({ logs, subjectMap }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-jarvis-border">
      <table className="min-w-full divide-y divide-jarvis-border text-sm">
        <thead className="bg-black/25 text-xs uppercase tracking-wide text-jarvis-muted">
          <tr>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Subject</th>
            <th className="px-3 py-2 text-left">Topic</th>
            <th className="px-3 py-2 text-right">Hours</th>
            <th className="px-3 py-2 text-right">Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-jarvis-border/70">
          {logs.map((log) => (
            <tr key={log.id} className="bg-black/10">
              <td className="px-3 py-2 text-jarvis-muted">{log.date}</td>
              <td className="px-3 py-2 text-jarvis-text">{subjectMap[log.subjectId] || '-'}</td>
              <td className="px-3 py-2 text-jarvis-muted">{log.topic}</td>
              <td className="px-3 py-2 text-right text-jarvis-muted">{log.hours.toFixed(1)}</td>
              <td className="px-3 py-2 text-right text-jarvis-text">{log.confidence}/10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
