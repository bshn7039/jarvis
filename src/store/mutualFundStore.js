import { create } from 'zustand';
import { mutualFundService } from '../database/services/mutualFundService';
import { deepClone } from '../utils/deepClone';
import { localDb, STORES } from '../database/core/localDatabase';

// ── XIRR via Newton-Raphson with multiple seed guesses ─────────────
// cashflows must be sorted by date ascending.
// Outflows (investments) = negative, final inflow (current value) = positive.
function xirr(cashflows) {
  if (!cashflows || cashflows.length < 2) return null;

  // Sort by date
  const sorted = [...cashflows].sort((a, b) => a.date.localeCompare(b.date));

  const t0 = new Date(sorted[0].date).getTime();

  // Convert each cashflow date to years elapsed from first date
  const yrs = sorted.map(cf =>
    (new Date(cf.date).getTime() - t0) / (365.25 * 24 * 3600 * 1000)
  );
  const amounts = sorted.map(cf => cf.amount);

  // f(r)  = Σ  Ci / (1+r)^yi
  const f = (r) => amounts.reduce((s, c, i) => s + c / Math.pow(1 + r, yrs[i]), 0);

  // f'(r) = Σ -yi * Ci / (1+r)^(yi+1)
  const df = (r) => amounts.reduce((s, c, i) =>
    s - yrs[i] * c / Math.pow(1 + r, yrs[i] + 1), 0);

  // Try several starting guesses to avoid convergence to wrong root
  const seeds = [0.1, 0.5, 0.0, -0.05, 1.0, -0.5];
  for (const seed of seeds) {
    let r = seed;
    let converged = false;

    for (let iter = 0; iter < 300; iter++) {
      // Guard: rate can't be ≤ -1 (undefined for (1+r)^y)
      if (r <= -1) { r = -0.9999; }

      const fv = f(r);
      const dfv = df(r);

      if (!isFinite(fv) || !isFinite(dfv)) break;
      if (Math.abs(dfv) < 1e-12) break;

      const step = fv / dfv;
      r -= step;

      if (Math.abs(step) < 1e-8) {
        converged = true;
        break;
      }
    }

    if (converged && isFinite(r) && r > -1 && r < 100) {
      // Sanity check: f(r) should be near zero
      if (Math.abs(f(r)) < 1) {
        return parseFloat((r * 100).toFixed(2));
      }
    }
  }

  return null;
}

// ── NAV cache: persist last-fetch timestamp in localStorage ─────────
const NAV_CACHE_KEY = 'jarvis_mf_nav_cache';
const NAV_STALE_MS  = 12 * 60 * 60 * 1000; // 12 hours

function loadNavCache() {
  try {
    const raw = localStorage.getItem(NAV_CACHE_KEY);
    return raw ? JSON.parse(raw) : { navs: {}, fetchedAt: null };
  } catch {
    return { navs: {}, fetchedAt: null };
  }
}

function saveNavCache(navs) {
  try {
    localStorage.setItem(NAV_CACHE_KEY, JSON.stringify({ navs, fetchedAt: Date.now() }));
  } catch { /* quota full – ignore */ }
}

function isCacheStale() {
  try {
    const raw = localStorage.getItem(NAV_CACHE_KEY);
    if (!raw) return true;
    const { fetchedAt } = JSON.parse(raw);
    if (!fetchedAt) return true;
    return Date.now() - fetchedAt > NAV_STALE_MS;
  } catch {
    return true;
  }
}

const MFAPI_BASE = 'https://api.mfapi.in/mf';

const initialState = {
  funds: [],
  liveNAVs: {},       // { schemeCode: { nav, prevNav, date, schemeName } }
  isHydrated: false,
  isLoadingNAV: false,
  lastNAVFetch: null, // ISO string of last successful fetch
};

