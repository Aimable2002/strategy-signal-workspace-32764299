// Service layer. Components call ONLY these functions.
// Replace the bodies with real API calls later; signatures stay the same.
import {
  backtestRuns,
  buildRun,
  compileErrors,
  engineStatus,
  fileTree,
  initialMessages,
  parametersSet,
  strategies,
  strategyFiles,
  terminalLogs,
  usage,
  type BacktestRun,
  type Message,
  type WorkspaceStatus,
} from "@/mockData";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

let runs = clone(backtestRuns);

export async function getWorkspaceStatus(): Promise<{ status: WorkspaceStatus; startedAt: number }> {
  await wait(100);
  return { status: "running", startedAt: Date.now() - (2 * 3600 + 17 * 60 + 9) * 1000 };
}

export async function getUsage() {
  return clone(usage);
}

export async function getEngineStatus() {
  return clone(engineStatus);
}

export async function getStrategies() {
  await wait(150);
  return clone(strategies);
}

export async function getMessages(_strategyId: string) {
  await wait(200);
  return clone(initialMessages);
}

export async function sendMessage(_strategyId: string, text: string): Promise<Message> {
  await wait(1500);
  return {
    id: crypto.randomUUID(),
    role: "agent",
    content: `On it. I've updated the strategy based on "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}" and recompiled it. Want me to run a fresh backtest to compare with version 3?`,
    tools: [
      { id: crypto.randomUUID(), tool: "File", label: "edited EMA_Cross.mq5", status: "done", durationMs: 280, output: "+6 −2 lines" },
      { id: crypto.randomUUID(), tool: "MetaEditor", label: "compile EMA_Cross.mq5", status: "done", durationMs: 1720, output: "0 errors, 0 warnings" },
    ],
  };
}

export async function getBacktestRuns(_strategyId: string) {
  await wait(150);
  return clone(runs);
}

export async function runBacktest(
  _strategyId: string,
  onProgress: (p: number) => void,
): Promise<BacktestRun> {
  for (let p = 0; p <= 100; p += 5) {
    onProgress(p);
    await wait(150);
  }
  const run = buildRun(`v${runs.length + 1}`, runs.length);
  runs = [...runs, run];
  return clone(run);
}

export async function getStrategyFiles(_strategyId: string, version: string) {
  await wait(120);
  return clone((strategyFiles[version] ?? strategyFiles["v3"])!);
}

export async function getCompileErrors(_strategyId: string, _version: string) {
  return clone(compileErrors);
}

export async function getFileTree(_strategyId: string) {
  return clone(fileTree);
}

export async function getParametersFile(_strategyId: string) {
  return parametersSet;
}

export async function getTerminalLogs() {
  return [...terminalLogs];
}

