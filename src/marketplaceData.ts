// Marketplace mock data. Re-exported from src/mockData.ts; accessed only via src/services/api.ts.
import type { EquityPoint } from "./mockData";

export type Style = "Trend" | "Scalping" | "Mean reversion" | "Breakout";
export type ListingStatus = "Draft" | "In review" | "Live" | "Paused";

export interface Metrics {
  netProfit: number;
  profitFactor: number;
  drawdown: number;
  winRate: number;
  totalTrades: number;
  sharpe: number;
}

export interface Builder {
  id: string;
  name: string;
  initials: string;
  bio: string;
  memberSince: string;
  totalSales: number;
  rating: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Listing {
  id: string;
  title: string;
  builderId: string;
  symbol: string;
  timeframe: string;
  style: Style;
  broker: string;
  price: number;
  sourcePrice: number | null; // null = .mq5 source not offered
  rating: number;
  reviewCount: number;
  purchases: number;
  publishedAt: string;
  description: string;
  inputs: { name: string; value: string; note: string }[];
  versions: { version: string; date: string; notes: string }[];
  metrics: Metrics;
  equity: EquityPoint[];
  period: { from: string; to: string };
  deposit: number;
  status: ListingStatus;
}

export interface TrialSettings {
  symbol: string;
  timeframe: string;
  from: string;
  to: string;
  deposit: number;
}

export interface TrialResult {
  id: string;
  listingId: string;
  date: string;
  settings: TrialSettings;
  metrics: Metrics;
  equity: EquityPoint[];
}

export const SYMBOLS = ["EURUSD", "GBPUSD", "XAUUSD", "USDJPY", "AUDUSD", "US30"];
export const TIMEFRAMES = ["M5", "M15", "H1", "H4", "D1"];
export const STYLES: Style[] = ["Trend", "Scalping", "Mean reversion", "Breakout"];
export const BROKERS = ["IC Markets", "Pepperstone", "FTMO", "Exness", "RoboForex"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function makeEquity(seed: number, deposit: number, net: number, dd: number, points = 60): EquityPoint[] {
  const r = rng(seed);
  const out: EquityPoint[] = [];
  const noise = deposit * (dd / 100) * 0.6;
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const wobble = i === 0 || i === points - 1 ? 0 : (r() - 0.5) * noise + Math.sin(i / 4 + seed) * noise * 0.3;
    out.push({ i, equity: Math.round(deposit + net * t + wobble) });
  }
  return out;
}

export const builders: Builder[] = [
  { id: "b1", name: "Lena Kovač", initials: "LK", bio: "Ex-bank FX desk. Builds slow, robust trend systems on majors.", memberSince: "2024-03-12", totalSales: 412, rating: 4.7 },
  { id: "b2", name: "Marcus Oyelaran", initials: "MO", bio: "Gold and index scalper. Obsessive about spread and slippage modelling.", memberSince: "2024-07-01", totalSales: 238, rating: 4.3 },
  { id: "b3", name: "Yuki Tanaka", initials: "YT", bio: "Quant hobbyist focused on mean reversion in Asian session ranges.", memberSince: "2025-01-20", totalSales: 96, rating: 4.1 },
  { id: "b4", name: "Diego Ferraz", initials: "DF", bio: "Breakout systems, London open specialist.", memberSince: "2025-05-08", totalSales: 31, rating: 3.6 },
];

type Seed = Omit<Listing, "equity" | "inputs" | "versions" | "period" | "deposit" | "status"> & Partial<Pick<Listing, "status">>;

const seeds: Seed[] = [
  { id: "l1", title: "Trend Rider EURUSD", builderId: "b1", symbol: "EURUSD", timeframe: "H1", style: "Trend", broker: "IC Markets", price: 149, sourcePrice: 349, rating: 4.8, reviewCount: 64, purchases: 182, publishedAt: "2026-09-02", description: "Follows medium-term trends using a 50/200 EMA filter and enters on pullbacks to the 20 EMA. Uses ATR-based stops and a trailing exit.", metrics: { netProfit: 4820, profitFactor: 1.74, drawdown: 7.2, winRate: 46, totalTrades: 212, sharpe: 1.52 } },
  { id: "l2", title: "Gold Scalper Pro", builderId: "b2", symbol: "XAUUSD", timeframe: "M5", style: "Scalping", broker: "Pepperstone", price: 199, sourcePrice: null, rating: 4.4, reviewCount: 41, purchases: 129, publishedAt: "2026-08-14", description: "High-frequency scalper for XAUUSD during the London–New York overlap. Strict spread filter and time-based exits.", metrics: { netProfit: 6310, profitFactor: 1.38, drawdown: 14.6, winRate: 61, totalTrades: 1840, sharpe: 1.21 } },
  { id: "l3", title: "Asian Range Reverter", builderId: "b3", symbol: "USDJPY", timeframe: "M15", style: "Mean reversion", broker: "FTMO", price: 89, sourcePrice: 189, rating: 4.2, reviewCount: 22, purchases: 58, publishedAt: "2026-10-10", description: "Fades extremes of the Asian session range with Bollinger Bands and RSI confirmation.", metrics: { netProfit: 2140, profitFactor: 1.42, drawdown: 6.1, winRate: 58, totalTrades: 388, sharpe: 1.33 } },
  { id: "l4", title: "London Open Breakout", builderId: "b4", symbol: "GBPUSD", timeframe: "M15", style: "Breakout", broker: "Exness", price: 59, sourcePrice: 129, rating: 3.4, reviewCount: 11, purchases: 19, publishedAt: "2026-07-21", description: "Trades the breakout of the pre-London range with a fixed take-profit.", metrics: { netProfit: -860, profitFactor: 0.91, drawdown: 18.4, winRate: 39, totalTrades: 302, sharpe: -0.22 } },
  { id: "l5", title: "Daily Swing Majors", builderId: "b1", symbol: "GBPUSD", timeframe: "D1", style: "Trend", broker: "IC Markets", price: 129, sourcePrice: 299, rating: 4.6, reviewCount: 38, purchases: 97, publishedAt: "2026-06-30", description: "Low-frequency swing system using Donchian channels on the daily chart.", metrics: { netProfit: 3150, profitFactor: 2.05, drawdown: 5.4, winRate: 42, totalTrades: 64, sharpe: 1.71 } },
  { id: "l6", title: "Index Momentum US30", builderId: "b2", symbol: "US30", timeframe: "H1", style: "Breakout", broker: "Pepperstone", price: 169, sourcePrice: null, rating: 4.0, reviewCount: 19, purchases: 44, publishedAt: "2026-09-25", description: "Momentum breakouts on the Dow during cash session hours.", metrics: { netProfit: 5420, profitFactor: 1.29, drawdown: 21.3, winRate: 44, totalTrades: 410, sharpe: 0.94 } },
  { id: "l7", title: "Aussie Grid-Free Reversion", builderId: "b3", symbol: "AUDUSD", timeframe: "H4", style: "Mean reversion", broker: "RoboForex", price: 69, sourcePrice: 149, rating: 3.9, reviewCount: 9, purchases: 15, publishedAt: "2026-10-18", description: "Single-position mean reversion with no grid or martingale.", metrics: { netProfit: 980, profitFactor: 1.18, drawdown: 9.8, winRate: 55, totalTrades: 141, sharpe: 0.61 } },
  { id: "l8", title: "Yen Carry Trend", builderId: "b1", symbol: "USDJPY", timeframe: "H4", style: "Trend", broker: "FTMO", price: 119, sourcePrice: 259, rating: 4.5, reviewCount: 27, purchases: 71, publishedAt: "2026-05-11", description: "Rides yen weakness trends with MACD and higher-timeframe confirmation.", metrics: { netProfit: 3890, profitFactor: 1.66, drawdown: 8.9, winRate: 48, totalTrades: 133, sharpe: 1.44 } },
  { id: "l9", title: "Gold Fade Overnight", builderId: "b4", symbol: "XAUUSD", timeframe: "H1", style: "Mean reversion", broker: "Exness", price: 49, sourcePrice: null, rating: 2.9, reviewCount: 7, purchases: 9, publishedAt: "2026-08-03", description: "Fades overnight gold spikes. Works in ranges, struggles in strong trends.", metrics: { netProfit: -1420, profitFactor: 0.82, drawdown: 26.7, winRate: 51, totalTrades: 276, sharpe: -0.48 } },
  { id: "l10", title: "Cable Scalp M5", builderId: "b2", symbol: "GBPUSD", timeframe: "M5", style: "Scalping", broker: "IC Markets", price: 139, sourcePrice: 299, rating: 4.1, reviewCount: 15, purchases: 36, publishedAt: "2026-10-01", description: "Session scalper with tight stops and spread guard.", metrics: { netProfit: 1760, profitFactor: 1.21, drawdown: 11.2, winRate: 63, totalTrades: 1210, sharpe: 0.88 } },
  { id: "l11", title: "Euro Breakout H4", builderId: "b4", symbol: "EURUSD", timeframe: "H4", style: "Breakout", broker: "RoboForex", price: 79, sourcePrice: 159, rating: 3.7, reviewCount: 6, purchases: 12, publishedAt: "2026-10-20", description: "Weekly range breakout with volatility filter.", metrics: { netProfit: 310, profitFactor: 1.04, drawdown: 15.9, winRate: 37, totalTrades: 98, sharpe: 0.12 } },
  { id: "l12", title: "Steady EMA Cross", builderId: "b1", symbol: "EURUSD", timeframe: "H1", style: "Trend", broker: "Pepperstone", price: 99, sourcePrice: 229, rating: 4.3, reviewCount: 33, purchases: 88, publishedAt: "2026-04-17", description: "Classic 12/26 EMA crossover with ATR risk sizing and a session filter.", metrics: { netProfit: 3412, profitFactor: 1.61, drawdown: 8.1, winRate: 47, totalTrades: 243, sharpe: 1.38 } },
];

export const listings: Listing[] = seeds.map((s, idx) => ({
  ...s,
  status: s.status ?? "Live",
  deposit: 10000,
  period: { from: "2023-01-01", to: "2024-12-31" },
  equity: makeEquity(idx + 3, 10000, s.metrics.netProfit, s.metrics.drawdown),
  inputs: [
    { name: "RiskPercent", value: "1.0", note: "Risk per trade, % of balance" },
    { name: "AtrMultiplier", value: "2.0", note: "Stop distance in ATRs" },
    { name: "MaxSpread", value: "20", note: "Skip entries above this spread (points)" },
    { name: "TradingHours", value: "07:00-20:00", note: "Server time window" },
  ],
  versions: [
    { version: "v3", date: s.publishedAt, notes: "Improved exit logic and spread filter." },
    { version: "v2", date: "2026-03-02", notes: "Added session filter." },
    { version: "v1", date: "2026-01-15", notes: "Initial release." },
  ],
}));

const reviewPool: Omit<Review, "id">[] = [
  { author: "Sam R.", rating: 5, date: "2026-10-12", comment: "My own test matched the listed curve closely. Clean code in the source package.", verified: true },
  { author: "Priya N.", rating: 4, date: "2026-09-28", comment: "Solid, but drawdown in 2022 was deeper than I expected when I tested further back.", verified: true },
  { author: "Tom W.", rating: 3, date: "2026-09-03", comment: "Decent results, settings need tweaking for my broker's spreads.", verified: false },
  { author: "Aisha K.", rating: 5, date: "2026-08-19", comment: "Builder answered my questions within a day. Updates are frequent.", verified: true },
  { author: "Jonas B.", rating: 2, date: "2026-07-30", comment: "Underperformed on GBPUSD when I tried it on another symbol.", verified: false },
];

export const reviews: Record<string, Review[]> = Object.fromEntries(
  listings.map((l, i) => [l.id, reviewPool.slice(0, 2 + (i % 4)).map((r, j) => ({ ...r, id: `${l.id}-r${j}` }))]),
);

export const myBuilderId = "b1";

export const workspaceStrategiesForPublish = [
  { id: "s1", title: "EMA crossover EURUSD", versions: ["v1", "v2", "v3"] },
  { id: "s2", title: "Gold breakout scalper", versions: ["v1", "v2"] },
  { id: "s3", title: "RSI mean reversion USDJPY", versions: ["v1"] },
];

export const dashboard = {
  revenue: 18420,
  unitsSold: 147,
  trialRunsThisMonth: 386,
  conversion: 12.4,
  revenueSeries: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, i) => ({ month: m, revenue: [1840, 2410, 2980, 3120, 3650, 4420][i] })),
  listings: [
    { id: "l1", title: "Trend Rider EURUSD", status: "Live" as ListingStatus, sales: 182, price: 149, connectionLost: false },
    { id: "l5", title: "Daily Swing Majors", status: "Live" as ListingStatus, sales: 97, price: 129, connectionLost: true },
    { id: "l8", title: "Yen Carry Trend", status: "Paused" as ListingStatus, sales: 71, price: 119, connectionLost: false },
    { id: "d1", title: "Momentum Gold H4", status: "In review" as ListingStatus, sales: 0, price: 109, connectionLost: false },
    { id: "d2", title: "Range Breaker", status: "Draft" as ListingStatus, sales: 0, price: 0, connectionLost: false },
  ],
  payouts: {
    balance: 2186.4,
    history: [
      { id: "p1", date: "2026-10-01", amount: 3102.5, status: "Paid" },
      { id: "p2", date: "2026-09-01", amount: 2740.0, status: "Paid" },
      { id: "p3", date: "2026-08-01", amount: 2398.75, status: "Paid" },
    ],
  },
};

