import { useState, useCallback, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { useMutualFundStore } from '../../store/mutualFundStore';

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function MutualFundModal({ open, onClose }) {
  const addFund = useMutualFundStore(s => s.addFund);
  const searchFunds = useMutualFundStore(s => s.searchFunds);

  const [step, setStep] = useState(1); // 1=search, 2=purchase details
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [purchase, setPurchase] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    nav: '',
  });

  const debouncedSearch = useCallback(
    debounce(async (q) => {
      if (!q || q.length < 2) { setSearchResults([]); return; }
      setIsSearching(true);
      const results = await searchFunds(q);
      setSearchResults(results);
      setIsSearching(false);
    }, 400),
    [searchFunds]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSelectFund = (fund) => {
    setSelectedFund(fund);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFund || !purchase.amount || !purchase.nav) return;
    setIsSaving(true);
    try {
      await addFund({
        schemeName: selectedFund.schemeName,
        schemeCode: selectedFund.schemeCode,
        purchase: {
          date: purchase.date,
          amount: Number(purchase.amount),
          nav: Number(purchase.nav),
        },
      });
      handleClose();
    } catch (err) {
      console.error('Failed to add fund:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFund(null);
    setPurchase({ date: new Date().toISOString().slice(0, 10), amount: '', nav: '' });
    onClose();
  };

  return (
    <BaseModal open={open} onClose={handleClose} ariaLabel="Add Mutual Fund">
      <div className="flex items-center gap-2 mb-4">
        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-jarvis-muted hover:text-jarvis-text text-xs transition"
          >
            ← Back
          </button>
        )}
        <h2 className="text-lg font-semibold">
          {step === 1 ? '📈 Add Mutual Fund' : '💵 First Purchase Details'}
        </h2>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div className="relative">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search fund name... (e.g. Nippon Small Cap)"
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2.5 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none focus:border-jarvis-accent/50"
            />
            {isSearching && (
              <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-jarvis-accent/30 border-t-jarvis-accent" />
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-jarvis-border bg-black/20 divide-y divide-jarvis-border/50">
              {searchResults.map(fund => (
                <button
                  key={fund.schemeCode}
                  type="button"
                  onClick={() => handleSelectFund(fund)}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition"
                >
                  <p className="text-sm text-jarvis-text leading-snug">{fund.schemeName}</p>
                  <p className="text-[10px] text-jarvis-muted mt-0.5">Code: {fund.schemeCode}</p>
                </button>
              ))}
            </div>
          )}

          {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-center text-xs text-jarvis-muted py-4">No funds found. Try a different name.</p>
          )}

          {searchQuery.length === 0 && (
            <p className="text-center text-xs text-jarvis-muted py-4 italic">
              Start typing to search from 40,000+ mutual funds via MFAPI
            </p>
          )}
        </div>
      )}

      {step === 2 && selectedFund && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected fund info */}
          <div className="rounded-xl border border-jarvis-accent/30 bg-jarvis-accent/5 p-3">
            <p className="text-xs font-medium text-jarvis-accent">{selectedFund.schemeName}</p>
            <p className="text-[10px] text-jarvis-muted mt-0.5">Code: {selectedFund.schemeCode}</p>
          </div>

          <p className="text-xs text-jarvis-muted">Enter your first SIP/lumpsum purchase details:</p>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-jarvis-muted">Purchase Date</span>
              <input
                type="date"
                required
                value={purchase.date}
                onChange={e => setPurchase(p => ({ ...p, date: e.target.value }))}
                className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-jarvis-muted">Amount Invested (₹)</span>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={purchase.amount}
                onChange={e => setPurchase(p => ({ ...p, amount: e.target.value }))}
                className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
                placeholder="e.g. 1500"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">NAV on Purchase Date (₹)</span>
            <input
              type="number"
              required
              min="0.01"
              step="0.0001"
              value={purchase.nav}
              onChange={e => setPurchase(p => ({ ...p, nav: e.target.value }))}
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
              placeholder="e.g. 123.45 (check your statement / AMC site)"
            />
          </label>

          {purchase.amount && purchase.nav && Number(purchase.nav) > 0 && (
            <div className="rounded-lg bg-black/20 border border-jarvis-border px-3 py-2 text-xs text-jarvis-muted">
              Units allocated: <span className="text-jarvis-text font-medium">
                {(Number(purchase.amount) / Number(purchase.nav)).toFixed(4)}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded border border-jarvis-border px-3 py-1.5 text-xs text-jarvis-muted transition hover:text-jarvis-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded border border-jarvis-border bg-jarvis-accent/20 px-4 py-1.5 text-xs text-jarvis-accent transition hover:bg-jarvis-accent/30 disabled:opacity-50"
            >
              {isSaving ? 'Adding...' : 'Add Fund'}
            </button>
          </div>
        </form>
      )}
    </BaseModal>
  );
}
