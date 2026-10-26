import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgeCheck, Loader2, Lock, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BuilderAvatar, EquityChart, ErrorState, MetricGrid, Page, RiskDisclosure, Stars, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { SYMBOLS, TIMEFRAMES, type TrialResult, type TrialSettings } from "@/mockData";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/marketplace/$id")({
  head: () => meta("Strategy details · Tickforge Marketplace", "Backtest results, a free test run on your own settings, reviews and builder info."),
  component: Detail,
});

type Detail = Awaited<ReturnType<typeof api.getListing>>;

function Detail() {
  const { id } = Route.useParams();
  const [l, setL] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = () => { setError(null); setL(null); api.getListing(id).then(setL).catch((e) => setError(e.message)); };
  useEffect(load, [id]);

  if (error) return <Page title="Strategy"><ErrorState message={error === "Listing not found" ? "This strategy isn't available. It may have been removed." : error} onRetry={load} /></Page>;
  if (!l) return <main className="mx-auto max-w-7xl space-y-4 px-6 py-6"><Skeleton className="h-16" /><Skeleton className="h-80" /><Skeleton className="h-40" /></main>;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{l.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Link to="/builders/$id" params={{ id: l.builder.id }} className="flex items-center gap-2 hover:text-foreground"><BuilderAvatar builder={l.builder} />{l.builder.name}</Link>
            <Stars rating={l.rating} count={l.reviewCount} />
            <Badge variant="secondary">{l.symbol}</Badge><Badge variant="secondary">{l.timeframe}</Badge><Badge variant="outline">{l.style}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-mono text-xl font-semibold">{money(l.price)}</div>
            {l.sourcePrice != null && <div className="text-[11px] text-muted-foreground">{money(l.sourcePrice)} with source</div>}
          </div>
          <Button size="lg" asChild><Link to="/checkout/$id" params={{ id: l.id }}>Buy</Link></Button>
        </div>
      </div>

      <section className="mt-6 rounded-lg border bg-card p-4">
        <EquityChart series={[{ name: "Listed result", data: l.equity, color: "var(--color-primary)" }]} />
        <p className="mt-2 font-mono text-xs text-muted-foreground">{l.symbol} · {l.timeframe} · {l.period.from} to {l.period.to} · Deposit {money(l.deposit)} · Tested on: {l.broker}</p>
      </section>
      <div className="mt-4"><MetricGrid metrics={l.metrics} /></div>

      <TrialPanel listing={l} />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <h2 className="mb-2 font-semibold">What this strategy does</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{l.description}</p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">Inputs</h2>
            <div className="divide-y rounded-md border">
              {l.inputs.map((i) => (
                <div key={i.name} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="font-mono">{i.name}</span><span className="flex-1 text-xs text-muted-foreground">{i.note}</span><span className="font-mono text-xs">{i.value}</span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">Version history</h2>
            <ul className="space-y-2">
              {l.versions.map((v) => <li key={v.version} className="flex gap-3 text-sm"><Badge variant="outline" className="font-mono">{v.version}</Badge><span className="text-muted-foreground">{v.date}</span><span>{v.notes}</span></li>)}
            </ul>
          </section>
          <section>
            <h2 className="mb-3 font-semibold">Reviews</h2>
            {l.reviews.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet.</p> : (
              <div className="space-y-3">
                {l.reviews.map((r) => (
                  <div key={r.id} className="rounded-md border bg-card p-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium">{r.author}</span><Stars rating={r.rating} />
                      {r.verified && <Badge variant="outline" className="border-profit/40 text-profit"><BadgeCheck className="h-3 w-3" /> Verified purchase</Badge>}
                      <span className="ml-auto text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <aside className="h-fit rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3"><BuilderAvatar builder={l.builder} size="lg" /><div><div className="font-semibold">{l.builder.name}</div><Stars rating={l.builder.rating} /></div></div>
          <p className="mt-3 text-sm text-muted-foreground">{l.builder.bio}</p>
          <p className="mt-2 text-xs text-muted-foreground">{l.builder.totalSales} sales · member since {l.builder.memberSince.slice(0, 4)}</p>
          <Button variant="outline" size="sm" className="mt-4 w-full" asChild><Link to="/builders/$id" params={{ id: l.builder.id }}>View profile</Link></Button>
        </aside>
      </div>
      <RiskDisclosure />
    </main>
  );
}

function TrialPanel({ listing }: { listing: Detail }) {
  const [s, setS] = useState<TrialSettings>({ symbol: listing.symbol, timeframe: listing.timeframe, from: listing.period.from, to: listing.period.to, deposit: listing.deposit });
  const [left, setLeft] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<TrialResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getTrialsRemaining(listing.id).then(setLeft); }, [listing.id]);

  const run = async () => {
    setError(null); setProgress(0);
    try {
      const r = await api.runTrialBacktest(listing.id, s, setProgress);
      setResult(r);
    } catch (e) { setError((e as Error).message); }
    setProgress(null);
    setLeft(await api.getTrialsRemaining(listing.id));
  };
  const busy = progress != null;
  const invalid = !s.from || !s.to || s.from >= s.to || s.deposit < 100;

  return (
    <section className="mt-8 rounded-lg border border-primary/30 bg-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Test this strategy</h2>
        {left != null && <Badge variant="outline">{left} of {api.TRIAL_LIMIT} test runs left</Badge>}
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> You see results only. Strategy files are available after purchase.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1"><Label className="text-xs">Symbol</Label>
          <Select value={s.symbol} onValueChange={(v) => setS({ ...s, symbol: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SYMBOLS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">Timeframe</Label>
          <Select value={s.timeframe} onValueChange={(v) => setS({ ...s, timeframe: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIMEFRAMES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">From</Label><Input type="date" value={s.from} onChange={(e) => setS({ ...s, from: e.target.value })} /></div>
        <div className="space-y-1"><Label className="text-xs">To</Label><Input type="date" value={s.to} onChange={(e) => setS({ ...s, to: e.target.value })} /></div>
        <div className="space-y-1"><Label className="text-xs">Initial deposit ($)</Label><Input type="number" min={100} value={s.deposit} onChange={(e) => setS({ ...s, deposit: Number(e.target.value) })} /></div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={busy || left === 0 || invalid}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run backtest</Button>
        {left === 0 && <span className="text-xs text-muted-foreground">You've used all test runs for this strategy.</span>}
        {invalid && <span className="text-xs text-loss">Check the dates and use a deposit of at least $100.</span>}
      </div>
      {busy && <div className="mt-4 space-y-1"><Progress value={progress} className="h-1.5" /><p className="text-xs text-muted-foreground">Running backtest in MT5 Strategy Tester… {progress}%</p></div>}
      {error && <p className="mt-3 text-sm text-loss">{error}</p>}
      {result && !busy && (
        <div className="mt-5 space-y-4">
          <div className="rounded-md border bg-card p-3">
            <EquityChart height={260} series={[{ name: "Listed result", data: listing.equity, color: "var(--color-muted-foreground)" }, { name: "Your test", data: result.equity, color: "var(--color-primary)" }]} />
            <p className="mt-1 font-mono text-xs text-muted-foreground">Your test: {result.settings.symbol} · {result.settings.timeframe} · {result.settings.from} to {result.settings.to} · Deposit {money(result.settings.deposit)}</p>
          </div>
          <MetricGrid metrics={result.metrics} compare={listing.metrics} />
        </div>
      )}
    </section>
  );
}