export async function downloadStrategy(
  strategyId: string,
  version: string,
  type: "mq5" | "ex5" | "zip",
) {
  const files = (strategyFiles[version] ?? strategyFiles["v3"])!;
  const name = type === "zip" ? `EMA_Cross_${version}.zip` : type === "mq5" ? files.mq5.filename : files.ex5.filename;
  const content = type === "mq5" ? files.mq5.source : `Mock ${type} file for ${strategyId} ${version}`;
  const url = URL.createObjectURL(new Blob([content], { type: "application/octet-stream" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
  return name;
}

// ───────────────────────── Marketplace ─────────────────────────
import {
  builders as mBuilders,
  dashboard as mDashboard,
  listings as mListings,
  makeEquity,
  reviewQueue as mReviewQueue,
  reviews as mReviews,
  workspaceStrategiesForPublish,
  type Listing,
  type Metrics,
  type TrialResult,
  type TrialSettings,
} from "@/mockData";

export type SortKey = "newest" | "purchased" | "rating" | "drawdown";
export interface ListingFilters {
  q?: string;
  symbol?: string;
  timeframe?: string;
  style?: string;
  broker?: string;
  maxPrice?: number;
  sort?: SortKey;
}

export const TRIAL_LIMIT = 3;
let trials: TrialResult[] = [];
let purchases: { id: string; listingId: string; date: string; includesSource: boolean; version: string; updateAvailable: boolean }[] = [
  { id: "o0", listingId: "l3", date: "2026-09-14", includesSource: true, version: "v2", updateAvailable: true },
];
let queue = clone(mReviewQueue);

export function filterListings(all: Listing[], f: ListingFilters): Listing[] {
  const q = f.q?.trim().toLowerCase();
  let out = all.filter((l) => l.status === "Live")
    .filter((l) => !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q))
    .filter((l) => !f.symbol || l.symbol === f.symbol)
    .filter((l) => !f.timeframe || l.timeframe === f.timeframe)
    .filter((l) => !f.style || l.style === f.style)
    .filter((l) => !f.broker || l.broker === f.broker)
    .filter((l) => f.maxPrice == null || l.price <= f.maxPrice);
  const sorters: Record<SortKey, (a: Listing, b: Listing) => number> = {
    newest: (a, b) => b.publishedAt.localeCompare(a.publishedAt),
    purchased: (a, b) => b.purchases - a.purchases,
    rating: (a, b) => b.rating - a.rating,
    drawdown: (a, b) => a.metrics.drawdown - b.metrics.drawdown,
  };
  out = [...out].sort(sorters[f.sort ?? "newest"]);
  return out;
}

export async function getListings(filters: ListingFilters = {}) {
  await wait(350);
  return clone(filterListings(mListings, filters)).map((l) => ({ ...l, builder: mBuilders.find((b) => b.id === l.builderId)! }));
}

export async function getListing(id: string) {
  await wait(250);
  const l = mListings.find((x) => x.id === id);
  if (!l) throw new Error("Listing not found");
  return clone({ ...l, builder: mBuilders.find((b) => b.id === l.builderId)!, reviews: mReviews[l.id] ?? [] });
}

export async function getTrialsRemaining(listingId: string) {
  return TRIAL_LIMIT - trials.filter((t) => t.listingId === listingId).length;
}

export async function runTrialBacktest(listingId: string, settings: TrialSettings, onProgress?: (p: number) => void): Promise<TrialResult> {
  if ((await getTrialsRemaining(listingId)) <= 0) throw new Error("No test runs left for this strategy");
  const l = mListings.find((x) => x.id === listingId);
  if (!l) throw new Error("Listing not found");
  for (let p = 0; p <= 100; p += 5) { onProgress?.(p); await wait(150); }
  const n = trials.length + 1;
  const sameMarket = settings.symbol === l.symbol && settings.timeframe === l.timeframe;
  const factor = (sameMarket ? 0.85 : 0.35) + ((n * 37) % 20) / 100;
  const scale = settings.deposit / l.deposit;
  const m = l.metrics;
  const metrics: Metrics = {
    netProfit: Math.round(m.netProfit * factor * scale - (sameMarket ? 0 : 400 * scale)),
    profitFactor: +(m.profitFactor * (sameMarket ? 0.95 : 0.85)).toFixed(2),
    drawdown: +(m.drawdown * (sameMarket ? 1.1 : 1.4)).toFixed(1),
    winRate: Math.round(m.winRate * (sameMarket ? 0.98 : 0.9)),
    totalTrades: Math.round(m.totalTrades * (0.8 + factor / 5)),
    sharpe: +(m.sharpe * factor).toFixed(2),
  };
  const result: TrialResult = { id: crypto.randomUUID(), listingId, date: new Date().toISOString().slice(0, 10), settings, metrics, equity: makeEquity(100 + n, settings.deposit, metrics.netProfit, metrics.drawdown) };
  trials = [...trials, result];
  return clone(result);
}

export async function getBuilderProfile(id: string) {
  await wait(250);
  const b = mBuilders.find((x) => x.id === id);
  if (!b) throw new Error("Builder not found");
  return clone({ ...b, listings: mListings.filter((l) => l.builderId === id && l.status === "Live").map((l) => ({ ...l, builder: b })) });
}

export function orderTotal(listing: Pick<Listing, "price" | "sourcePrice">, includeSource: boolean) {
  return includeSource && listing.sourcePrice != null ? listing.sourcePrice : listing.price;
}

export async function createOrder(listingId: string, options: { includeSource: boolean }) {
  await wait(1200);
  const l = mListings.find((x) => x.id === listingId);
  if (!l) throw new Error("Listing not found");
  const order = { id: `o${purchases.length + 1}`, listingId, date: new Date().toISOString().slice(0, 10), includesSource: options.includeSource && l.sourcePrice != null, version: l.versions[0]!.version, updateAvailable: false };
  purchases = [...purchases.filter((p) => p.listingId !== listingId), order];
  return { ...clone(order), total: orderTotal(l, options.includeSource) };
}

export async function getPurchases() {
  await wait(300);
  return clone(purchases.map((p) => ({ ...p, listing: mListings.find((l) => l.id === p.listingId)! })));
}

export async function getTrials() {
  await wait(300);
  return clone(trials.map((t) => ({ ...t, listing: mListings.find((l) => l.id === t.listingId)!, purchased: purchases.some((p) => p.listingId === t.listingId) })));
}

export async function downloadPurchase(listingId: string, type: "ex5" | "mq5") {
  const l = mListings.find((x) => x.id === listingId)!;
  const name = `${l.title.replace(/\W+/g, "_")}.${type}`;
  const url = URL.createObjectURL(new Blob([`Mock ${type} file for ${l.title}`], { type: "application/octet-stream" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export async function getWorkspaceStrategiesForPublish() {
  await wait(200);
  return clone(workspaceStrategiesForPublish);
}

export async function testDemoConnection(details: { server: string; account: string; password: string }) {
  await wait(1500);
  // Mock rule: account numbers must be digits and the server name must look like a demo server.
  if (!/^\d{5,}$/.test(details.account) || !/demo/i.test(details.server) || details.password.length < 4) {
    return { ok: false as const, message: "Could not log in. Check the server name, account number and investor password, and make sure it is a demo account." };
  }
  return { ok: true as const, message: "Connected to demo account. Balance $10,000.00" };
}

export async function submitListing(_data: Record<string, unknown>) {
  await wait(1200);
  return { id: crypto.randomUUID(), status: "In review" as const };
}

export async function getBuilderDashboard() {
  await wait(350);
  return clone(mDashboard);
}

export async function getReviewQueue() {
  await wait(300);
  return clone(queue.map((q) => ({ ...q, builder: mBuilders.find((b) => b.id === q.builderId)! })));
}

export async function reviewListing(id: string, decision: { approve: boolean; reason?: string }) {
  await wait(700);
  if (!decision.approve && !decision.reason?.trim()) throw new Error("A reason is required to reject a listing");
  queue = queue.filter((q) => q.id !== id);
  return { id, status: decision.approve ? "Live" : "Rejected" };
}
