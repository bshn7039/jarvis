import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseModal from '../modals/BaseModal';
import { useCommandPaletteStore } from '../../store/commandPaletteStore';
import { useEntityStore } from '../../store/entityStore';
import { localDb, STORES } from '../../database/core/localDatabase';
import {
  Search,
  Sparkles,
  Terminal,
  CornerDownLeft,
  Target,
  ClipboardList,
  NotebookText,
  WalletCards,
  Handshake,
  GraduationCap,
  Activity,
  ArrowRight
} from 'lucide-react';

// Native fuzzy match
function fuzzyMatch(q, s) {
  if (!q) return false;
  q = q.toLowerCase();
  s = (s || '').toLowerCase();
  return s.includes(q);
}

// Icon mapper for categories
const CATEGORY_ICONS = {
  Tasks: ClipboardList,
  Goals: Target,
  Journal: NotebookText,
  Finance: WalletCards,
  CRM: Handshake,
  Academics: GraduationCap,
  'Natural Language Execution': Sparkles,
  action: Terminal,
};

// Colors mapping for category borders
const CATEGORY_COLORS = {
  Tasks: 'border-sky-500/20 text-sky-400 bg-sky-500/5',
  Goals: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
  Journal: 'border-pink-500/20 text-pink-400 bg-pink-500/5',
  Finance: 'border-amber-500/20 text-amber-400 bg-amber-500/5',
  CRM: 'border-teal-500/20 text-teal-400 bg-teal-500/5',
  Academics: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5',
  'Natural Language Execution': 'border-purple-500/20 text-purple-400 bg-purple-500/5',
  action: 'border-jarvis-muted/30 text-jarvis-muted bg-white/5',
};

