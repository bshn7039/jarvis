import React from 'react';
import PagePanel from '../ui/PagePanel';

export default function AiInsightsPanel() {
  return (
    <PagePanel title="AI Insights" subtitle="Growth and trajectory analysis.">
      <div className="flex flex-col items-center justify-center py-10 border border-dashed border-jarvis-border/50 rounded-xl bg-white/[0.01]">
        <p className="text-xs text-jarvis-muted italic">No AI insights available yet.</p>
        <p className="text-[10px] text-jarvis-muted mt-1 uppercase tracking-tighter">Connecting Growth Engine to Neural Layer...</p>
      </div>
    </PagePanel>
  );
}
