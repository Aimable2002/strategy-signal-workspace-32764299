import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, ChevronDown, Download, FileArchive, FileBox, FileCode2, FileText, Folder, Loader2, Play, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CodeBlock } from "./CodeBlock";
import { getCompileErrors, getFileTree, getParametersFile, getStrategyFiles, getTerminalLogs } from "@/services/api";
import type { BacktestRun, CompileError, StrategyFiles } from "@/mockData";
import { cn } from "@/lib/utils";

const money = (n: number) => `${n < 0 ? "−" : "+"}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 };

function Metric({ label, value, tone }: { label: string; value: string; tone?: "profit" | "loss" }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-base font-semibold", tone === "profit" && "text-profit", tone === "loss" && "text-loss")}>{value}</div>
    </div>
  );
}

export function BacktestProgress({ progress }: { progress: number | null }) {
  if (progress === null) return null;
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs"><Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Running backtest in MT5 Strategy Tester<span className="ml-auto font-mono">{progress}%</span></div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}

export function ResultsTab({ run, progress }: { run: BacktestRun | null; progress: number | null }) {
  if (!run) return <div className="space-y-3"><Skeleton className="h-48" /><Skeleton className="h-24" /></div>;
  return (
    <div className="space-y-4">
      <BacktestProgress progress={progress} />
      <div>
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold">Equity curve · {run.version}</h3>
          <span className="text-[11px] text-muted-foreground">{run.date}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{run.settings}</p>
      </div>
      <div className="h-48 rounded-md border bg-card p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={run.equity}>
            <defs>
              <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} width={48} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, "Equity"]} labelFormatter={(l) => `Trade #${l}`} />
            <Area type="monotone" dataKey="equity" stroke="var(--primary)" strokeWidth={1.5} fill="url(#eq)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric label="Net profit" value={money(run.netProfit)} tone={run.netProfit >= 0 ? "profit" : "loss"} />
        <Metric label="Win rate" value={`${run.winRate}%`} />
        <Metric label="Profit factor" value={run.profitFactor.toFixed(2)} />
        <Metric label="Max drawdown" value={`${run.drawdown}%`} tone="loss" />
        <Metric label="Total trades" value={String(run.totalTrades)} />
        <Metric label="Sharpe ratio" value={run.sharpe.toFixed(2)} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Last 10 simulated trades</h3>
        <div className="scrollbar-thin overflow-x-auto rounded-md border">
          <table className="w-full text-xs">
            <thead className="bg-card text-muted-foreground">
              <tr>{["Time", "Symbol", "Side", "Size", "Entry", "Exit", "P&L"].map((h) => <th key={h} className="px-2 py-1.5 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="font-mono">
              {run.trades.map((t, i) => (
                <tr key={i} className="border-t">
                  <td className="whitespace-nowrap px-2 py-1.5 text-muted-foreground">{t.time}</td>
                  <td className="px-2 py-1.5">{t.symbol}</td>
                  <td className="px-2 py-1.5">{t.side}</td>
                  <td className="px-2 py-1.5">{t.size.toFixed(2)}</td>
                  <td className="px-2 py-1.5">{t.entry.toFixed(5)}</td>
                  <td className="px-2 py-1.5">{t.exit.toFixed(5)}</td>
                  <td className={cn("px-2 py-1.5 text-right", t.pnl >= 0 ? "text-profit" : "text-loss")}>{money(t.pnl)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function RunsTab({ runs }: { runs: BacktestRun[] | null }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [compare, setCompare] = useState(false);
  if (!runs) return <Skeleton className="h-40" />;
  if (runs.length === 0) return <p className="py-10 text-center text-sm text-muted-foreground">No backtests yet. Run one from Backtest settings.</p>;
  const toggle = (id: string) => { setCompare(false); setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s.slice(-1), id]); };
  const [a, b] = selected.map((id) => runs.find((r) => r.id === id)!);
  const merged = a && b ? a.equity.map((p, i) => ({ i, a: p.equity, b: b.equity[i]?.equity })) : [];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Select two runs to compare.</p>
        <Button size="sm" variant="outline" className="h-7" disabled={selected.length !== 2} onClick={() => setCompare(true)}>Compare</Button>
      </div>
      <div className="scrollbar-thin overflow-x-auto rounded-md border">
        <table className="w-full text-xs">
          <thead className="bg-card text-muted-foreground">
            <tr>{["", "Version", "Date", "Changes", "Net profit", "DD", "PF"].map((h) => <th key={h} className="px-2 py-1.5 text-left font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {[...runs].reverse().map((r) => (
              <tr key={r.id} className={cn("border-t", selected.includes(r.id) && "bg-primary/5")}>
                <td className="px-2 py-1.5"><Checkbox checked={selected.includes(r.id)} onCheckedChange={() => toggle(r.id)} aria-label={`Select ${r.version}`} /></td>
                <td className="px-2 py-1.5 font-mono">{r.version}</td>
                <td className="whitespace-nowrap px-2 py-1.5 font-mono text-muted-foreground">{r.date}</td>
                <td className="px-2 py-1.5">{r.changes}</td>
                <td className={cn("px-2 py-1.5 font-mono", r.netProfit >= 0 ? "text-profit" : "text-loss")}>{money(r.netProfit)}</td>
                <td className="px-2 py-1.5 font-mono">{r.drawdown}%</td>
                <td className="px-2 py-1.5 font-mono">{r.profitFactor.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {compare && a && b && (
        <div className="rounded-md border bg-card p-3">
          <div className="mb-2 flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-chart-1" />{a.version}</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-chart-2" />{b.version}</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={merged}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="i" hide />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} width={48} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="a" name={a.version} stroke="var(--chart-1)" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="b" name={b.version} stroke="var(--chart-2)" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

const DISCLAIMER = "This strategy is provided for educational and testing purposes. Backtest results are historical simulations and do not guarantee future performance. Test on a demo account before using it anywhere else.";

export function StrategyTab({ strategyId, runs, onDownload }: { strategyId: string; runs: BacktestRun[] | null; onDownload: (v: string, t: "mq5" | "ex5" | "zip") => void }) {
  const [version, setVersion] = useState("v3");
  const [files, setFiles] = useState<StrategyFiles | null>(null);
  const [failed, setFailed] = useState(false);
  const [errors, setErrors] = useState<CompileError[]>([]);
  useEffect(() => { setFiles(null); getStrategyFiles(strategyId, version).then((f) => setFiles(f ?? null)); getCompileErrors(strategyId, version).then(setErrors); }, [strategyId, version]);
  const run = runs?.find((r) => r.version === version);
  const versions = runs?.map((r) => r.version) ?? ["v1", "v2", "v3"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-semibold">{files?.name ?? "EMA crossover EURUSD"}</h3>
        <Button size="sm" className="ml-auto h-8" asChild><Link to="/sell/publish" search={{ strategy: strategyId, version }}>Publish to marketplace</Link></Button>
        <Select value={version} onValueChange={setVersion}>
          <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
          <SelectContent>{versions.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {!files ? <Skeleton className="h-32" /> : (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex flex-col rounded-md border bg-card p-3">
              <div className="flex items-center gap-2"><FileCode2 className="h-4 w-4 text-primary" /><span className="font-mono text-sm">{files.mq5.filename}</span></div>
              <p className="mt-1 text-[11px] text-muted-foreground">Source code · {files.mq5.sizeKb.toFixed(1)} KB</p>
              <Button size="sm" variant="outline" className="mt-auto h-7 pt-0" onClick={() => onDownload(version, "mq5")}><Download className="h-3.5 w-3.5" /> Download .mq5</Button>
            </div>
            <div className="flex flex-col gap-2 rounded-md border bg-card p-3">
              <div className="flex items-center gap-2"><FileBox className="h-4 w-4 text-primary" /><span className="font-mono text-sm">{files.ex5.filename}</span></div>
              <p className="text-[11px] text-muted-foreground">Compiled for MetaTrader 5 · {files.ex5.sizeKb.toFixed(1)} KB</p>
              {failed ? (
                <Badge variant="outline" className="w-fit border-loss/40 text-loss"><XCircle className="h-3 w-3" /> Compile failed · {errors.length} errors</Badge>
              ) : (
                <Badge variant="outline" className="w-fit border-profit/40 text-profit"><CheckCircle2 className="h-3 w-3" /> Compiled successfully · 0 errors · 0 warnings</Badge>
              )}
              <Button size="sm" variant="outline" className="h-7" disabled={failed} onClick={() => onDownload(version, "ex5")}><Download className="h-3.5 w-3.5" /> Download .ex5</Button>
            </div>
          </div>
          {failed && (
            <Collapsible defaultOpen className="rounded-md border border-warning/40 bg-warning/5 text-xs">
              <CollapsibleTrigger className="group flex w-full items-center gap-2 px-3 py-2 text-warning">
                <AlertTriangle className="h-3.5 w-3.5" /> {errors.length} compile errors <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 border-t border-warning/30 px-3 py-2 font-mono">
                {errors.map((e) => <div key={e.line}><span className="text-warning">EMA_Cross.mq5({e.line})</span> <span className="text-muted-foreground">error:</span> {e.message}</div>)}
              </CollapsibleContent>
            </Collapsible>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button size="sm" className="h-8" disabled={failed} onClick={() => onDownload(version, "zip")}><FileArchive className="h-3.5 w-3.5" /> Download both (.zip)</Button>
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="rounded border px-1 font-mono">dev</span> Simulate compile failure
              <Switch checked={failed} onCheckedChange={setFailed} />
            </label>
          </div>
          <p className="rounded-md border bg-muted/40 p-2.5 text-[11px] leading-snug text-muted-foreground">{DISCLAIMER}</p>
          <CodeBlock code={files.mq5.source} filename={files.mq5.filename} lineNumbers className="max-h-80 [&_pre]:max-h-72" />
          <div className="space-y-3 rounded-md border bg-card p-3 text-sm">
            <div><h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">What this strategy does</h4><p className="text-foreground/90">{files.summary.does}</p></div>
            <div><h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inputs you can change</h4>
              <ul className="list-disc space-y-0.5 pl-4 text-foreground/90">{files.summary.inputs.map((i) => <li key={i}>{i}</li>)}</ul></div>
            <div><h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Backtest result for this version</h4>
              {run ? (
                <div className="flex flex-wrap gap-4 font-mono text-xs">
                  <span>Net profit <span className={run.netProfit >= 0 ? "text-profit" : "text-loss"}>{money(run.netProfit)}</span></span>
                  <span>Drawdown <span className="text-loss">{run.drawdown}%</span></span>
                  <span>Profit factor {run.profitFactor.toFixed(2)}</span>
                </div>
              ) : <p className="text-xs text-muted-foreground">Not backtested yet.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type Node = Awaited<ReturnType<typeof getFileTree>>[number];

export function FilesTab({ strategyId, onDownload }: { strategyId: string; onDownload: (t: "mq5" | "ex5") => void }) {
  const [tree, setTree] = useState<Node[] | null>(null);
  const [sel, setSel] = useState("EMA_Cross.mq5");
  const [files, setFiles] = useState<StrategyFiles | null>(null);
  const [params, setParams] = useState("");
  useEffect(() => { getFileTree(strategyId).then(setTree); getStrategyFiles(strategyId, "v3").then((f) => setFiles(f ?? null)); getParametersFile(strategyId).then(setParams); }, [strategyId]);
  if (!tree || !files) return <Skeleton className="h-40" />;
  const icon = (t: string) => t === "mq5" ? FileCode2 : t === "ex5" ? FileBox : t === "dir" ? Folder : FileText;
  return (
    <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
      <ul className="space-y-0.5 rounded-md border bg-card p-1.5 text-xs">
        {tree.map((n) => {
          const I = icon(n.type);
          return (
            <li key={n.name}>
              <button onClick={() => setSel(n.name)} className={cn("flex w-full items-center gap-1.5 rounded px-2 py-1 font-mono hover:bg-accent", sel === n.name && "bg-accent text-primary")}><I className="h-3.5 w-3.5" />{n.name}</button>
              {"children" in n && n.children && <ul className="ml-4">{n.children.map((c) => (
                <li key={c}><button onClick={() => setSel(c)} className={cn("flex w-full items-center gap-1.5 rounded px-2 py-1 font-mono text-muted-foreground hover:bg-accent", sel === c && "bg-accent text-primary")}><FileText className="h-3.5 w-3.5" />{c}</button></li>
              ))}</ul>}
            </li>
          );
        })}
      </ul>
      <div className="min-w-0">
        {sel.endsWith(".mq5") && <CodeBlock code={files.mq5.source} filename={files.mq5.filename} lineNumbers className="[&_pre]:max-h-[60vh]" />}
        {sel.endsWith(".ex5") && (
          <div className="flex flex-col items-center gap-2 rounded-md border bg-card px-4 py-10 text-center">
            <FileBox className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Binary file, cannot be previewed</p>
            <p className="font-mono text-xs text-muted-foreground">{files.ex5.sizeKb.toFixed(1)} KB · compiled {files.ex5.compiledAt}</p>
            <Button size="sm" variant="outline" className="mt-2 h-7" onClick={() => onDownload("ex5")}><Download className="h-3.5 w-3.5" /> Download .ex5</Button>
          </div>
        )}
        {sel.endsWith(".set") && <CodeBlock code={params} filename="parameters.set" />}
        {sel.endsWith("/") && <p className="rounded-md border bg-card p-4 text-xs text-muted-foreground">Folder with HTML reports from each Strategy Tester run.</p>}
        {sel.endsWith(".html") && <p className="rounded-md border bg-card p-4 text-xs text-muted-foreground">{sel} — Strategy Tester report. Preview not available in this prototype.</p>}
      </div>
    </div>
  );
}

export function TerminalTab() {
  const [logs, setLogs] = useState<string[] | null>(null);
  useEffect(() => { getTerminalLogs().then(setLogs); }, []);
  return (
    <div className="scrollbar-thin h-[60vh] overflow-auto rounded-md border bg-terminal p-3 font-mono text-xs leading-relaxed">
      {!logs ? <span className="text-muted-foreground">Connecting…</span> : logs.map((l, i) => (
        <div key={i} className={cn(l.startsWith("$") ? "text-primary" : "text-muted-foreground", l.includes("0 errors") && "text-profit")}>{l}</div>
      ))}
    </div>
  );
}

export function SettingsTab({ onRun, progress, disabled }: { onRun: () => void; progress: number | null; disabled: boolean }) {
  const field = (label: string, el: React.ReactNode) => <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{label}</Label>{el}</div>;
  const sel = (def: string, opts: string[]) => (
    <Select defaultValue={def}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent>{opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {field("Symbol", sel("EURUSD", ["EURUSD", "GBPUSD", "XAUUSD", "USDJPY", "AUDUSD", "USDCAD"]))}
        {field("Timeframe", sel("H1", ["M5", "M15", "M30", "H1", "H4", "D1"]))}
        {field("From", <Input type="date" defaultValue="2023-01-01" className="h-8" />)}
        {field("To", <Input type="date" defaultValue="2024-12-31" className="h-8" />)}
        {field("Initial deposit (USD)", <Input type="number" defaultValue={10000} className="h-8 font-mono" />)}
        {field("Spread (points)", <Input type="number" defaultValue={10} className="h-8 font-mono" />)}
        <div className="col-span-2">{field("Modeling quality", sel("Every tick", ["Every tick", "1-minute OHLC", "Open prices only"]))}</div>
      </div>
      <Button className="w-full" onClick={onRun} disabled={progress !== null || disabled}>
        {progress !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run backtest · ~$0.02 from credits
      </Button>
      <BacktestProgress progress={progress} />
      <p className="text-[11px] text-muted-foreground">Backtests are historical simulations. No real trades are placed.</p>
    </div>
  );
}
