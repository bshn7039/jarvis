import { useState, useMemo } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  MinusCircle, 
  PlusCircle, 
  Eye,
  Info
} from 'lucide-react';
import { useMutualFundStore } from '../../store/mutualFundStore';
import { aiDispatcher } from '../../ai/services/aiDispatcher';

const INSIGHT_STYLES = {
  risk: {
    border: 'border-rose-500/30 bg-rose-500/5',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10'
  },
  performance: {
    border: 'border-emerald-500/30 bg-emerald-500/5',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  allocation: {
    border: 'border-sky-500/30 bg-sky-500/5',
    text: 'text-sky-400',
    bg: 'bg-sky-500/10'
  },
  opportunity: {
    border: 'border-violet-500/30 bg-violet-500/5',
    text: 'text-violet-400',
    bg: 'bg-violet-500/10'
  }
};

const LOCAL_STORAGE_KEY = 'jarvis_mf_ai_insights';

// ── Offline Fallback Heuristics ──────────────────────────────────────────
function generateOfflineInsights(funds, totals, computeFundStats) {
  const fundDetails = funds.map(f => {
    const stats = computeFundStats(f);
    const name = f.schemeName.toLowerCase();
    
    let type = 'unknown';
    if (name.includes('small cap') || name.includes('smallcap')) type = 'small-cap';
    else if (name.includes('mid cap') || name.includes('midcap')) type = 'mid-cap';
    else if (name.includes('large cap') || name.includes('largecap')) type = 'large-cap';
    else if (name.includes('flexi cap') || name.includes('flexicap')) type = 'flexi-cap';
    else if (name.includes('hybrid')) type = 'hybrid';
    else if (name.includes('arbitrage')) type = 'arbitrage';
    
    return {
      id: f.id,
      name: f.schemeName,
      invested: stats.totalInvested,
      current: stats.currentValue || stats.totalInvested,
      returns: stats.returns || 0,
      returnsPercent: stats.returnsPercent || 0,
      xirr: stats.xirr,
      type
    };
  });

  const totalInvested = totals.totalInvested || 1;
  const types = {};
  fundDetails.forEach(f => {
    types[f.type] = (types[f.type] || 0) + f.invested;
  });

  const weights = {};
  Object.keys(types).forEach(t => {
    weights[t] = parseFloat(((types[t] / totalInvested) * 100).toFixed(1));
  });

  // Calculate Heuristic Diversification Score
  let score = 65;
  const uniqueTypes = Object.keys(types).length;
  if (uniqueTypes >= 4) score += 15;
  else if (uniqueTypes >= 2) score += 8;

  const smallCapWeight = weights['small-cap'] || 0;
  if (smallCapWeight > 50) score -= 15;
  else if (smallCapWeight > 10 && smallCapWeight <= 35) score += 10;

  const arbitrageWeight = weights['arbitrage'] || 0;
  const hybridWeight = weights['hybrid'] || 0;
  if (arbitrageWeight > 0 || hybridWeight > 0) score += 5;

  score = Math.min(100, Math.max(20, score));

  // Determine diversification comment
  let divComment = 'Your portfolio is well balanced across standard equity classes.';
  if (smallCapWeight > 50) {
    divComment = 'High concentration in Small-Cap funds detected. High volatility risk but high growth potential.';
  } else if (uniqueTypes <= 1) {
    divComment = 'Very low asset diversification. Consider spreading capital across multiple mutual fund categories.';
  }

  // ── Hold / Sell / Buy / Warn Lists ─────────────────────────────────────
  const holdList = [];
  const sellList = [];
  const buySuggestions = [];
  const riskWarnings = [];

  // Categorize funds
  fundDetails.forEach(f => {
    if (f.type === 'flexi-cap') {
      holdList.push(`${f.name}: Excellent core holdings. Keeps asset allocation dynamic across market caps.`);
    } else if (f.type === 'large-cap') {
      holdList.push(`${f.name}: Keep holding to anchor your portfolio with blue-chip stability.`);
    } else if (f.type === 'hybrid') {
      holdList.push(`${f.name}: Good defensive balance. Protects capital during market corrections.`);
    } else if (f.type === 'small-cap') {
      if (f.returnsPercent > 15) {
        holdList.push(`${f.name}: High performer. Keep holding but review allocations during high bull runs.`);
      } else {
        holdList.push(`${f.name}: Volatile asset. Continue long-term SIP; do not sell in panic.`);
      }
    }

    // Underperformers or Trim candidates
    if (f.type === 'arbitrage' && totalInvested > 15000) {
      sellList.push(`${f.name}: Consider letting go or trimming if your goal is long-term high compounding. Arbitrage yields are debt-like and will dampen overall portfolio velocity.`);
    } else if (f.returnsPercent < 4 && f.returnsPercent !== 0 && totalInvested > 2000) {
      sellList.push(`${f.name}: Flat growth rate (${f.returnsPercent.toFixed(1)}%). Consider redirecting this active SIP to a Nifty Index or Flexi-Cap fund if it underperforms for another quarter.`);
    }
  });

  // Default fallbacks if hold/sell are empty
  if (holdList.length === 0) {
    holdList.push("Core equity funds: Maintain active SIPs to leverage rupee-cost averaging.");
  }
  if (sellList.length === 0) {
    sellList.push("No immediate red flags. All tracked funds show steady integration. Watch any fund that underperforms the Nifty Index by > 5% over 12 months.");
  }

  // Buy suggestions
  if (!weights['flexi-cap']) {
    buySuggestions.push("Active Flexi-Cap Fund: Add a core Flexi-cap to dynamically balance between large/mid/small cap stocks based on valuation.");
  }
  if (!weights['large-cap'] && !weights['hybrid']) {
    buySuggestions.push("Nifty 50 Index Fund: Start a SIP in a low-cost Nifty 50 index fund to secure stable blue-chip beta compounding.");
  }
  if (smallCapWeight < 10) {
    buySuggestions.push("Small-Cap SIP (10-15% of portfolio): If your time horizon is 7+ years, start a small SIP here to boost long-term compounding speeds.");
  }
  if (buySuggestions.length === 0) {
    buySuggestions.push("Sectoral/Thematic Index: Your core allocation is perfect. If you have extra capital, consider a tactical allocation (max 10% of portfolio) in IT or Pharma sectoral indices.");
  }

  // Warnings
  if (smallCapWeight > 45) {
    riskWarnings.push(`Extreme Small-Cap Concentration: ${smallCapWeight}% of your wealth is in small caps. Expect sharp short-term drawdowns exceeding 25% during market corrections.`);
  }
  if (uniqueTypes <= 1) {
    riskWarnings.push("Single-Fund Concentration: Your capital is locked in a single asset type. Spread your SIPs across at least 3 distinct fund classes immediately.");
  }
  if (totals.totalReturnsPercent < 0) {
    riskWarnings.push("Compounding Slump: Your portfolio is currently yielding negative absolute returns. Avoid lump sums; continue SIPs to accumulate cheaper units.");
  }
  if (riskWarnings.length === 0) {
    riskWarnings.push("Market Valuation Watchout: General market valuations are trading slightly above historical averages. Avoid heavy direct lump sums; stay committed to disciplined SIPs.");
  }

  // Strategic insights
  const insights = [
    {
      type: 'performance',
      title: 'Compounding Diagnostic',
      description: totals.totalReturnsPercent > 12 
        ? `Portfolio returns are solid at ${totals.totalReturnsPercent.toFixed(1)}%. Compounding velocity is healthy.`
        : `Portfolio momentum is moderate at ${totals.totalReturnsPercent.toFixed(1)}%. Continue standard allocations.`
    },
    {
      type: 'risk',
      title: 'Exposure & Volatility Review',
      description: smallCapWeight > 40
        ? `Small-cap exposure is extremely aggressive (${smallCapWeight}%). High beta danger. Hold for at least 5 years.`
        : `Small-cap exposure is stable at ${smallCapWeight}%. Portfolio risk is moderate.`
    }
  ];

  return {
    summary: `Cognitive audit complete. Portfolio consists of ${funds.length} funds totaling ${totals.totalInvested.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}.`,
    diversificationScore: score,
    diversificationComment: divComment,
    insights,
    holdList,
    sellList,
    buySuggestions,
    riskWarnings,
    allocationAdvice: smallCapWeight > 40 
      ? 'Action Plan: Pause further Small-Cap lump sums. Direct monthly surpluses into Large-Cap Index or Flexi-Cap funds to anchor your portfolio.' 
      : 'Action Plan: Asset ratios are solid. Continue disciplined SIPs. Rebalance only if asset weights drift by more than 15%.',
    isFallback: true
  };
}

export default function MutualFundAiInsights() {
  const funds = useMutualFundStore(s => s.funds);
  const computeFundStats = useMutualFundStore(s => s.computeFundStats);
  const getPortfolioTotals = useMutualFundStore(s => s.getPortfolioTotals);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const [insights, setInsights] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Self-healing: if the cache is from an older schema version, clear it
      if (!parsed.holdList || !parsed.sellList || !parsed.buySuggestions || !parsed.riskWarnings) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const totals = getPortfolioTotals();

  const handleGenerate = async () => {
    if (funds.length === 0) {
      setError("Add at least one mutual fund to generate insights.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);

    const compiledData = funds.map(f => {
      const stats = computeFundStats(f);
      return {
        schemeName: f.schemeName,
        schemeCode: f.schemeCode,
        totalInvested: stats.totalInvested,
        currentValue: stats.currentValue,
        returns: stats.returns,
        returnsPercent: stats.returnsPercent,
        dayChange: stats.dayChange,
        dayChangePct: stats.dayChangePct,
        xirr: stats.xirr,
        purchaseCount: f.purchases?.length || 0
      };
    });

    const portfolioSummary = {
      totalFunds: funds.length,
      totalInvested: totals.totalInvested,
      totalCurrentValue: totals.totalCurrentValue,
      totalReturns: totals.totalReturns,
      totalReturnsPercent: totals.totalReturnsPercent,
      funds: compiledData
    };

    const systemPrompt = `You are JARVIS, an expert financial advisory AI specializing in Indian Mutual Funds.
Analyze the user's mutual fund portfolio data provided below.
Provide a highly realistic, balanced, and critical review. Do NOT just praise the positive returns; explicitly highlight performance issues, volatile concentration risks, stagnating funds, and structural concerns.

Your analysis must provide clear lists detailing:
1. WHAT TO KEEP HOLDING: High-quality long-term wealth compounders or essential defensive hedges.
2. WHAT TO CONSIDER LETTING GO / TRIMMING: Underperforming, flat, high-expense-ratio, redundant, or tax-inefficient funds.
3. WHAT TO BUY / START SIP IN: Gaps in their asset distribution (e.g. Flexi-cap anchor, blue-chip stability, small-cap beta).
4. WHAT TO BE AWARE OF (WATCH OUTS / WARNINGS): Concentration dangers, high-beta drawdowns, market-cycle risks, or premium valuations.

Return a JSON response ONLY, with no extra text or markdown formatting (except a standard JSON code block), in this exact format:
{
  "summary": "A critical executive summary of the portfolio's core issues, cap distributions, and stability (1-2 sentences).",
  "diversificationScore": 75, // out of 100 as an integer
  "diversificationComment": "A brief explanation of asset balance, index tracking drift, and structural overlap (1-2 sentences).",
  "holdList": [
    "Fund Name/Category: Brief strategic explanation of why this must be kept."
  ],
  "sellList": [
    "Fund Name/Category: Critical explanation of why they should trim, exit, or redirect these funds."
  ],
  "buySuggestions": [
    "Asset Class/Fund Category: Rationale for why this should be introduced to cover portfolio gaps."
  ],
  "riskWarnings": [
    "A sharp warning regarding concentration, volatility, tenure, or market cycles."
  ],
  "insights": [
    {
      "type": "performance" | "risk" | "allocation" | "opportunity",
      "title": "A short, sharp, and critical title...",
      "description": "Actionable explanation detailing why this matters."
    }
  ],
  "allocationAdvice": "Detailed strategic next steps (e.g., SIP rebalancing, re-allocations, or dry powder strategy) to secure long-term compounding."
}
`;

    try {
      const response = await aiDispatcher.sendMessage([
        { role: 'user', content: `Here is my live mutual fund portfolio snapshot:\n${JSON.stringify(portfolioSummary, null, 2)}` }
      ], {
        systemPrompt,
        temperature: 0.35
      });

      if (response && response.content) {
        let cleanContent = response.content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.slice(7);
        }
        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.slice(3);
        }
        if (cleanContent.endsWith('```')) {
          cleanContent = cleanContent.slice(0, -3);
        }
        cleanContent = cleanContent.trim();

        const parsed = JSON.parse(cleanContent);
        
        if (
          parsed.summary && 
          typeof parsed.diversificationScore === 'number' && 
          Array.isArray(parsed.holdList) && 
          Array.isArray(parsed.sellList) && 
          Array.isArray(parsed.buySuggestions) && 
          Array.isArray(parsed.riskWarnings)
        ) {
          parsed.isFallback = false;
          setInsights(parsed);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
          console.log('[MutualFundAiInsights] Successfully generated critical insights from AI.');
        } else {
          throw new Error('Invalid JSON structure returned by AI model.');
        }
      } else {
        throw new Error('No content received from AI Dispatcher.');
      }
    } catch (err) {
      console.warn('[MutualFundAiInsights] AI dispatch failed. Triggering offline critical heuristics:', err);
      const fallbackData = generateOfflineInsights(funds, totals, computeFundStats);
      setInsights(fallbackData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallbackData));
    } finally {
      setIsGenerating(false);
    }
  };

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = insights 
    ? circumference - (circumference * insights.diversificationScore) / 100 
    : circumference;

  return (
    <section className="rounded-2xl border border-jarvis-border bg-gradient-to-br from-jarvis-panel to-black/35 p-5 transition-all space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-jarvis-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-jarvis-accent/10 border border-jarvis-accent/20">
            <Sparkles className="h-4.5 w-4.5 text-jarvis-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-jarvis-text flex items-center gap-1.5">
              AI Portfolio Insights
              {insights && insights.isFallback && (
                <span className="text-[9px] font-normal uppercase tracking-wider bg-jarvis-border px-1.5 py-0.5 rounded text-jarvis-muted">
                  Heuristic Analysis
                </span>
              )}
            </h3>
            <p className="text-[10px] text-jarvis-muted mt-0.5">Live advisory metrics based on your actual holdings</p>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating || funds.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs font-medium text-jarvis-text hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analyzing Portfolio...' : insights ? 'Refresh Insights' : 'Generate Insights'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Empty State ── */}
      {!insights && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-10 text-center bg-black/10 rounded-xl border border-dashed border-jarvis-border">
          <TrendingUp className="h-8 w-8 text-jarvis-muted opacity-40 mb-2.5 animate-pulse" />
          <p className="text-xs font-medium text-jarvis-text">Unlock Critical Strategic Advisory</p>
          <p className="text-[11px] text-jarvis-muted mt-1 max-w-[320px]">
            Run JARVIS's diagnostic engine to analyze holdings, review return velocity, spot underperforming assets, and identify gaps.
          </p>
          <button
            onClick={handleGenerate}
            disabled={funds.length === 0}
            className="mt-3.5 flex items-center gap-1.5 rounded-lg bg-jarvis-accent/15 border border-jarvis-accent/20 px-3.5 py-1.5 text-xs text-jarvis-accent hover:bg-jarvis-accent/25 transition disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3" />
            Analyze Portfolio Now
          </button>
        </div>
      )}

      {/* ── Loading State ── */}
      {isGenerating && (
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3.5 bg-black/20 p-4 rounded-xl border border-jarvis-border/40 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-jarvis-accent animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="h-3 w-1/3 bg-white/10 rounded mb-2"></div>
              <div className="h-2 w-2/3 bg-white/5 rounded"></div>
            </div>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="rounded-xl border border-jarvis-border/30 bg-black/15 p-4 space-y-2 animate-pulse">
                <div className="h-3.5 w-3/5 bg-white/10 rounded"></div>
                <div className="h-2 w-4/5 bg-white/5 rounded"></div>
                <div className="h-2 w-2/5 bg-white/5 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Active Insights Layout ── */}
      {insights && !isGenerating && (
        <div className="space-y-5">
          {/* Summary Banner with radial gauge */}
          <div className="grid gap-4 md:grid-cols-12 items-center bg-black/20 border border-jarvis-border/40 rounded-xl p-4">
            <div className="md:col-span-8 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-jarvis-accent bg-jarvis-accent/10 px-2 py-0.5 rounded border border-jarvis-accent/20">
                  Critical Diagnosis
                </span>
              </div>
              <p className="text-xs text-jarvis-text leading-relaxed font-medium">
                {insights.summary}
              </p>
            </div>

            <div className="md:col-span-4 flex items-center md:justify-end gap-3.5 border-t border-jarvis-border/40 md:border-t-0 pt-3 md:pt-0">
              <div className="relative h-18 w-18 flex items-center justify-center">
                <svg className="absolute transform -rotate-90" width="76" height="76">
                  <circle 
                    cx="38" 
                    cy="38" 
                    r={radius} 
                    className="stroke-jarvis-border/40 fill-transparent" 
                    strokeWidth="4" 
                  />
                  <circle 
                    cx="38" 
                    cy="38" 
                    r={radius} 
                    className={`${insights.diversificationScore > 75 ? 'stroke-emerald-400' : insights.diversificationScore > 50 ? 'stroke-jarvis-accent' : 'stroke-rose-400'} fill-transparent transition-all duration-1000 ease-out`} 
                    strokeWidth="4" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center z-10">
                  <span className="text-base font-bold text-jarvis-text">{insights.diversificationScore}</span>
                  <span className="text-[8px] block text-jarvis-muted uppercase tracking-tighter">Score</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider text-jarvis-muted font-bold flex items-center gap-1">
                  <Layers className="h-3 w-3 text-jarvis-accent" /> Index Balance
                </p>
                <p className="text-[11px] text-jarvis-muted leading-tight mt-0.5">
                  {insights.diversificationComment}
                </p>
              </div>
            </div>
          </div>

          {/* ── holding, letting go, buy suggestions grid ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. What to Keep Holding */}
            <article className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4 flex flex-col h-full">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2.5 border-b border-emerald-500/10 pb-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>What to Keep</span>
              </div>
              <ul className="space-y-3 flex-1">
                {(insights.holdList || []).map((item, idx) => (
                  <li key={idx} className="text-[11px] text-jarvis-text leading-snug">
                    <span className="font-semibold block text-emerald-300">{item.split(':')[0]}</span>
                    <span className="text-jarvis-muted">{item.split(':').slice(1).join(':')}</span>
                  </li>
                ))}
              </ul>
            </article>

            {/* 2. What to Consider Letting Go */}
            <article className="rounded-xl border border-rose-500/20 bg-rose-500/[0.02] p-4 flex flex-col h-full">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2.5 border-b border-rose-500/10 pb-1.5">
                <MinusCircle className="h-4 w-4 shrink-0" />
                <span>What to Trim/Sell</span>
              </div>
              <ul className="space-y-3 flex-1">
                {(insights.sellList || []).map((item, idx) => (
                  <li key={idx} className="text-[11px] text-jarvis-text leading-snug">
                    <span className="font-semibold block text-rose-300">{item.split(':')[0]}</span>
                    <span className="text-jarvis-muted">{item.split(':').slice(1).join(':')}</span>
                  </li>
                ))}
              </ul>
            </article>

            {/* 3. What to Buy */}
            <article className="rounded-xl border border-sky-500/20 bg-sky-500/[0.02] p-4 flex flex-col h-full">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs uppercase tracking-wider mb-2.5 border-b border-sky-500/10 pb-1.5">
                <PlusCircle className="h-4 w-4 shrink-0" />
                <span>What to Buy</span>
              </div>
              <ul className="space-y-3 flex-1">
                {(insights.buySuggestions || []).map((item, idx) => (
                  <li key={idx} className="text-[11px] text-jarvis-text leading-snug">
                    <span className="font-semibold block text-sky-300">{item.split(':')[0]}</span>
                    <span className="text-jarvis-muted">{item.split(':').slice(1).join(':')}</span>
                  </li>
                ))}
              </ul>
            </article>

            {/* 4. What to Be Aware Of */}
            <article className="rounded-xl border border-amber-500/20 bg-amber-500/[0.02] p-4 flex flex-col h-full">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2.5 border-b border-amber-500/10 pb-1.5">
                <Eye className="h-4 w-4 shrink-0" />
                <span>What to Watch</span>
              </div>
              <ul className="space-y-3 flex-1">
                {(insights.riskWarnings || []).map((item, idx) => (
                  <li key={idx} className="text-[11px] text-jarvis-text leading-snug">
                    <span className="font-semibold block text-amber-300">{item.split(':')[0]}</span>
                    <span className="text-jarvis-muted">{item.split(':').slice(1).join(':')}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          {/* Tactical Advice Panel */}
          <div className="rounded-xl border border-jarvis-border/60 bg-gradient-to-r from-jarvis-accent/5 to-black/10 p-4">
            <h4 className="text-xs font-bold text-jarvis-accent uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> Core Tactical Rebalancing Plan
            </h4>
            <p className="text-xs text-jarvis-text leading-relaxed mt-2 italic font-light">
              "{insights.allocationAdvice}"
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
