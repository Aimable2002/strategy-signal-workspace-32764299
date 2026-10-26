import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ListingCard, Page } from "@/components/market/shared";
import * as api from "@/services/api";
import { builders, listings, myBuilderId, STYLES, SYMBOLS, TIMEFRAMES, type Style } from "@/mockData";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sell/publish")({
  validateSearch: (s: Record<string, unknown>) => ({ strategy: s["strategy"] ? String(s["strategy"]) : undefined, version: s["version"] ? String(s["version"]) : undefined }) as { strategy?: string | undefined; version?: string | undefined },
  head: () => meta("Publish a strategy · Tickforge", "List a strategy from your workspace on the marketplace."),
  component: Publish,
});

const STEPS = ["Strategy", "Demo account", "Listing details", "Files & license", "Review"];

function Publish() {
  const search = Route.useSearch();
  const [step, setStep] = useState(0);
  const [strategies, setStrategies] = useState<Awaited<ReturnType<typeof api.getWorkspaceStrategiesForPublish>> | null>(null);
  const [strategyId, setStrategyId] = useState(search.strategy ?? "");
  const [version, setVersion] = useState(search.version ?? "");
  const [conn, setConn] = useState({ server: "", account: "", password: "" });
  const [connState, setConnState] = useState<{ status: "idle" | "testing" | "ok" | "fail"; message?: string }>({ status: "idle" });
  const [d, setD] = useState({ title: "", description: "", tags: "", symbol: "EURUSD", timeframe: "H1", style: "Trend" as Style, price: 99 });
  const [shots, setShots] = useState<string[]>([]);
  const [license, setLicense] = useState("ex5");
  const [sourcePrice, setSourcePrice] = useState(199);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { api.getWorkspaceStrategiesForPublish().then(setStrategies); }, []);
  const chosen = strategies?.find((s) => s.id === strategyId);
  useEffect(() => { if (chosen && !d.title) setD((x) => ({ ...x, title: chosen.title })); }, [chosen]); // eslint-disable-line react-hooks/exhaustive-deps

  const testConn = async () => {
    setConnState({ status: "testing" });
    const r = await api.testDemoConnection(conn);
    setConnState({ status: r.ok ? "ok" : "fail", message: r.message });
  };
  const canNext = [
    !!strategyId && !!version,
    connState.status === "ok",
    d.title.trim().length > 2 && d.description.trim().length > 10 && d.price > 0,
    license === "ex5" || sourcePrice > d.price,
    true,
  ][step];

  const preview = { ...listings[0]!, id: "preview", title: d.title || "Untitled", symbol: d.symbol, timeframe: d.timeframe, style: d.style, price: d.price, rating: 0, reviewCount: 0, broker: "Your demo account", builder: builders.find((b) => b.id === myBuilderId)! };

  const submit = async () => {
    setSubmitting(true);
    await api.submitListing({ strategyId, version, ...d, license, sourcePrice: license === "source" ? sourcePrice : null });
    setSubmitting(false); setDone(true);
  };

  if (done) return (
    <main className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <CheckCircle2 className="h-10 w-10 text-warning" />
      <h1 className="mt-4 text-xl font-semibold">In review. We'll notify you.</h1>
      <p className="mt-2 text-sm text-muted-foreground">Our team runs its own backtest and checks the listing. This usually takes 1–2 business days.</p>
      <Button className="mt-6" asChild><Link to="/sell">Back to dashboard</Link></Button>
    </main>
  );

  return (
    <Page title="Publish to marketplace">
      <ol className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-xs", i === step ? "border-primary text-foreground" : i < step ? "border-profit/40 text-profit" : "text-muted-foreground")}>
            <span className="font-mono">{i + 1}</span> {s}
          </li>
        ))}
      </ol>
      <div className="max-w-2xl space-y-4 rounded-lg border bg-card p-5">
        {step === 0 && (!strategies ? <Skeleton className="h-24" /> : (
          <>
            <h2 className="font-semibold">Choose a strategy from your workspace</h2>
            <RadioGroup value={strategyId} onValueChange={(v) => { setStrategyId(v); setVersion(strategies.find((s) => s.id === v)!.versions.at(-1)!); }} className="space-y-2">
              {strategies.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-primary">
                  <RadioGroupItem value={s.id} /><span className="text-sm">{s.title}</span>
                </label>
              ))}
            </RadioGroup>
            {chosen && (
              <div className="space-y-1"><Label className="text-xs">Version</Label>
                <Select value={version} onValueChange={setVersion}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>{chosen.versions.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
              </div>
            )}
          </>
        ))}
        {step === 1 && (
          <>
            <h2 className="font-semibold">Connect your MT5 demo account</h2>
            <div className="flex gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-xs text-warning">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Use a demo account only. Your login is stored encrypted on our servers and is never shown to buyers. Buyers' test runs use this account to run backtests.</span>
            </div>
            <div className="space-y-1"><Label className="text-xs">Server name</Label><Input placeholder="ICMarketsSC-Demo" value={conn.server} onChange={(e) => { setConn({ ...conn, server: e.target.value }); setConnState({ status: "idle" }); }} /></div>
            <div className="space-y-1"><Label className="text-xs">Account number</Label><Input inputMode="numeric" value={conn.account} onChange={(e) => { setConn({ ...conn, account: e.target.value }); setConnState({ status: "idle" }); }} /></div>
            <div className="space-y-1"><Label className="text-xs">Investor (read-only) password</Label><Input type="password" value={conn.password} onChange={(e) => { setConn({ ...conn, password: e.target.value }); setConnState({ status: "idle" }); }} /></div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={testConn} disabled={connState.status === "testing" || !conn.server || !conn.account || !conn.password}>
                {connState.status === "testing" && <Loader2 className="h-4 w-4 animate-spin" />} Test connection
              </Button>
              {connState.status === "ok" && <span className="flex items-center gap-1.5 text-sm text-profit"><CheckCircle2 className="h-4 w-4" />{connState.message}</span>}
            </div>
            {connState.status === "fail" && <p className="flex items-start gap-1.5 text-sm text-loss"><XCircle className="mt-0.5 h-4 w-4 shrink-0" />{connState.message}</p>}
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="font-semibold">Listing details</h2>
            <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea rows={4} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} placeholder="What the strategy does, when it trades, how it manages risk." /></div>
            <div className="space-y-1"><Label className="text-xs">Tags (comma separated)</Label><Input value={d.tags} onChange={(e) => setD({ ...d, tags: e.target.value })} /></div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1"><Label className="text-xs">Symbol</Label><Select value={d.symbol} onValueChange={(v) => setD({ ...d, symbol: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SYMBOLS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-xs">Timeframe</Label><Select value={d.timeframe} onValueChange={(v) => setD({ ...d, timeframe: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIMEFRAMES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-xs">Style</Label><Select value={d.style} onValueChange={(v) => setD({ ...d, style: v as Style })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STYLES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-xs">Price ($)</Label><Input type="number" min={1} value={d.price} onChange={(e) => setD({ ...d, price: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Screenshots</Label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed p-6 text-sm text-muted-foreground hover:border-primary/40">
                <ImagePlus className="h-4 w-4" /> Add screenshots
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setShots(Array.from(e.target.files ?? []).map((f) => f.name))} />
              </label>
              {shots.length > 0 && <p className="text-xs text-muted-foreground">{shots.join(", ")}</p>}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="font-semibold">Files and license</h2>
            <RadioGroup value={license} onValueChange={setLicense} className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-primary"><RadioGroupItem value="ex5" className="mt-0.5" /><div><div className="text-sm font-medium">.ex5 only</div><div className="text-xs text-muted-foreground">Buyers get the compiled file at ${d.price}.</div></div></label>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-primary"><RadioGroupItem value="source" className="mt-0.5" /><div><div className="text-sm font-medium">.ex5 plus .mq5 source</div><div className="text-xs text-muted-foreground">Offer source code as a higher-priced option.</div></div></label>
            </RadioGroup>
            {license === "source" && (
              <div className="space-y-1"><Label className="text-xs">Price with source ($)</Label><Input type="number" className="w-40" value={sourcePrice} onChange={(e) => setSourcePrice(Number(e.target.value))} />
                {sourcePrice <= d.price && <p className="text-xs text-loss">Must be higher than the .ex5 price (${d.price}).</p>}</div>
            )}
          </>
        )}
        {step === 4 && (
          <>
            <h2 className="font-semibold">Review and submit</h2>
            <p className="text-xs text-muted-foreground">{chosen?.title} · {version} · {license === "source" ? `.ex5 $${d.price} / with .mq5 $${sourcePrice}` : `.ex5 only $${d.price}`}</p>
            <div className="max-w-sm"><ListingCard listing={preview} preview /></div>
          </>
        )}
        <div className="flex justify-between border-t pt-4">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>Back</Button>
          {step < 4 ? <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Continue</Button>
            : <Button onClick={submit} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit for review</Button>}
        </div>
      </div>
      {step === 1 && <p className="mt-3 max-w-2xl text-xs text-muted-foreground">Tip for this demo: use a server name containing “Demo” and an account number of 5+ digits to see a successful connection.</p>}
    </Page>
  );
}
