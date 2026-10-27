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
  makeCurve,
  reviewQueue as mReviewQueue,
  reviews as mReviews,
  workspaceStrategiesForPublish,
  backtestRecords as mRecords,
  type Listing,
  type Metrics,
  type TrialResult,
  type TrialSettings,
  FREE_TESTS_PER_DAY,
  TRIAL_RUN_COST,
} from "@/mockData";
import { creditBalance, chargeCredits } from "./credits";

export type SortKey = "newest" | "purchased" | "rating" | "drawdown";
export interface ListingFilters {
  q?: string | undefined;
  symbol?: string | undefined;
  timeframe?: string | undefined;
  style?: string | undefined;
  broker?: string | undefined;
  maxPrice?: number | undefined;
  sort?: SortKey | undefined;
}

export const TRIAL_LIMIT = FREE_TESTS_PER_DAY;
let trials: (TrialResult & { charged?: boolean })[] = [];
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

// Free daily allowance shared across all strategies; after that each run is charged from credits.
const today = () => new Date().toISOString().slice(0, 10);
export async function getTrialsRemaining(_listingId?: string) {
  return Math.max(0, TRIAL_LIMIT - trials.filter((t) => t.date === today() && !t.charged).length);
}

export async function runTrialBacktest(listingId: string, settings: TrialSettings, onProgress?: (p: number) => void): Promise<TrialResult> {
  if (trialsPaused) throw new Error("Test runs are temporarily paused. Please try again later.");
  const free = (await getTrialsRemaining(listingId)) > 0;
  if (!free && creditBalance() < TRIAL_RUN_COST) throw new Error("Out of credits. Add credits to run more tests.");
  const l = mListings.find((x) => x.id === listingId);
  if (!l) throw new Error("Listing not found");
  for (let p = 0; p <= 100; p += 5) { onProgress?.(p); await wait(150); }
  const n = trials.length + 1;
  const sameMarket = settings.symbol === l.symbol && settings.timeframe === l.timeframe;
  const exact = sameMarket && settings.from === l.period.from && settings.to === l.period.to && settings.deposit === l.deposit;
  if (exact) {
    const result: TrialResult = { id: crypto.randomUUID(), listingId, date: new Date().toISOString().slice(0, 10), settings, metrics: { ...l.metrics, netProfit: Math.round(l.metrics.netProfit * 0.98) }, equity: l.equity.map((p) => ({ ...p })) };
    if (!free) chargeCredits(TRIAL_RUN_COST, "Buyer test run");
    trials = [...trials, { ...result, charged: !free }];
    return clone(result);
  }
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
  const result: TrialResult = { id: crypto.randomUUID(), listingId, date: new Date().toISOString().slice(0, 10), settings, metrics, equity: makeCurve(100 + n, settings.deposit, metrics.netProfit, metrics.drawdown) };
  if (!free) chargeCredits(TRIAL_RUN_COST, "Buyer test run");
  trials = [...trials, { ...result, charged: !free }];
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

export async function getBacktestRecord(strategyId: string, version: string) {
  await wait(150);
  return clone(mRecords.find((r) => r.strategyId === strategyId && r.version === version) ?? null);
}

/** Versions that have a passed, platform-saved backtest record. Only these can be published. */
export function publishableVersionsFor(strategyId: string) {
  return mRecords.filter((r) => r.strategyId === strategyId && r.status === "passed").map((r) => r.version);
}
export async function getPublishableVersions(strategyId: string) {
  await wait(100);
  return publishableVersionsFor(strategyId);
}

export async function publishListing(data: { strategyId: string; version: string } & Record<string, unknown>) {
  await wait(1200);
  if (!publishableVersionsFor(data.strategyId).includes(data.version)) throw new Error("This version has no passed backtest record and can't be published");
  return { id: crypto.randomUUID(), status: "In review" as const };
}
export const submitListing = publishListing;

export const MATCH_TOLERANCE_PCT = 10;
const pctDiff = (a: number, b: number) => (b === 0 ? (a === 0 ? 0 : 100) : Math.round(((a - b) / Math.abs(b)) * 1000) / 10);
/** Compares a buyer's test run with the listed (recorded) result, per metric. */
export function compareMetrics(listed: Metrics, test: Metrics) {
  const keys = ["netProfit", "profitFactor", "drawdown", "winRate", "totalTrades", "sharpe"] as const;
  const diffs = keys.map((k) => ({ metric: k, listed: listed[k], test: test[k], diffPct: pctDiff(test[k], listed[k]) }));
  const core = diffs.filter((d) => d.metric === "netProfit" || d.metric === "profitFactor" || d.metric === "drawdown");
  return { diffs, matches: core.every((d) => Math.abs(d.diffPct) <= MATCH_TOLERANCE_PCT) };
}
export async function compareWithListing(listingId: string, trialRunId: string) {
  const l = mListings.find((x) => x.id === listingId);
  const t = trials.find((x) => x.id === trialRunId);
  if (!l || !t) throw new Error("Test run not found");
  return compareMetrics(l.metrics, t.metrics);
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

// ───────────────────────── Platform: access, credits, account, help, admin ─────────────────────────
import {
  adminUsers as mAdminUsers,
  costMonitor as mCost,
  creditPacks,
  disputes as mDisputes,
  helpArticles,
  helpCategories,
  invoices as mInvoices,
  legalDocs,
  notifications as mNotifications,
  orders as mOrders,
  PAYMENT_FEE,
  pendingPayouts as mPayouts,
  rateCard,
  reports as mReports,
  usageByDay,
  usageByWorkspace,
  whatsAppSettings as mWhatsApp,
  workspaces as mWorkspaces,
  type DisputeStatus,
} from "@/mockData";
import { creditBalance as _balance, topUp, txLog } from "./credits";

// Access (mock: always succeeds unless input is obviously invalid)
export async function signUp(d: { name: string; email: string; password: string; goal: string }) {
  await wait(900);
  if (!/^\S+@\S+\.\S+$/.test(d.email)) throw new Error("Enter a valid email address");
  if (d.password.length < 8) throw new Error("Password must be at least 8 characters");
  return { ok: true };
}
export async function logIn(d: { email: string; password: string }) {
  await wait(800);
  if (d.password === "wrong") throw new Error("Email or password is incorrect");
  if (!d.email || !d.password) throw new Error("Enter your email and password");
  return { ok: true };
}
export async function resetPassword(d: { email?: string; password?: string }) {
  await wait(800);
  if (d.password !== undefined && d.password.length < 8) throw new Error("Password must be at least 8 characters");
  return { ok: true };
}
export async function getOnboardingState() {
  await wait(150);
  return { completed: false, step: 0 };
}

// Pricing and credits
export async function getRateCard() { await wait(150); return { rates: clone(rateCard), packs: [...creditPacks] }; }
export function estimateCost(hoursPerWeek: number, backtestsPerWeek: number, aiMessagesPerWeek = 100) {
  const r = Object.fromEntries(rateCard.map((x) => [x.id, x.rate]));
  const weeks = 4.33;
  const monthly = hoursPerWeek * weeks * r["running"]! + backtestsPerWeek * weeks * r["backtest"]! + (aiMessagesPerWeek * weeks / 1000) * r["ai"]! + 3 * r["storage"]!;
  return +monthly.toFixed(2);
}
export function hourlyRate() { return rateCard.find((r) => r.id === "running")!.rate; }
export async function getCreditBalance() { return { balance: _balance(), hourly: hourlyRate() }; }
export async function addCredits(amount: number) {
  await wait(900);
  if (!(amount >= 5)) throw new Error("Minimum top-up is $5");
  topUp(amount);
  return { balance: _balance() };
}
let autoTopUp = { enabled: false, amount: 25, below: 5 };
let spendingLimit = { limit: 50, spent: 41.2 };
export async function getBillingSettings() { await wait(150); return { autoTopUp: { ...autoTopUp }, spendingLimit: { ...spendingLimit } }; }
export async function setAutoTopUp(v: typeof autoTopUp) { await wait(300); autoTopUp = { ...v }; return autoTopUp; }
export async function setSpendingLimit(limit: number) { await wait(300); spendingLimit = { ...spendingLimit, limit }; return spendingLimit; }
export async function getUsageBreakdown() { await wait(300); return { byDay: clone(usageByDay), byWorkspace: clone(usageByWorkspace) }; }
export async function getTransactions() { await wait(250); return clone(txLog); }
export async function getInvoices() { await wait(250); return clone(mInvoices); }
export async function getOrders() { await wait(250); return clone(mOrders); }
export function downloadText(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
export function getTrialRunCost() { return { cost: TRIAL_RUN_COST, freePerDay: FREE_TESTS_PER_DAY }; }

// Payouts: builders keep 100% of sale price minus payment processing fee
export function processingFee(price: number) { return +(price * PAYMENT_FEE.percent / 100 + PAYMENT_FEE.fixed).toFixed(2); }
export function builderEarnings(price: number) { return +(price - processingFee(price)).toFixed(2); }
let payoutSetup = { fullName: "Jamie Doe", dob: "", address: "", country: "United Kingdom", method: "bank", accountName: "", iban: "", taxId: "", taxCountry: "United Kingdom", identity: "Verified", bank: "Pending", tax: "Not started" };
export async function getPayoutSetup() { await wait(250); return { ...payoutSetup }; }
export async function savePayoutSetup(d: Partial<typeof payoutSetup>) {
  await wait(700);
  payoutSetup = { ...payoutSetup, ...d, bank: d.iban ? "Pending" : payoutSetup.bank, tax: d.taxId ? "Pending" : payoutSetup.tax };
  return { ...payoutSetup };
}

// Listings management
export async function updateListing(id: string, d: { title: string; description: string; price: number; tags: string }) {
  await wait(600);
  if (!d.title.trim()) throw new Error("Title is required");
  if (!(d.price > 0)) throw new Error("Price must be greater than 0");
  const l = mListings.find((x) => x.id === id);
  if (l) { l.title = d.title; l.description = d.description; l.price = d.price; }
  return { ok: true };
}
export async function publishNewVersion(_id: string, d: { version: string; changelog: string }) {
  await wait(900);
  if (!d.changelog.trim()) throw new Error("Add a short changelog");
  return { status: "In review" as const };
}
let myReviews: Record<string, { rating: number; comment: string } | undefined> = {};
export async function getMyReview(listingId: string) { return myReviews[listingId] ?? null; }
export async function submitReview(listingId: string, d: { rating: number; comment: string } | null) {
  await wait(500);
  if (d && (d.rating < 1 || d.rating > 5)) throw new Error("Pick a rating from 1 to 5");
  if (d && !purchases.some((p) => p.listingId === listingId)) throw new Error("Only verified buyers can review");
  myReviews = { ...myReviews, [listingId]: d ?? undefined };
  return myReviews[listingId] ?? null;
}
export async function hasPurchased(listingId: string) { return purchases.some((p) => p.listingId === listingId); }
export async function reportListing(listingId: string, d: { reason: string; details: string }) {
  await wait(600);
  if (!d.reason) throw new Error("Choose a reason");
  return { id: crypto.randomUUID(), listingId };
}
let favorites = new Set<string>(["l1", "l5"]);
export async function toggleFavorite(listingId: string) {
  await wait(120);
  favorites = new Set(favorites);
  if (favorites.has(listingId)) favorites.delete(listingId); else favorites.add(listingId);
  return favorites.has(listingId);
}
export function isFavoriteSync(listingId: string) { return favorites.has(listingId); }
export async function getFavorites() {
  await wait(250);
  return clone(mListings.filter((l) => favorites.has(l.id)).map((l) => ({ ...l, builder: mBuilders.find((b) => b.id === l.builderId)! })));
}
export async function getListingAnalytics(id: string) {
  await wait(300);
  const l = mListings.find((x) => x.id === id);
  if (!l) throw new Error("Listing not found");
  const seed = Number(id.replace(/\D/g, "")) || 1;
  const daily = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, views: 40 + ((i * 13 + seed * 7) % 35), tests: 6 + ((i * 5 + seed) % 9), sales: (i * 3 + seed) % 4 === 0 ? 2 : (i + seed) % 3 === 0 ? 1 : 0 }));
  const views = daily.reduce((a, d) => a + d.views, 0);
  const started = daily.reduce((a, d) => a + d.tests, 0);
  const sales = daily.reduce((a, d) => a + d.sales, 0);
  return { title: l.title, views, started, completed: Math.round(started * 0.86), sales, daily };
}

