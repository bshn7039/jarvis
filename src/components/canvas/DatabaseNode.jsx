import { memo, useMemo } from 'react';
import { ChevronDown, ChevronRight, Hash, List, Database, FileText, Table, Folder } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { mockDatabase } from '../../data/mockDatabase';
import ProgressBar from '../ui/ProgressBar';

const MAX_DEPTH = 10;

function getNestedData(path) {
  if (!path) return null;
  const parts = path.split('.');
  let current = mockDatabase;
  for (const part of parts) {
    if (current && typeof current === 'object') {
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
                <td key={k} className="px-2 py-2 text-jarvis-text/80 truncate max-w-[150px]">
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

const DataRenderer = memo(function DataRenderer({ value, depth = 0, label }) {
  if (value === null || value === undefined) {
    return <span className="text-jarvis-muted/50 italic text-[10px]">empty</span>;
  }

  if (depth > MAX_DEPTH) return <span className="text-jarvis-muted italic">[Max Depth]</span>;

  // Primitive Handling
  if (typeof value !== 'object') {
    if (typeof value === 'number' && value >= 0 && value <= 100 && depth > 0 && !label?.toLowerCase().includes('year') && !label?.toLowerCase().includes('age')) {
       return (
         <div className="flex items-center gap-2 py-0.5">
           <div className="flex-1 min-w-[60px]"><ProgressBar progress={value} height={4} /></div>
           <span className="text-[10px] font-mono text-jarvis-muted w-8 text-right">{value}%</span>
         </div>
       );
    }
    return <span className="text-jarvis-text/90 break-words leading-relaxed">{String(value)}</span>;
  }

  // Object/Array Handling
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

const DatabaseNode = memo(function DatabaseNode({ node, depth = 0 }) {
  const toggleTreeExpand = useUiStore((s) => s.toggleTreeExpand);
  const isExpanded = useUiStore((s) => !!s.treeExpansion[node.id]);
  const isVisible = useUiStore((s) => s.treeChecked[node.id] !== false);

  const data = useMemo(() => {
    if (node.dataKey) {
      return getNestedData(node.dataKey);
    }
    return null;
  }, [node.dataKey]);

  if (!isVisible) return null;

  const hasChildren = node.children && node.children.length > 0;
  const showLeafData = !hasChildren && data !== null;

  const Icon = useMemo(() => {
    if (node.isModule) return Database;
    if (hasChildren) return Folder;
    if (Array.isArray(data)) return List;
    if (typeof data === 'object') return Hash;
    return FileText;
  }, [node.isModule, hasChildren, data]);

  if (depth > MAX_DEPTH) return null;

  return (
    <div className="flex flex-col select-none">
      <div
        className={[
          "flex items-center gap-2 rounded-md py-1.5 pr-2 transition-all duration-200 hover:bg-white/[0.04]",
          depth === 0 ? "mt-1 mb-0.5" : "my-0"
        ].join(' ')}
        style={{ paddingLeft: `${depth * 14}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="module-no-drag rounded p-0.5 text-jarvis-muted transition-colors duration-200 hover:bg-white/10 hover:text-jarvis-text"
            onClick={() => toggleTreeExpand(node.id)}
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
        <span className={[
          "min-w-0 flex-1 truncate text-[12px] tracking-tight",
          isExpanded ? "font-semibold text-white" : "font-medium text-jarvis-text/80",
          depth === 0 && "text-[13px]"
        ].join(' ')}>
          {node.label}
        </span>
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col border-l border-jarvis-border/20 ml-[7px] pl-4 mb-2">
          {node.children.map((child) => (
            <DatabaseNode
              key={child.id}
              node={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {showLeafData && (
        <div className="ml-[7px] pl-4 mb-2">
           <DataRenderer value={data} label={node.label} depth={depth + 1} />
        </div>
      )}
    </div>
  );
});

export default DatabaseNode;
