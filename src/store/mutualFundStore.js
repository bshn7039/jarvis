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
    const time = Number(fetchedAt);
    if (isNaN(time) || time <= 0) return true;
    return Date.now() - time > NAV_STALE_MS;
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

      // One-time cleanup to delete any existing hardcoded default seeded funds (starting with 'mf-seed-')
      const cleanupFlag = await localDb.getById(STORES.METADATA, 'mutual-funds-cleanup-v1') || { id: 'mutual-funds-cleanup-v1', cleaned: false };
      if (!cleanupFlag.cleaned) {
        const seedFunds = funds.filter(f => f.id && f.id.startsWith('mf-seed-'));
        if (seedFunds.length > 0) {
          await Promise.all(seedFunds.map(f => mutualFundService.delete(f.id)));
          funds = await mutualFundService.getAll();
        }
        // Clear NAV cache in localStorage so the cache starts fresh
        try {
          localStorage.removeItem(NAV_CACHE_KEY);
        } catch (e) {
          console.warn('[MF Store] Failed to clear NAV cache during cleanup:', e);
        }
        await localDb.put(STORES.METADATA, { id: 'mutual-funds-cleanup-v1', cleaned: true });
      }

      // Self-healing migration: Detect and fix wrong scheme code for SBI Equity Hybrid
      let needsDatabaseUpdate = false;
      const healedFunds = await Promise.all(funds.map(async (fund) => {
        const nameLower = (fund.schemeName || '').toLowerCase();
        if (
          String(fund.schemeCode) === '120154' &&
          nameLower.includes('sbi') &&
          nameLower.includes('equity hybrid')
        ) {
          console.log(`[MF Store] Self-healing: Correcting schemeCode for fund "${fund.schemeName}" (ID: ${fund.id}) from 120154 to 119609`);
          const updatedFund = { ...fund, schemeCode: '119609' };
          try {
            await localDb.put(STORES.MUTUAL_FUNDS, updatedFund);
            needsDatabaseUpdate = true;
          } catch (e) {
            console.error('[MF Store] Self-healing failed to update database:', e);
          }
          return updatedFund;
        }
        return fund;
      }));

      if (needsDatabaseUpdate) {
        funds = healedFunds;
        // Invalidate NAV cache so we fetch the fresh correct NAV immediately
        try {
          localStorage.removeItem(NAV_CACHE_KEY);
        } catch (e) {
          console.warn('[MF Store] Failed to clear NAV cache during self-healing:', e);
        }
      }

      // Restore cached NAVs immediately so UI shows data without a network hit
      const cache = loadNavCache();
      const liveNAVs = cache.navs || {};

      let lastNAVFetchISO = null;
      if (cache.fetchedAt) {
        const parsedTime = Number(cache.fetchedAt);
        if (!isNaN(parsedTime) && parsedTime > 0) {
          lastNAVFetchISO = new Date(parsedTime).toISOString();
        } else {
          const parsedDate = Date.parse(cache.fetchedAt);
          if (!isNaN(parsedDate)) {
            lastNAVFetchISO = new Date(parsedDate).toISOString();
          }
        }
      }

      set({ funds, liveNAVs, isHydrated: true, lastNAVFetch: lastNAVFetchISO });

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
    if (!schemeCode) {
      console.warn('[MF Store] fetchLiveNAV called with empty schemeCode');
      return null;
    }
    const cleanSchemeCode = String(schemeCode).trim();
    if (!cleanSchemeCode || cleanSchemeCode === 'undefined' || cleanSchemeCode === 'null') {
      console.warn('[MF Store] fetchLiveNAV called with invalid schemeCode:', schemeCode);
      return null;
    }

    try {
      const res = await fetch(`${MFAPI_BASE}/${cleanSchemeCode}`);
      if (!res.ok) throw new Error(`NAV fetch failed for ${cleanSchemeCode}`);
      const data = await res.json();
      if (!data.data || data.data.length === 0) return null;

      // Robust date parsing helper to handle standard formats (dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd)
      const parseMfDate = (dateStr) => {
        if (!dateStr) return 0;
        if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
          return new Date(dateStr).getTime();
        }
        const separators = /[-/]/;
        const parts = dateStr.split(separators);
        if (parts.length === 3) {
          const day = Number(parts[0]);
          const month = Number(parts[1]);
          const year = Number(parts[2]);
          if (String(parts[0]).length === 4) {
            return new Date(day, month - 1, Number(parts[2])).getTime();
          } else {
            return new Date(year, month - 1, day).getTime();
          }
        }
        const parsed = Date.parse(dateStr);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Sort data array by date descending (latest first) to guarantee index 0 is the newest NAV
      const sortedData = [...data.data].sort((a, b) => parseMfDate(b.date) - parseMfDate(a.date));

      const latest   = sortedData[0];
      const previous = sortedData[1];
      if (!latest) return null;

      const navVal = parseFloat(latest.nav);
      const prevNavVal = previous ? parseFloat(previous.nav) : navVal;
      if (isNaN(navVal)) return null;

      const navData = {
        nav:        navVal,
        prevNav:    isNaN(prevNavVal) ? navVal : prevNavVal,
        date:       latest.date || '',
        schemeName: data.meta?.scheme_name || '',
      };

      // ── Background Fuzzy Self-Healing ──────────────────────────────
      // Verify if the DB fund name actually matches the name returned by the schemeCode's metadata.
      const fund = get().funds.find(f => String(f.schemeCode) === String(cleanSchemeCode));
      if (fund && navData.schemeName) {
        const dbName = (fund.schemeName || '').toLowerCase();
        const apiName = navData.schemeName.toLowerCase();
        
        const getKeywords = (name) => {
          return name
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2 && !['fund', 'direct', 'growth', 'plan', 'option', 'optionidcw', 'idcw', 'regular', 'dividend', 'mutual', 'scheme'].includes(w));
        };
        
        const dbKeywords = getKeywords(dbName);
        const apiKeywords = getKeywords(apiName);
        const brandDb = dbKeywords[0];
        const brandApi = apiKeywords[0];
        
        const sharesBrand = brandDb && brandApi && brandDb === brandApi;
        const matchingKeywordsCount = dbKeywords.filter(w => apiKeywords.includes(w)).length;
        
        // Mismatch conditions: Brand name is different OR key keywords differ significantly OR plan type (Direct vs Regular) is mismatched
        const isDbDirect = dbName.includes('direct');
        const isApiDirect = apiName.includes('direct');
        const planMismatch = isDbDirect !== isApiDirect;
        
        const isMismatched = !sharesBrand || (matchingKeywordsCount < 2 && dbKeywords.length >= 2) || planMismatch;
        
        if (isMismatched && dbKeywords.length > 0) {
          console.warn(`[MF Store] Mismatch detected! DB Fund: "${fund.schemeName}", API Name: "${navData.schemeName}" for code ${cleanSchemeCode}. Attempting self-healing...`);
          try {
            const searchQuery = dbKeywords.slice(0, 4).join(' ');
            const searchRes = await fetch(`${MFAPI_BASE}/search?q=${encodeURIComponent(searchQuery)}`);
            if (searchRes.ok) {
              const results = await searchRes.json();
              if (results && results.length > 0) {
                // Find the best match that aligns on brand, keywords, AND direct vs regular plan type
                const bestMatch = results.find(r => {
                  const rName = r.schemeName.toLowerCase();
                  const rKeywords = getKeywords(rName);
                  const rBrand = rKeywords[0];
                  const isRDirect = rName.includes('direct');
                  
                  return rBrand === brandDb && 
                         rKeywords.filter(w => dbKeywords.includes(w)).length >= 2 &&
                         isRDirect === isDbDirect;
                }) || results.find(r => {
                  // Fallback: match brand and keywords
                  const rName = r.schemeName.toLowerCase();
                  const rKeywords = getKeywords(rName);
                  const rBrand = rKeywords[0];
                  return rBrand === brandDb && rKeywords.filter(w => dbKeywords.includes(w)).length >= 2;
                }) || results[0];
                
                if (bestMatch && String(bestMatch.schemeCode) !== String(cleanSchemeCode)) {
                  console.log(`[MF Store] Self-healed: Correcting code for "${fund.schemeName}" from ${cleanSchemeCode} to ${bestMatch.schemeCode}`);
                  const healedFund = { ...fund, schemeCode: String(bestMatch.schemeCode) };
                  try {
                    await localDb.put(STORES.MUTUAL_FUNDS, healedFund);
                    
                    // Update funds in state
                    set(state => ({
                      funds: state.funds.map(f => f.id === fund.id ? healedFund : f)
                    }));
                    
                    // Evict cache to ensure clean state
                    try { localStorage.removeItem(NAV_CACHE_KEY); } catch {}
                    
                    // Fetch and return the live NAV for the new, correct schemeCode
                    return get().fetchLiveNAV(bestMatch.schemeCode);
                  } catch (e) {
                    console.error('[MF Store] Fuzzy self-healing failed to save healed fund:', e);
                  }
                }
              }
            }
          } catch (e) {
            console.error('[MF Store] Fuzzy self-healing error:', e);
          }
        }
      }

      set(state => ({
        liveNAVs: { ...state.liveNAVs, [cleanSchemeCode]: navData }
      }));
      return navData;
    } catch (err) {
      console.error(`[MF Store] MFAPI NAV error for ${cleanSchemeCode}:`, err);
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