// Refunds and disputes
let disputes = clone(mDisputes);
export async function createRefundRequest(d: { orderId: string; reason: string; details: string }) {
  await wait(700);
  if (!d.orderId || !d.reason) throw new Error("Choose a purchase and a reason");
  const o = mOrders.find((x) => x.id === d.orderId);
  disputes = [{ id: crypto.randomUUID(), orderId: d.orderId, listing: o?.item ?? "", buyer: "Jamie Doe", builder: "—", amount: o?.amount ?? 0, reason: d.reason, message: d.details, status: "Open", date: new Date().toISOString().slice(0, 10) }, ...disputes];
  return { status: "Open" as DisputeStatus };
}
export async function getDisputes() { await wait(250); return clone(disputes); }
export async function respondToDispute(id: string, response: string) {
  await wait(500);
  if (!response.trim()) throw new Error("Write a response");
  disputes = disputes.map((d) => (d.id === id ? { ...d, response, status: "Responded" } : d));
  return disputes.find((d) => d.id === id)!;
}
export async function setDisputeStatus(id: string, status: DisputeStatus) {
  await wait(400);
  disputes = disputes.map((d) => (d.id === id ? { ...d, status } : d));
}

// Notifications
let notes = clone(mNotifications);
const noteSubs = new Set<() => void>();
export function subscribeNotifications(f: () => void) { noteSubs.add(f); return () => { noteSubs.delete(f); }; }
export async function getNotifications() { await wait(200); return clone(notes); }
export async function markNotificationRead(id: string | "all") {
  notes = notes.map((n) => (id === "all" || n.id === id ? { ...n, read: true } : n));
  noteSubs.forEach((f) => f());
}