export const reviewQueue = [
  { ...listings[0], id: "q1", title: "Momentum Gold H4", builderId: "b1", symbol: "XAUUSD", timeframe: "H4", style: "Trend" as Style, price: 109, submittedAt: "2026-10-24", status: "In review" as ListingStatus, equity: makeEquity(41, 10000, 2780, 9.4), metrics: { netProfit: 2780, profitFactor: 1.48, drawdown: 9.4, winRate: 45, totalTrades: 156, sharpe: 1.18 } },
  { ...listings[1], id: "q2", title: "Night Owl Scalper", builderId: "b2", symbol: "EURUSD", timeframe: "M5", style: "Scalping" as Style, price: 89, submittedAt: "2026-10-25", status: "In review" as ListingStatus, equity: makeEquity(42, 10000, -310, 17.2), metrics: { netProfit: -310, profitFactor: 0.96, drawdown: 17.2, winRate: 58, totalTrades: 940, sharpe: -0.08 } },
  { ...listings[2], id: "q3", title: "Ranging Yen Fader", builderId: "b3", symbol: "USDJPY", timeframe: "H1", style: "Mean reversion" as Style, price: 75, submittedAt: "2026-10-25", status: "In review" as ListingStatus, equity: makeEquity(43, 10000, 1420, 6.8), metrics: { netProfit: 1420, profitFactor: 1.31, drawdown: 6.8, winRate: 56, totalTrades: 204, sharpe: 1.02 } },
];
