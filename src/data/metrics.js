// Static sample data. The app is intentionally backend-free so the whole thing
// ships as static assets to S3 and is served from CloudFront.

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export const kpis = [
  {
    id: 'value',
    label: 'Portfolio value',
    value: 284_920,
    format: 'currencyCompact',
    delta: 8.9,
    upIsGood: true,
    period: 'vs. last month',
    spark: [232140, 238900, 235600, 244800, 251300, 248900, 256700, 262400, 258100, 267900, 276300, 284920],
    icon: 'wallet',
  },
  {
    id: 'day-change',
    label: "Today's change",
    value: 1240,
    format: 'currencySigned',
    delta: 0.44,
    upIsGood: true,
    period: 'today',
    spark: [-320, 180, 540, -90, 410, 260, -150, 620, 380, -210, 890, 1240],
    icon: 'pulse',
  },
  {
    id: 'return',
    label: 'Total return (YTD)',
    value: 22.7,
    format: 'percent1',
    delta: 2.1,
    upIsGood: true,
    period: 'vs. last month',
    spark: [0, 2.9, 1.5, 5.5, 8.3, 7.2, 10.6, 13.1, 11.2, 15.4, 19.0, 22.7],
    icon: 'target',
  },
  {
    id: 'cash',
    label: 'Cash balance',
    value: 12_590,
    format: 'currencyCompact',
    delta: -18.2,
    upIsGood: false,
    period: 'vs. last month',
    spark: [24200, 22100, 19800, 21400, 18700, 16300, 17900, 15200, 13600, 14800, 12100, 12590],
    icon: 'piggy',
  },
]

// Both series indexed to 100 at the start of the window so they share one
// y-axis honestly — portfolio value ($) and an index level aren't the same
// unit, so this is "indexed to a common base," not a dual axis.
export const portfolioTrend = {
  categories: MONTHS,
  series: [
    {
      id: 'portfolio',
      name: 'This portfolio',
      values: [100, 102.9, 101.5, 105.5, 108.3, 107.2, 110.6, 113.1, 111.2, 115.4, 119.0, 122.7],
    },
    {
      id: 'benchmark',
      name: 'S&P 500',
      values: [100, 101.8, 100.2, 103.1, 104.7, 103.5, 106.0, 108.2, 106.5, 109.8, 112.9, 115.6],
    },
  ],
}

// Part-to-whole: one stacked bar, four categories, values sum to the
// portfolio value above so the two views reconcile.
export const allocation = [
  { id: 'equities', label: 'Equities', value: 181_960, pct: 63.9 },
  { id: 'fixed-income', label: 'Fixed income', value: 48_028, pct: 16.8 },
  { id: 'crypto', label: 'Crypto', value: 42_342, pct: 14.9 },
  { id: 'cash', label: 'Cash', value: 12_590, pct: 4.4 },
]

// Largest position first.
export const holdings = [
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'Equities', units: 260, unitLabel: 'sh', avgCost: 360.00, price: 452.60, value: 117_676, dayChangePct: 0.9, totalReturnPct: 25.7 },
  { symbol: 'TLT', name: 'iShares 20+ Yr Treasury ETF', category: 'Fixed income', units: 420, unitLabel: 'sh', avgCost: 98.40, price: 91.20, value: 38_304, dayChangePct: -0.3, totalReturnPct: -7.3 },
  { symbol: 'BTC', name: 'Bitcoin', category: 'Crypto', units: 0.42, unitLabel: 'BTC', avgCost: 38_200.00, price: 67_900.00, value: 28_518, dayChangePct: 4.1, totalReturnPct: 77.7 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'Equities', units: 60, unitLabel: 'sh', avgCost: 310.00, price: 402.10, value: 24_126, dayChangePct: 0.6, totalReturnPct: 29.7 },
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Equities', units: 120, unitLabel: 'sh', avgCost: 145.20, price: 178.35, value: 21_402, dayChangePct: 1.8, totalReturnPct: 22.8 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'Equities', units: 40, unitLabel: 'sh', avgCost: 210.50, price: 468.90, value: 18_756, dayChangePct: 3.2, totalReturnPct: 122.7 },
  { symbol: 'ETH', name: 'Ethereum', category: 'Crypto', units: 4.8, unitLabel: 'ETH', avgCost: 2_150.00, price: 2_880.00, value: 13_824, dayChangePct: -1.6, totalReturnPct: 34.0 },
  { symbol: 'BND', name: 'Vanguard Total Bond ETF', category: 'Fixed income', units: 130, unitLabel: 'sh', avgCost: 72.10, price: 74.80, value: 9_724, dayChangePct: 0.1, totalReturnPct: 3.7 },
]

export const portfolioSummary = (() => {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.units * h.avgCost, 0)
  const gain = totalValue - totalCost
  const largest = holdings.reduce((a, b) => (b.value > a.value ? b : a))
  const best = holdings.reduce((a, b) => (b.totalReturnPct > a.totalReturnPct ? b : a))
  return {
    totalValue,
    totalCost,
    gain,
    gainPct: (gain / totalCost) * 100,
    count: holdings.length,
    largestSymbol: largest.symbol,
    largestPct: (largest.value / totalValue) * 100,
    bestSymbol: best.symbol,
    bestReturnPct: best.totalReturnPct,
  }
})()

// Same holdings, ranked by today's move — the diverging-bar view of the table above.
export const topMovers = [...holdings]
  .sort((a, b) => b.dayChangePct - a.dayChangePct)
  .map((h) => ({ id: h.symbol, label: h.symbol, name: h.name, value: h.dayChangePct }))

export const activity = [
  { id: 1, kind: 'buy', title: 'Bought 10 sh NVDA', when: '2 days ago', amount: -4689 },
  { id: 2, kind: 'div', title: 'Dividend received · VOO', when: '3 days ago', amount: 186.4 },
  { id: 3, kind: 'buy', title: 'Bought 0.05 BTC', when: '5 days ago', amount: -3395 },
  { id: 4, kind: 'sell', title: 'Sold 20 sh TLT', when: '1 week ago', amount: 1824 },
  { id: 5, kind: 'div', title: 'Dividend received · MSFT', when: '2 weeks ago', amount: 45.6 },
]

export function formatValue(value, format) {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value)
    case 'currencyCompact':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value)
    case 'currencySigned':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        signDisplay: 'always',
      }).format(value)
    case 'percent':
      return `${value.toFixed(2)}%`
    case 'percent1':
      return `${value.toFixed(1)}%`
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}