// Workspaces
let wss = clone(mWorkspaces) as { id: string; name: string; status: "Running" | "Stopped" | "Archived"; costThisMonth: number; storageGb: number; lastActive: string }[];
export async function getWorkspaces() { await wait(300); return clone(wss); }
export async function updateWorkspaceState(id: string, action: "start" | "stop" | "archive" | "delete" | "create", name?: string) {
  await wait(700);
  if (action === "create") { wss = [...wss, { id: crypto.randomUUID(), name: name || `Workspace ${wss.length + 1}`, status: "Stopped", costThisMonth: 0, storageGb: 0.5, lastActive: "Just now" }]; return clone(wss); }
  if (action === "start" && _balance() <= 0) throw new Error("Out of credits. Add credits to start a workspace.");
  if (action === "delete") wss = wss.filter((w) => w.id !== id);
  else wss = wss.map((w) => (w.id === id ? { ...w, status: action === "start" ? "Running" : action === "stop" ? "Stopped" : "Archived", lastActive: "Just now" } : w));
  return clone(wss);
}

// Help, legal, support
export async function getHelpArticles(q = "") {
  await wait(200);
  const t = q.trim().toLowerCase();
  return { categories: clone(helpCategories), articles: clone(helpArticles.filter((a) => !t || a.title.toLowerCase().includes(t) || a.summary.toLowerCase().includes(t))) };
}
export async function getHelpArticle(slug: string) {
  await wait(200);
  const article = helpArticles.find((x) => x.slug === slug);
  if (!article) return null;
  const category = helpCategories.find((c) => c.slug === article.category) ?? null;
  const related = helpArticles.filter((x) => x.category === article.category && x.slug !== slug).slice(0, 3);
  return clone({ article, category, related });
}
export function getLegalDoc(slug: string) { return legalDocs[slug] ?? null; }
export async function submitSupportRequest(d: { topic: string; message: string; attachment?: string }) {
  await wait(800);
  if (!d.topic || d.message.trim().length < 10) throw new Error("Pick a topic and write at least 10 characters");
  return { ticket: `T-${Math.floor(1000 + Math.random() * 9000)}` };
}

