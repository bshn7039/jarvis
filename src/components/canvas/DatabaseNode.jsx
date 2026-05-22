import { memo, useMemo } from 'react';
import { ChevronDown, ChevronRight, Hash, List, Database, FileText, Eye, Pencil, Trash2 } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useCombinedState } from '../../hooks/useCombinedState';
import ProgressBar from '../ui/ProgressBar';

const MAX_DEPTH = 10;

export function getNestedData(data, path) {
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

const DataTable = memo(function DataTable({ value }) {
  if (!value?.length) return null;
  const keys = Object.keys(value[0]).filter(k => 
    !['id', 'linkedTaskId', 'scheduleId', 'taskIds', 'linkedTaskIds', 'socialTaskIds', 'dataKey'].includes(k)
  );

  return (
    <div className="mt-2 overflow-x-auto rounded-lg border border-jarvis-border/40 bg-white/[0.01]">
      <table className="w-full text-left text-[10px] border-collapse">
        <thead>
          <tr className="border-b border-jarvis-border/40 bg-white/[0.02]">
            {keys.map(k => (
              <th key={k} className="px-2 py-2 font-mono uppercase tracking-wider text-jarvis-muted/70">{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {value.map((item, i) => (
            <tr key={i} className="border-b border-jarvis-border/20 last:border-0 hover:bg-white/[0.02] transition-colors">
              {keys.map(k => (
                <td key={k} className="px-2 py-2 text-jarvis-text/80 truncate max-w-[250px]">
                  {typeof item[k] === 'object' ? 
                    (Array.isArray(item[k]) ? `[Array(${item[k].length})]` : '[Object]') 
                    : String(item[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export function formatValue(value, label = '') {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  
  const str = String(value);
  
  // Date detection (simple)
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch { /* ignore */ }
  }

  // Mood/Score handling
  if (label.toLowerCase().includes('mood') || label.toLowerCase().includes('score')) {
    return `${value}/10`;
  }

  return str;
}

const DataRenderer = memo(function DataRenderer({ value, depth = 0, label = '' }) {
  if (value === null || value === undefined) {
    return <span className="text-jarvis-muted/50 italic text-[10px]">empty</span>;
  }

  if (depth > MAX_DEPTH) return <span className="text-jarvis-muted italic">[Max Depth]</span>;

  // Chat Messages specialized renderer
  if (label.toLowerCase() === 'messages' && Array.isArray(value)) {
    return (
      <div className="flex flex-col gap-3 mt-2 border-l-2 border-jarvis-border/40 pl-4 py-1">
        {value.map((msg, i) => (
          <div key={msg.id || i} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded ${
                msg.role === 'user' ? 'bg-jarvis-accent/20 text-jarvis-accent' : 'bg-white/10 text-jarvis-text'
              }`}>
                {msg.role}
              </span>
              <span className="text-[9px] text-jarvis-muted font-mono">
                {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-[11px] text-jarvis-text/90 leading-relaxed bg-white/[0.02] p-2 rounded-md border border-jarvis-border/30 whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
        ))}
      </div>
    );
  }

  // Personality Profiles specialized renderer
  if (label.toLowerCase() === 'personalityprofiles' && Array.isArray(value)) {
    return (
      <div className="grid gap-3 mt-2">
        {value.map((p, i) => (
          <div key={i} className="rounded-lg border border-jarvis-border/50 bg-white/[0.02] p-3 space-y-2">
            <h4 className="text-[11px] font-semibold text-jarvis-text uppercase tracking-wider">{p.title}</h4>
            <p className="text-[10px] text-jarvis-muted leading-relaxed">{p.description}</p>
            {p.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {p.tags.map(tag => (
                  <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-jarvis-accent/10 text-jarvis-accent border border-jarvis-accent/20">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Languages specialized renderer
  if (label.toLowerCase() === 'languages' && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {value.map((lang, i) => (
          <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-jarvis-border/30">
            <span className="text-[10px] font-medium text-jarvis-text">{lang.language}</span>
            <span className="text-[9px] font-mono text-jarvis-accent px-1 bg-jarvis-accent/10 rounded">{lang.level}</span>
          </div>
        ))}
      </div>
    );
  }

  // Primitive Handling
  if (typeof value !== 'object') {
    if (typeof value === 'number' && value >= 0 && value <= 100 && depth > 0 && 
        !label.toLowerCase().includes('year') && !label.toLowerCase().includes('age') && 
        (label.toLowerCase().includes('progress') || label.toLowerCase().includes('rate'))) {
       return (
         <div className="flex items-center gap-2 py-0.5">
           <div className="flex-1 min-w-[60px]"><ProgressBar progress={value} height={4} /></div>
           <span className="text-[10px] font-mono text-jarvis-muted w-8 text-right">{value}%</span>
         </div>
       );
    }
    
    const formatted = formatValue(value, label);
    const isLongText = typeof value === 'string' && value.length > 100;

    return (
      <span className={[
        "text-jarvis-text/90 break-words leading-relaxed",
        isLongText ? "block mt-1 text-[11px] bg-white/[0.02] p-2 rounded border border-jarvis-border/30" : ""
      ].join(' ')}>
        {formatted}
      </span>
    );
  }

  // Array of primitives
  if (Array.isArray(value) && value.length > 0 && typeof value[0] !== 'object') {
    return (
      <div className="flex flex-wrap gap-1.5 py-1">
        {value.map((v, i) => (
          <span key={i} className="rounded-full bg-jarvis-muted/10 px-2 py-0.5 text-[10px] text-jarvis-muted border border-jarvis-border/40">
            {String(v)}
          </span>
        ))}
      </div>
    );
  }

  // Object/Array Handling with specific UI
  if (value.progress !== undefined || (value.current !== undefined && value.target !== undefined)) {
    const progress = value.progress ?? Math.round((value.current / value.target) * 100);
    return (
      <div className="space-y-1 py-1.5">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-jarvis-text font-medium">{value.title || value.name || label || 'Progress'}</span>
          <span className="text-jarvis-muted font-mono">{progress}%</span>
        </div>
        <ProgressBar progress={progress} height={5} />
        {(value.description || value.mission) && (
          <p className="text-[10px] text-jarvis-muted leading-relaxed mt-1.5 opacity-80 italic">
            {value.description || value.mission}
          </p>
        )}
      </div>
    );
  }

  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && Object.keys(value[0]).length > 2) {
    return <DataTable value={value} />;
  }

  const entries = Object.entries(value).filter(([k]) => !['id', 'dataKey', 'type'].includes(k));
  return (
    <div className="flex flex-col gap-1.5 mt-1 border-l border-jarvis-border/20 pl-3">
      {entries.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-0.5">
          <span className="text-jarvis-muted font-mono text-[9px] uppercase tracking-widest opacity-60">{k}</span>
          <div className="text-jarvis-text/90 text-[11px]">
            <DataRenderer value={v} depth={depth + 1} label={k} />
          </div>
        </div>
      ))}
    </div>
  );
});

const DatabaseNode = memo(function DatabaseNode({ node, depth = 0, combinedState, onViewNode, onEditNode, onDeleteNode }) {
  const toggleCanvasExpand = useUiStore((s) => s.toggleCanvasExpand);
  const setActiveDetailPath = useUiStore((s) => s.setActiveDetailPath);
  const isExpanded = useUiStore((s) => !!s.canvasExpansion[node.id]);
  const isVisible = useUiStore((s) => s.treeChecked[node.id] !== false);

  const data = useMemo(() => {
    if (node.dataKey) {
      return getNestedData(combinedState, node.dataKey);
    }
    return null;
  }, [node.dataKey, combinedState]);

  const hasChildren = node.children && node.children.length > 0;
  
  const Icon = useMemo(() => {
    if (node.isModule || hasChildren) return Database;
    if (Array.isArray(data)) return List;
    if (typeof data === 'object') return Hash;
    return FileText;
  }, [node.isModule, hasChildren, data]);

  if (!isVisible) return null;
  if (depth > MAX_DEPTH) return null;

  const isPrimitive = data !== null && typeof data !== 'object';
  const showLeafData = !hasChildren && data !== null;

  return (
    <div className="flex flex-col select-none">
      <div
        className={[
          "group flex items-center gap-2 rounded-md py-1.5 pr-2 transition-all duration-200 hover:bg-white/[0.04]",
          depth === 0 ? "mt-1 mb-0.5" : "my-0"
        ].join(' ')}
        style={{ paddingLeft: `${depth * 14}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="module-no-drag rounded p-0.5 text-jarvis-muted transition-colors duration-200 hover:bg-white/10 hover:text-jarvis-text"
            onClick={() => toggleCanvasExpand(node.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            )}
          </button>
        ) : (
          <div className="w-4.5" />
        )}
        
        <Icon className={`h-3.5 w-3.5 shrink-0 ${isExpanded ? 'text-jarvis-text' : 'text-jarvis-muted/70'}`} strokeWidth={1.5} />
        
        <div 
          className="flex min-w-0 flex-1 items-baseline gap-2 cursor-pointer group/label"
          onClick={() => (onViewNode ? onViewNode(node.id) : setActiveDetailPath(node.id))}
        >
          <span className={[
            "truncate text-[12px] tracking-tight transition-colors duration-200",
            isExpanded ? "font-semibold text-white" : "font-medium text-jarvis-text/80 group-hover/label:text-white",
            depth === 0 && "text-[13px]"
          ].join(' ')}>
            {node.label}
          </span>

          {showLeafData && isPrimitive && !node.label.toLowerCase().includes('progress') && (
            <span className="truncate text-[11px] text-jarvis-muted font-normal group-hover/label:text-jarvis-text/70 transition-colors">
              : {formatValue(data, node.label)}
            </span>
          )}
        </div>

        <div className="module-no-drag flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            type="button"
            aria-label={`View ${node.label}`}
            className="rounded p-1 text-jarvis-muted hover:bg-white/10 hover:text-jarvis-text"
            onClick={(event) => {
              event.stopPropagation();
              if (onViewNode) onViewNode(node.id);
              else setActiveDetailPath(node.id);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Edit ${node.label}`}
            className="rounded p-1 text-jarvis-muted hover:bg-white/10 hover:text-jarvis-text"
            onClick={(event) => {
              event.stopPropagation();
              onEditNode?.(node.id);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${node.label}`}
            className="rounded p-1 text-jarvis-muted hover:bg-white/10 hover:text-red-300"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteNode?.(node.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col border-l border-jarvis-border/20 ml-[7px] pl-4 mb-2">
          {node.label.toLowerCase() === 'messages' ? (
             <DataRenderer value={data} label={node.label} depth={depth + 1} />
          ) : (
            node.children.map((child) => (
              <DatabaseNode
                key={child.id}
                node={child}
                depth={depth + 1}
                combinedState={combinedState}
                onViewNode={onViewNode}
                onEditNode={onEditNode}
                onDeleteNode={onDeleteNode}
              />
            ))
          )}
        </div>
      )}

      {showLeafData && (!isPrimitive || node.label.toLowerCase().includes('progress') || (typeof data === 'string' && data.length > 100)) && (
        <div className="ml-[7px] pl-4 mb-2">
           <DataRenderer value={data} label={node.label} depth={depth + 1} />
        </div>
      )}
    </div>
  );
});

export default DatabaseNode;
