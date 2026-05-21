import { memo, useMemo, useEffect } from 'react';
import { X, Search, Copy } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useCombinedState } from '../../hooks/useCombinedState';

const MAX_DEPTH = 10;

function getNestedData(data, path) {
  if (!path || !data) return null;
  const parts = path.split('.');
  let current = data;
  for (const part of parts) {
    if (current === undefined || current === null) return null;
    
    if (Array.isArray(current)) {
      const found = current.find((item, index) => 
        (item && typeof item === 'object' && (String(item.id) === part || String(item.name) === part)) ||
        String(index) === part
      );
      current = found;
    } else if (typeof current === 'object') {
      current = current[part];
    } else {
      return null;
    }
  }
  return current;
}

// Reuse logic from DatabaseNode but styled for Modal
function ProgressBar({ progress, height = 4 }) {
  const p = Math.max(0, Math.min(100, progress));
  return (
    <div className="w-full bg-white/5 rounded-full overflow-hidden" style={{ height: `${height}px` }}>
      <div 
        className="h-full bg-jarvis-accent transition-all duration-500 ease-out" 
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

function formatValue(value, label = '') {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const str = String(value);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch { /* ignore */ }
  }
  if (label.toLowerCase().includes('mood') || label.toLowerCase().includes('score')) {
    return `${value}/10`;
  }
  return str;
}

const DetailDataRenderer = memo(function DetailDataRenderer({ value, depth = 0, label = '' }) {
  if (value === null || value === undefined) {
    return <span className="text-jarvis-muted/50 italic">empty</span>;
  }
  if (depth > MAX_DEPTH) return <span className="text-jarvis-muted italic">[Max Depth]</span>;

  if (typeof value !== 'object') {
    if (typeof value === 'number' && value >= 0 && value <= 100 && (label.toLowerCase().includes('progress') || label.toLowerCase().includes('rate'))) {
       return (
         <div className="flex items-center gap-3 py-1">
           <div className="flex-1 min-w-[100px]"><ProgressBar progress={value} height={6} /></div>
           <span className="text-xs font-mono text-jarvis-muted w-10 text-right">{value}%</span>
         </div>
       );
    }
    const formatted = formatValue(value, label);
    return <span className="text-jarvis-text leading-relaxed whitespace-pre-wrap">{formatted}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] !== 'object') {
      return (
        <div className="flex flex-wrap gap-2 py-2">
          {value.map((v, i) => (
            <span key={i} className="rounded-lg bg-jarvis-accent/10 px-3 py-1 text-xs text-jarvis-accent border border-jarvis-accent/20">
              {String(v)}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-3 mt-2">
        {value.map((item, i) => (
          <div key={i} className="rounded-xl border border-jarvis-border/40 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center gap-2">
               <span className="text-[10px] font-bold uppercase tracking-wider text-jarvis-muted opacity-50">Item #{i + 1}</span>
            </div>
            <DetailDataRenderer value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(value).filter(([k]) => !['id', 'dataKey', 'type'].includes(k));
  return (
    <div className="flex flex-col gap-4 mt-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 border-l-2 border-jarvis-border/20 pl-4 py-1">
          <span className="text-jarvis-muted font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">{k}</span>
          <div className="text-jarvis-text text-[13px]">
            <DetailDataRenderer value={v} depth={depth + 1} label={k} />
          </div>
        </div>
      ))}
    </div>
  );
});

export default function DataDetailOverlay() {
  const activeDetailPath = useUiStore((s) => s.activeDetailPath);
  const clearActiveDetailPath = useUiStore((s) => s.clearActiveDetailPath);
  const combinedState = useCombinedState();

  const data = useMemo(() => getNestedData(combinedState, activeDetailPath), [combinedState, activeDetailPath]);
  const label = activeDetailPath?.split('.').pop() || 'Detail View';

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') clearActiveDetailPath();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [clearActiveDetailPath]);

  if (!activeDetailPath) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-200"
      onClick={clearActiveDetailPath}
    >
      <div 
        className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border border-jarvis-border/50 bg-[#0a0a0a] shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-8 py-6 border-b border-jarvis-border/30">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-jarvis-accent/10 border border-jarvis-accent/20">
              <Search className="h-5 w-5 text-jarvis-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white capitalize">
                {label.replace(/([a-z])([A-Z])/g, '$1 $2')}
              </h2>
              <p className="text-[10px] font-mono text-jarvis-muted uppercase tracking-widest opacity-60">
                {activeDetailPath}
              </p>
            </div>
          </div>
          <button 
            onClick={clearActiveDetailPath}
            className="group rounded-full p-2 text-jarvis-muted transition-all duration-200 hover:bg-white/5 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-jarvis-border/50">
          {data !== null ? (
            <DetailDataRenderer value={data} label={label} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <p className="text-sm italic text-jarvis-muted">Data not found at this path.</p>
            </div>
          )}
        </div>

        <footer className="px-8 py-5 border-t border-jarvis-border/30 bg-white/[0.01] rounded-b-3xl">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-jarvis-muted italic">
              Recursive detailed view of current node state.
            </p>
            <div className="flex items-center gap-3">
               <button 
                 className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-medium text-jarvis-text transition-colors hover:bg-white/10"
                 onClick={() => {
                   navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                 }}
               >
                 <Copy className="h-3.5 w-3.5" />
                 Copy JSON
               </button>
               <button 
                 onClick={clearActiveDetailPath}
                 className="rounded-lg bg-jarvis-accent px-6 py-2 text-xs font-bold text-black transition-transform active:scale-95"
               >
                 Close
               </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