// WhatsApp contact (click-to-chat link only; no messaging is sent by the platform)
let wa = clone(mWhatsApp);
export async function getWhatsAppSettings(builderId: string) { return wa[builderId] ?? { number: "", enabled: false }; }
export async function saveWhatsAppSettings(builderId: string, d: { number: string; enabled: boolean }) {
  await wait(400);
  const digits = d.number.replace(/[^\d]/g, "");
  if (d.enabled && digits.length < 8) throw new Error("Enter your number with country code, e.g. +44 7700 900123");
  wa = { ...wa, [builderId]: { number: d.number, enabled: d.enabled } };
  return wa[builderId]!;
}
export function whatsAppLink(number: string, title?: string) {
  const text = title ? `Hi, I have a question about your strategy: ${title}` : "Hi, I have a question about your strategies on Tickforge";
  return `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
}

// Admin
let users = clone(mAdminUsers);
export async function getAdminUsers(q = "") {
  await wait(250);
  const t = q.toLowerCase();
  return clone(users.filter((u) => !t || u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t)));
}
export async function setUserStatus(id: string, status: "Active" | "Suspended") { await wait(300); users = users.map((u) => (u.id === id ? { ...u, status } : u)); }
let rpts = clone(mReports);
export async function getReports() { await wait(250); return clone(rpts); }
export async function resolveReport(id: string, action: "resolve" | "remove") { await wait(400); rpts = rpts.map((r) => (r.id === id ? { ...r, status: action === "remove" ? "Listing removed" : "Resolved" } : r)); }
let pays = clone(mPayouts).map((p) => ({ ...p, status: "Pending" }));
export async function getPayouts() { await wait(250); return clone(pays); }
export async function setPayoutStatus(id: string, status: "Approved" | "On hold") { await wait(400); pays = pays.map((p) => (p.id === id ? { ...p, status } : p)); }
let budget = mCost.dailyBudget;
let trialsPaused = false;
export async function getCostMonitor() {
  await wait(300);
  const revenue = mCost.revenueVsCost.reduce((a, d) => a + d.revenue, 0);
  const cost = mCost.revenueVsCost.reduce((a, d) => a + d.cost, 0);
  return { ...clone(mCost), revenue, cost, margin: revenue - cost, dailyBudget: budget, trialsPaused };
}
export function budgetAlert(spend: number, budgetAmount: number) { return spend >= budgetAmount * 0.8; }
export async function setBudgetAlert(amount: number) { await wait(300); if (!(amount > 0)) throw new Error("Budget must be above 0"); budget = amount; return budget; }
export async function setTrialRunsPaused(v: boolean) { await wait(300); trialsPaused = v; return v; }
export function areTrialRunsPaused() { return trialsPaused; }