export const useMutualFundStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      let funds = await mutualFundService.getAll();

      // Auto-seed default funds if none are tracked yet to populate the user's portfolio immediately
      const seedFlag = await localDb.getById(STORES.METADATA, 'mutual-funds-seeded') || { id: 'mutual-funds-seeded', seeded: false };
      if (!seedFlag.seeded && funds.length === 0) {
        const defaultFunds = [
          {
            id: 'mf-seed-1',
            schemeName: 'Nippon India Small Cap Fund Direct Growth',
            schemeCode: '118778',
            purchases: [{ id: 'p-seed-1-1', date: '2026-04-15', amount: 1500, nav: 101.58, units: 14.7667 }]
          },
          {
            id: 'mf-seed-2',
            schemeName: 'Axis Midcap Direct Plan Growth',
            schemeCode: '120524',
            purchases: [{ id: 'p-seed-2-1', date: '2026-04-16', amount: 1500, nav: 71.91, units: 20.8594 }]
          },
          {
            id: 'mf-seed-3',
            schemeName: 'Mirae Asset Large Cap Fund Direct Growth',
            schemeCode: '119027',
            purchases: [{ id: 'p-seed-3-1', date: '2026-04-17', amount: 1500, nav: 23.10, units: 64.9351 }]
          },
          {
            id: 'mf-seed-4',
            schemeName: 'SBI Equity Hybrid Fund Direct Plan Growth',
            schemeCode: '119842',
            purchases: [{ id: 'p-seed-4-1', date: '2026-04-18', amount: 2500, nav: 25.91, units: 96.4878 }]
          },
          {
            id: 'mf-seed-5',
            schemeName: 'Kotak Arbitrage Fund Direct Growth',
            schemeCode: '119640',
            purchases: [{ id: 'p-seed-5-1', date: '2026-04-19', amount: 6000, nav: 5.65, units: 1061.9469 }]
          },
          {
            id: 'mf-seed-6',
            schemeName: 'Parag Parikh Flexi Cap Fund Direct Growth',
            schemeCode: '122639',
            purchases: [{ id: 'p-seed-6-1', date: '2026-04-20', amount: 5000, nav: 2.15, units: 2325.5814 }]
          }
        ];
        
        await Promise.all(defaultFunds.map(f => mutualFundService.create(f)));
        funds = await mutualFundService.getAll();
        await localDb.put(STORES.METADATA, { id: 'mutual-funds-seeded', seeded: true });
      } else if (!seedFlag.seeded) {
        await localDb.put(STORES.METADATA, { id: 'mutual-funds-seeded', seeded: true });
      }

      // Restore cached NAVs immediately so UI shows data without a network hit
      const cache = loadNavCache();
      const liveNAVs = cache.navs || {};

      set({ funds, liveNAVs, isHydrated: true, lastNAVFetch: cache.fetchedAt ? new Date(cache.fetchedAt).toISOString() : null });

      // Only refresh from MFAPI if cache is older than 12 hours
      if (funds.length > 0 && isCacheStale()) {
        await get().refreshAllNAVs();
      }
    } catch (err) {
      console.error('Failed to hydrate mutual funds:', err);
    }
  },

  // Search MFAPI for a fund by name
  searchFunds: async (query) => {
    if (!query || query.length < 2) return [];
    try {
      const res = await fetch(`${MFAPI_BASE}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      return (data || []).slice(0, 20);
    } catch (err) {
      console.error('MFAPI search error:', err);
      return [];
    }
  },

  // Fetch latest NAV for one scheme (always hits network — used internally)
  fetchLiveNAV: async (schemeCode) => {
    try {
      const res = await fetch(`${MFAPI_BASE}/${schemeCode}`);
      if (!res.ok) throw new Error(`NAV fetch failed for ${schemeCode}`);
      const data = await res.json();
      const latest   = data.data?.[0];
      const previous = data.data?.[1];
      if (!latest) return null;

      const navData = {
        nav:        parseFloat(latest.nav),
        prevNav:    previous ? parseFloat(previous.nav) : parseFloat(latest.nav),
        date:       latest.date,
        schemeName: data.meta?.scheme_name || '',
      };

      set(state => ({
        liveNAVs: { ...state.liveNAVs, [schemeCode]: navData }
      }));
      return navData;
    } catch (err) {
      console.error('MFAPI NAV error:', err);
      return null;
    }
  },

  // Refresh all NAVs from network; updates localStorage cache with timestamp
  refreshAllNAVs: async () => {
    set({ isLoadingNAV: true });
    const funds = get().funds;
    await Promise.allSettled(
      funds.map(f => get().fetchLiveNAV(f.schemeCode))
    );
    // Persist to cache so next app load within 12 hours skips the fetch
    const freshNAVs = get().liveNAVs;
    saveNavCache(freshNAVs);
    set({
      isLoadingNAV: false,
      lastNAVFetch: new Date().toISOString(),
    });
  },

  // Add a new fund with one or more initial purchases
  addFund: async ({ schemeName, schemeCode, purchase, purchases }) => {
    let finalPurchases = [];
    if (Array.isArray(purchases)) {
      finalPurchases = purchases.map((p, idx) => {
        const units = p.nav > 0 ? parseFloat((p.amount / p.nav).toFixed(4)) : 0;
        return {
          id: `p-${Date.now()}-${idx}`,
          date: p.date,
          amount: Number(p.amount),
          nav: Number(p.nav),
          units,
        };
      });
    } else if (purchase) {
      const units = purchase.nav > 0 ? parseFloat((purchase.amount / purchase.nav).toFixed(4)) : 0;
      finalPurchases = [{
        id:     `p-${Date.now()}`,
        date:   purchase.date,
        amount: Number(purchase.amount),
        nav:    Number(purchase.nav),
        units,
      }];
    }

    const fund = {
      schemeName,
      schemeCode: String(schemeCode),
      purchases: finalPurchases,
    };
    const saved = await mutualFundService.create(fund);
    set(state => ({ funds: [...state.funds, saved] }));

    // Always fetch NAV immediately for a newly added fund (even within 12-hr window)
    const navData = await get().fetchLiveNAV(saved.schemeCode);
    if (navData) saveNavCache(get().liveNAVs);
    return saved;
  },

  // Add SIP/lumpsum to existing fund (supports single purchase or array of purchases)
  addPurchase: async (fundId, purchaseOrPurchases) => {
    const fund = get().funds.find(f => f.id === fundId);
    if (!fund) return;
    
    let newPurchases = [];
    if (Array.isArray(purchaseOrPurchases)) {
      newPurchases = purchaseOrPurchases.map((p, idx) => {
        const units = p.nav > 0 ? parseFloat((p.amount / p.nav).toFixed(4)) : 0;
        return {
          id: `p-${Date.now()}-${idx}`,
          date: p.date,
          amount: Number(p.amount),
          nav: Number(p.nav),
          units,
        };
      });
    } else if (purchaseOrPurchases) {
      const units = purchaseOrPurchases.nav > 0 ? parseFloat((purchaseOrPurchases.amount / purchaseOrPurchases.nav).toFixed(4)) : 0;
      newPurchases = [{
        id:     `p-${Date.now()}`,
        date:   purchaseOrPurchases.date,
        amount: Number(purchaseOrPurchases.amount),
        nav:    Number(purchaseOrPurchases.nav),
        units,
      }];
    }

    const updated = await mutualFundService.update(fundId, {
      ...fund,
      purchases: [...(fund.purchases || []), ...newPurchases],
    });
    set(state => ({
      funds: state.funds.map(f => f.id === fundId ? updated : f),
    }));
  },

  deletePurchase: async (fundId, purchaseId) => {
    const fund = get().funds.find(f => f.id === fundId);
    if (!fund) return;
    const updated = await mutualFundService.update(fundId, {
      ...fund,
      purchases: fund.purchases.filter(p => p.id !== purchaseId),
    });
    set(state => ({
      funds: state.funds.map(f => f.id === fundId ? updated : f),
    }));
  },

  deleteFund: async (fundId) => {
    await mutualFundService.delete(fundId);
    set(state => ({ funds: state.funds.filter(f => f.id !== fundId) }));
  },

  // ── Per-fund computed stats ──────────────────────────────────────
  computeFundStats: (fund) => {
    const navData     = get().liveNAVs[fund.schemeCode];
    const purchases   = fund.purchases || [];
    const totalUnits  = purchases.reduce((s, p) => s + (p.units  || 0), 0);
    const totalInvested = purchases.reduce((s, p) => s + (p.amount || 0), 0);

    const latestNAV   = navData?.nav    ?? null;
    const prevNAV     = navData?.prevNav ?? null;
    const currentValue = latestNAV !== null ? totalUnits * latestNAV : null;
    const returns      = currentValue !== null ? currentValue - totalInvested : null;
    const returnsPercent = (returns !== null && totalInvested > 0)
      ? parseFloat(((returns / totalInvested) * 100).toFixed(2)) : null;

    const dayChange    = (latestNAV !== null && prevNAV !== null) ? totalUnits * (latestNAV - prevNAV) : null;
    const dayChangePct = (latestNAV !== null && prevNAV !== null && prevNAV > 0)
      ? parseFloat((((latestNAV - prevNAV) / prevNAV) * 100).toFixed(2)) : null;

    // XIRR: each purchase is a negative cashflow, current value is final positive
    let xirrValue = null;
    if (currentValue !== null && purchases.length > 0) {
      const cashflows = purchases
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(p => ({ date: p.date, amount: -Math.abs(p.amount) }));

      // Only compute if the final redemption date is strictly after all purchases
      const today = new Date().toISOString().slice(0, 10);
      cashflows.push({ date: today, amount: currentValue });

      xirrValue = xirr(cashflows);
    }

    return {
      totalUnits:    parseFloat(totalUnits.toFixed(4)),
      totalInvested,
      currentValue,
      returns,
      returnsPercent,
      dayChange,
      dayChangePct,
      latestNAV,
      navDate:  navData?.date || null,
      xirr:     xirrValue,
    };
  },

  getPortfolioTotals: () => {
    const funds = get().funds;
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let hasLiveData = false;

    funds.forEach(f => {
      const s = get().computeFundStats(f);
      totalInvested += s.totalInvested;
      if (s.currentValue !== null) {
        totalCurrentValue += s.currentValue;
        hasLiveData = true;
      } else {
        totalCurrentValue += s.totalInvested;
      }
    });

    const totalReturns = totalCurrentValue - totalInvested;
    const totalReturnsPercent = totalInvested > 0
      ? parseFloat(((totalReturns / totalInvested) * 100).toFixed(2)) : 0;

    return { totalInvested, totalCurrentValue, totalReturns, totalReturnsPercent, hasLiveData };
  },
}));
