import { useState } from 'react';
import { RefreshCw, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useMutualFundStore } from '../../store/mutualFundStore';
import BaseModal from '../modals/BaseModal';
import MutualFundAiInsights from './MutualFundAiInsights';

function fmt(n, digits = 0) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: digits });
}

function fmtRs(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return '₹' + fmt(n, 0);
}

function colorClass(val) {
  if (val === null || val === undefined) return 'text-jarvis-muted';
  return val >= 0 ? 'text-emerald-400' : 'text-red-400';
}

function signedFmt(val, suffix = '') {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}${suffix}`;
}

// ── Add SIP/Purchase Modal ─────────────────────────────────────────
function AddPurchaseModal({ open, onClose, fundId, fundName }) {
  const addPurchase = useMutualFundStore(s => s.addPurchase);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    nav: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await addPurchase(fundId, {
      date: form.date,
      amount: Number(form.amount),
      nav: Number(form.nav),
    });
    setSaving(false);
    setForm({ date: new Date().toISOString().slice(0, 10), amount: '', nav: '' });
    onClose();
  };

  return (
    <BaseModal open={open} onClose={onClose} ariaLabel="Add SIP">
      <h2 className="text-base font-semibold mb-3">+ Add SIP / Lumpsum</h2>
      <p className="text-xs text-jarvis-muted mb-4 line-clamp-2">{fundName}</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wide text-jarvis-muted">Date</span>
          <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">Amount (₹)</span>
            <input type="number" required min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none" placeholder="1500" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">NAV (₹)</span>
            <input type="number" required min="0.01" step="0.0001" value={form.nav} onChange={e => setForm(f => ({ ...f, nav: e.target.value }))}
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none" placeholder="123.45" />
          </label>
        </div>
        {form.amount && form.nav && Number(form.nav) > 0 && (
          <p className="text-xs text-jarvis-muted">Units: <span className="text-jarvis-text">{(Number(form.amount) / Number(form.nav)).toFixed(4)}</span></p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded border border-jarvis-border px-3 py-1.5 text-xs text-jarvis-muted hover:text-jarvis-text transition">Cancel</button>
          <button type="submit" disabled={saving} className="rounded border border-jarvis-border bg-jarvis-accent/20 px-3 py-1.5 text-xs text-jarvis-accent hover:bg-jarvis-accent/30 transition disabled:opacity-50">
            {saving ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// ── Fund Row ───────────────────────────────────────────────────────
function FundRow({ fund }) {
  const computeFundStats = useMutualFundStore(s => s.computeFundStats);
  const deleteFund = useMutualFundStore(s => s.deleteFund);
  const deletePurchase = useMutualFundStore(s => s.deletePurchase);
  // Direct subscription to guarantee reactivity when NAV changes
  const navData = useMutualFundStore(s => s.liveNAVs[fund.schemeCode]);
  const [expanded, setExpanded] = useState(false);
  const [addSipOpen, setAddSipOpen] = useState(false);

  const stats = computeFundStats(fund);

  return (
    <>
      <article className="rounded-2xl border border-jarvis-border bg-jarvis-panel overflow-hidden">
        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-jarvis-text leading-snug line-clamp-2">{fund.schemeName}</p>
            <p className="text-[10px] text-jarvis-muted mt-0.5">Code: {fund.schemeCode} · {fund.purchases?.length || 0} purchase(s) · {stats.totalUnits} units</p>
          </div>
          <div className="flex items-center gap-2">
            {expanded ? <ChevronUp className="h-4 w-4 text-jarvis-muted" /> : <ChevronDown className="h-4 w-4 text-jarvis-muted" />}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px border-t border-jarvis-border/60 bg-jarvis-border/20 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { label: 'Invested', value: fmtRs(stats.totalInvested), cls: 'text-jarvis-text' },
            { label: 'Current', value: stats.currentValue !== null ? fmtRs(stats.currentValue) : '...', cls: 'text-jarvis-text' },
            { label: 'Returns', value: stats.returns !== null ? fmtRs(stats.returns) : '—', cls: colorClass(stats.returns) },
            { label: 'Returns %', value: stats.returnsPercent !== null ? signedFmt(stats.returnsPercent, '%') : '—', cls: colorClass(stats.returnsPercent) },
            { label: 'Day Change', value: stats.dayChange !== null ? fmtRs(stats.dayChange) : '—', cls: colorClass(stats.dayChange) },
            { label: 'Day %', value: stats.dayChangePct !== null ? signedFmt(stats.dayChangePct, '%') : '—', cls: colorClass(stats.dayChangePct) },
            { label: 'XIRR', value: stats.xirr !== null ? signedFmt(stats.xirr, '%') : '—', cls: colorClass(stats.xirr) },
          ].map(cell => (
            <div key={cell.label} className="flex flex-col items-center justify-center bg-jarvis-panel p-3">
              <p className={`text-sm font-semibold ${cell.cls}`}>{cell.value}</p>
              <p className="text-[9px] uppercase tracking-wider text-jarvis-muted mt-0.5">{cell.label}</p>
            </div>
          ))}
        </div>

        {/* NAV date + current NAV */}
        <div className="px-4 py-2 border-t border-jarvis-border/40 flex items-center justify-between text-[10px] text-jarvis-muted">
          <span>
            {stats.latestNAV ? `NAV: ₹${stats.latestNAV?.toFixed(4)} as of ${stats.navDate}` : 'NAV data loading or offline'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setAddSipOpen(true); }}
              className="flex items-center gap-1 hover:text-jarvis-accent transition"
            >
              <Plus className="h-3 w-3" /> SIP
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this fund and all its purchases?')) deleteFund(fund.id); }}
              className="flex items-center gap-1 hover:text-red-400 transition"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        </div>

        {/* Purchases list (expanded) */}
        {expanded && (
          <div className="border-t border-jarvis-border/60 bg-black/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-jarvis-text">Purchase History</p>
              <button
                onClick={() => setAddSipOpen(true)}
                className="flex items-center gap-1 rounded-md border border-jarvis-border px-2 py-1 text-[10px] text-jarvis-muted hover:text-jarvis-accent hover:border-jarvis-accent/40 transition"
              >
                <Plus className="h-3 w-3" /> Add SIP / Lumpsum
              </button>
            </div>
            <div className="space-y-2">
              {(fund.purchases || [])
                .sort((a, b) => b.date.localeCompare(a.date))
                .map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-xs border border-jarvis-border/40">
                    <div className="flex gap-4">
                      <span className="text-jarvis-muted">{p.date}</span>
                      <span className="text-jarvis-text font-medium">₹{fmt(p.amount)}</span>
                      <span className="text-jarvis-muted">@ ₹{p.nav}</span>
                      <span className="text-jarvis-muted">{p.units} units</span>
                    </div>
                    <button
                      onClick={() => deletePurchase(fund.id, p.id)}
                      className="text-jarvis-muted hover:text-red-400 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              {(!fund.purchases || fund.purchases.length === 0) && (
                <p className="text-xs text-jarvis-muted text-center py-2 italic">No purchases yet.</p>
              )}
            </div>
          </div>
        )}
      </article>

      <AddPurchaseModal
        open={addSipOpen}
        onClose={() => setAddSipOpen(false)}
        fundId={fund.id}
        fundName={fund.schemeName}
      />
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function MutualFundTracker({ onAddFund }) {
  const funds = useMutualFundStore(s => s.funds);
  const isLoadingNAV = useMutualFundStore(s => s.isLoadingNAV);
  const refreshAllNAVs = useMutualFundStore(s => s.refreshAllNAVs);
  const getPortfolioTotals = useMutualFundStore(s => s.getPortfolioTotals);
  const lastNAVFetch = useMutualFundStore(s => s.lastNAVFetch);
  // Direct subscription to liveNAVs to guarantee overall portfolio recalculations react reactively
  const liveNAVs = useMutualFundStore(s => s.liveNAVs);

  const totals = getPortfolioTotals();

  return (
    <div className="space-y-4">
      {/* Portfolio Summary Bar */}
      <div className="rounded-2xl border border-jarvis-border bg-gradient-to-br from-jarvis-panel to-black/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-jarvis-text">Mutual Fund Portfolio</h3>
            <p className="text-[11px] text-jarvis-muted mt-0.5">
              {funds.length} fund{funds.length !== 1 ? 's' : ''} tracked · Live NAV via MFAPI
              {lastNAVFetch && (
                <span> · Last refreshed: {new Date(lastNAVFetch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
              {!isLoadingNAV && <span className="opacity-50"> (auto-refreshes every 12h)</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshAllNAVs}
              disabled={isLoadingNAV}
              className="flex items-center gap-1.5 rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-muted hover:text-jarvis-text transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingNAV ? 'animate-spin' : ''}`} />
              {isLoadingNAV ? 'Refreshing...' : 'Refresh NAV'}
            </button>
            <button
              onClick={onAddFund}
              className="flex items-center gap-1.5 rounded-lg border border-jarvis-accent/40 bg-jarvis-accent/10 px-3 py-1.5 text-xs text-jarvis-accent hover:bg-jarvis-accent/20 transition"
            >
              <Plus className="h-3 w-3" /> Add Fund
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-black/30 p-3 border border-jarvis-border/50">
            <p className="text-xs text-jarvis-muted">Total Invested</p>
            <p className="text-lg font-bold text-jarvis-text mt-1">{fmtRs(totals.totalInvested)}</p>
          </div>
          <div className="rounded-xl bg-black/30 p-3 border border-jarvis-border/50">
            <p className="text-xs text-jarvis-muted">Current Value</p>
            <p className="text-lg font-bold text-jarvis-text mt-1">{fmtRs(totals.totalCurrentValue)}</p>
          </div>
          <div className={`rounded-xl p-3 border ${totals.totalReturns >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <p className="text-xs text-jarvis-muted">Total Returns</p>
            <p className={`text-lg font-bold mt-1 ${colorClass(totals.totalReturns)}`}>
              {totals.totalReturns >= 0 ? '+' : ''}{fmtRs(totals.totalReturns)}
            </p>
          </div>
          <div className={`rounded-xl p-3 border ${totals.totalReturnsPercent >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <p className="text-xs text-jarvis-muted">Overall Return</p>
            <p className={`text-lg font-bold mt-1 ${colorClass(totals.totalReturnsPercent)}`}>
              {signedFmt(totals.totalReturnsPercent, '%')}
            </p>
          </div>
        </div>
      </div>

      {/* AI Portfolio Insights */}
      <MutualFundAiInsights />

      {/* Fund list */}
      {funds.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-jarvis-border bg-jarvis-panel/20 py-16">
          <p className="text-sm text-jarvis-text font-medium">No funds tracked yet</p>
          <p className="text-xs text-jarvis-muted mt-1">Add your first mutual fund to start tracking</p>
          <button
            onClick={onAddFund}
            className="mt-4 flex items-center gap-1.5 rounded-lg border border-jarvis-accent/40 bg-jarvis-accent/10 px-4 py-2 text-xs text-jarvis-accent hover:bg-jarvis-accent/20 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add Fund
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {funds.map(fund => (
            <FundRow key={fund.id} fund={fund} />
          ))}
        </div>
      )}
    </div>
  );
}