export default function CommandPalette() {
  const { isOpen, open, close, actions } = useCommandPaletteStore();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Keybinding (Ctrl + K) to open Command Palette
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) close();
        else open();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, open, close]);

  // Focus the search input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Unified Multi-Store Search & Natural Language Parsing
  useEffect(() => {
    if (!isOpen) return;

    const performSearch = async () => {
      setIsLoading(true);
      try {
        const pool = [];

        // 1. If empty query, show pre-registered static actions
        if (!query.trim()) {
          const defaultActions = (actions || []).map(a => ({
            ...a,
            category: a.category || 'action',
            type: 'action'
          }));
          setResults(defaultActions.slice(0, 10));
          setIsLoading(false);
          return;
        }

        // 2. Local Natural Language Commanding Engine
        const nlResults = await parseNaturalLanguageCommand(query);
        if (nlResults && nlResults.length > 0) {
          pool.push(...nlResults);
        }

        // 3. Dynamic Parallel Multi-Store Search Ingestions
        const [tasks, goals, journals, transactions, crm, academics] = await Promise.all([
          localDb.getAll(STORES.TASKS),
          localDb.getAll(STORES.GOALS),
          localDb.getAll(STORES.JOURNAL_ENTRIES),
          localDb.getAll(STORES.FINANCE_TRANSACTIONS),
          localDb.getAll(STORES.CRM_CONTACTS),
          localDb.getAll(STORES.ACADEMIC_SUBJECTS)
        ]);

        // Search Tasks
        tasks.forEach(t => {
          if (fuzzyMatch(query, t.title) || fuzzyMatch(query, t.category) || fuzzyMatch(query, t.notes)) {
            pool.push({
              type: 'task',
              id: t.id,
              title: t.title,
              subtitle: `Task • Priority: ${t.priority || 'Normal'} • Bucket: ${t.bucket || 'Inbox'}`,
              category: 'Tasks',
              data: t
            });
          }
        });

        // Search Goals
        goals.forEach(g => {
          if (fuzzyMatch(query, g.title) || fuzzyMatch(query, g.description)) {
            pool.push({
              type: 'goal',
              id: g.id,
              title: g.title,
              subtitle: `Goal • Progress: ${g.progress || 0}% • Priority: ${g.priority || 'Medium'}`,
              category: 'Goals',
              data: g
            });
          }
        });

        // Search Journal Entries
        journals.forEach(j => {
          if (fuzzyMatch(query, j.title) || fuzzyMatch(query, j.content) || (j.tags && j.tags.some(tag => fuzzyMatch(query, tag)))) {
            pool.push({
              type: 'journal',
              id: j.id,
              title: j.title || 'Untitled Journal Entry',
              subtitle: `Journal • ${new Date(j.createdAt || j.date).toLocaleDateString()} • Mood: ${j.mood || 'normal'}`,
              category: 'Journal',
              data: j
            });
          }
        });

        // Search Finance Transactions
        transactions.forEach(t => {
          if (fuzzyMatch(query, t.title) || fuzzyMatch(query, t.category) || fuzzyMatch(query, t.merchant)) {
            pool.push({
              type: 'finance',
              id: t.id,
              title: `${t.type === 'debit' ? '-' : '+'}₹${t.amount} to ${t.title || t.merchant}`,
              subtitle: `Finance • ${t.category} • Date: ${new Date(t.date).toLocaleDateString()}`,
              category: 'Finance',
              data: t
            });
          }
        });

        // Search CRM Contacts
        crm.forEach(c => {
          if (fuzzyMatch(query, c.name) || fuzzyMatch(query, c.company) || fuzzyMatch(query, c.role)) {
            pool.push({
              type: 'crm',
              id: c.id,
              title: c.name,
              subtitle: `CRM Contact • ${c.role || 'Contact'} at ${c.company || 'Private'}`,
              category: 'CRM',
              data: c
            });
          }
        });

        // Search Academic Subjects
        academics.forEach(a => {
          if (fuzzyMatch(query, a.name) || fuzzyMatch(query, a.code)) {
            pool.push({
              type: 'academic',
              id: a.id,
              title: `${a.code || ''} ${a.name}`,
              subtitle: `Academic Subject • Credits: ${a.credits || 0}`,
              category: 'Academics',
              data: a
            });
          }
        });

        // Filter standard actions if they match query
        (actions || []).forEach(a => {
          if (fuzzyMatch(query, a.title) || fuzzyMatch(query, a.id)) {
            pool.push({
              ...a,
              category: a.category || 'action',
              type: 'action'
            });
          }
        });

        // Unique results filter and slice limit
        const uniquePool = [];
        const seen = new Set();
        pool.forEach(item => {
          const key = `${item.type}:${item.id || item.title}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniquePool.push(item);
          }
        });

        setResults(uniquePool.slice(0, 15));
        setSelectedIndex(0);
      } catch (err) {
        console.error('[Search] Command palette index failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(performSearch, 150);
    return () => clearTimeout(timer);
  }, [query, actions, isOpen]);

  // Natural Language Commanding Processor
  const parseNaturalLanguageCommand = async (q) => {
    const qLower = q.toLowerCase();
    
    // 1. "show overdue fitness tasks"
    if (qLower.includes('overdue') && (qLower.includes('task') || qLower.includes('tasks'))) {
      const tasks = await localDb.getAll(STORES.TASKS);
      const today = new Date().toISOString().slice(0, 10);
      const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate.slice(0, 10) < today);
      
      const isFitness = qLower.includes('fitness') || qLower.includes('gym') || qLower.includes('workout');
      const filtered = isFitness
        ? overdue.filter(t => t.category?.toLowerCase() === 'fitness' || t.category?.toLowerCase() === 'gym' || t.category?.toLowerCase() === 'routines')
        : overdue;

      return filtered.map(t => ({
        type: 'task',
        id: t.id,
        title: t.title,
        subtitle: `Overdue Task • Due: ${t.dueDate.slice(0, 10)} • Priority: ${t.priority || 'Normal'}`,
        category: 'Natural Language Execution',
        data: t
      }));
    }

    // 2. "open all finance logs from april"
    if (qLower.includes('finance') || qLower.includes('spending') || qLower.includes('transaction') || qLower.includes('transactions')) {
      const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      
      let monthIndex = -1;
      months.forEach((m, i) => { if (qLower.includes(m)) monthIndex = i; });
      if (monthIndex === -1) {
        shortMonths.forEach((m, i) => { if (qLower.includes(m)) monthIndex = i; });
      }

      if (monthIndex !== -1) {
        const transactions = await localDb.getAll(STORES.FINANCE_TRANSACTIONS);
        const filtered = transactions.filter(t => new Date(t.date).getMonth() === monthIndex);
        return filtered.map(t => ({
          type: 'finance',
          id: t.id,
          title: `${t.type === 'debit' ? '-' : '+'}₹${t.amount} to ${t.title || t.merchant}`,
          subtitle: `Transaction • logged in ${months[monthIndex].toUpperCase()} • Category: ${t.category}`,
          category: 'Natural Language Execution',
          data: t
        }));
      }
    }

    // 3. "find journal entries mentioning burnout"
    if (qLower.includes('journal') || qLower.includes('entries') || qLower.includes('entry')) {
      let keyword = '';
      const matches = qLower.match(/(?:mentioning|about|containing|with|for)\s+([a-zA-Z0-9_-]+)/);
      if (matches && matches[1]) {
        keyword = matches[1];
      } else {
        const words = qLower.trim().split(/\s+/);
        keyword = words[words.length - 1];
      }

      if (keyword && keyword !== 'journal' && keyword !== 'entries' && keyword !== 'entry') {
        const journals = await localDb.getAll(STORES.JOURNAL_ENTRIES);
        const filtered = journals.filter(j => 
          fuzzyMatch(keyword, j.title) || 
          fuzzyMatch(keyword, j.content) || 
          (j.tags && j.tags.some(t => fuzzyMatch(keyword, t)))
        );

        return filtered.map(j => ({
          type: 'journal',
          id: j.id,
          title: j.title || 'Untitled Journal Entry',
          subtitle: `Journal entry mentioning "${keyword}" • Sentiment: ${j.sentiment || 'neutral'}`,
          category: 'Natural Language Execution',
          data: j
        }));
      }
    }

    return null;
  };

  // Keyboard navigation & trigger handling
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleTriggerResult(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      close();
    }
  };

  // Jump-to-Entity Router & Actions Execution
  const handleTriggerResult = (result) => {
    close();
    
    if (result.type === 'action') {
      result.onTrigger?.();
      return;
    }

    // Interactive routing and modal triggers
    if (result.type === 'task') {
      useEntityStore.getState().openEditModal('task', result.id);
      navigate('/tasks');
    } else if (result.type === 'goal') {
      useEntityStore.getState().openEditModal('goal', result.id);
      navigate('/goals');
    } else if (result.type === 'journal') {
      useEntityStore.getState().openDetailPanel('journal', result.id);
      navigate('/journal');
    } else if (result.type === 'finance') {
      navigate('/finance', { state: { highlightTransactionId: result.id } });
    } else if (result.type === 'crm') {
      navigate('/crm', { state: { highlightContactId: result.id } });
    } else if (result.type === 'academic') {
      navigate('/academics', { state: { highlightSubjectId: result.id } });
    }
  };

  // Pre-selected scroll alignment helper
  useEffect(() => {
    const selectedElement = containerRef.current?.children[selectedIndex];
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <BaseModal open={isOpen} onClose={close} size="lg" ariaLabel="Universal search & command palette">
      <div className="flex flex-col gap-4 p-1">
        {/* Sleek Search Header */}
        <div className="relative flex items-center border-b border-jarvis-border/60 pb-3">
          <Search className="absolute left-3 h-4.5 w-4.5 text-jarvis-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onKeyDown={handleKeyDown}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search everything (tasks, journal, crm)..."
            className="w-full bg-transparent pl-10 pr-12 text-sm text-jarvis-text placeholder-jarvis-muted focus:outline-none"
          />
          <div className="absolute right-2 flex items-center gap-1 rounded bg-white/5 border border-jarvis-border px-1.5 py-0.5 text-[10px] text-jarvis-muted select-none">
            ESC
          </div>
        </div>

        {/* Categories Results Listing */}
        <div 
          ref={containerRef}
          className="flex flex-col gap-1.5 max-h-[380px] min-h-[120px] overflow-y-auto pr-1 select-none"
        >
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center py-10 text-xs text-jarvis-muted">
              Searching data core...
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
              <Search className="h-6 w-6 text-jarvis-muted/40 animate-pulse" />
              <p className="text-xs text-jarvis-text">No results found for "{query}"</p>
              <p className="text-[10px] text-jarvis-muted leading-relaxed max-w-[280px]">
                Try asking a question like <span className="text-jarvis-muted font-mono italic">"show overdue tasks"</span> or look up direct contacts.
              </p>
            </div>
          ) : (
            results.map((r, index) => {
              const IconComponent = CATEGORY_ICONS[r.category] || Terminal;
              const colorStyle = CATEGORY_COLORS[r.category] || 'border-white/10 text-jarvis-text bg-white/5';
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={`${r.type}:${r.id || r.title}`}
                  onClick={() => handleTriggerResult(r)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-start justify-between rounded-xl border p-3 text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-jarvis-accent/40 bg-jarvis-accent/10 shadow-[0_2px_12px_rgba(125,211,252,0.06)]'
                      : 'border-jarvis-border/40 bg-white/[0.01] hover:border-jarvis-border/80 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`mt-0.5 rounded-lg border p-1.5 ${colorStyle}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className={`text-xs font-semibold truncate ${isSelected ? 'text-jarvis-accent' : 'text-jarvis-text'}`}>
                        {r.title || r.id}
                      </p>
                      <p className="text-[10px] text-jarvis-muted truncate">
                        {r.subtitle || r.category || 'System Action'}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[10px] text-jarvis-accent font-semibold tracking-wider uppercase animate-fade-in pl-2">
                      Jump <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Visual Footer Hints */}
        <div className="flex items-center justify-between border-t border-jarvis-border/60 pt-3 text-[10px] text-jarvis-muted select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" /> trigger
            </span>
            <span className="flex items-center gap-1">
              ↑↓ navigate
            </span>
          </div>
          <p className="italic">JARVIS commanding palette v2.0</p>
        </div>
      </div>
    </BaseModal>
  );
}
