import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Download, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState, ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { creditPacks } from "@/mockData";
import { useDevState } from "@/lib/devState";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/billing")({
  head: () => meta("Billing and credits · Tickforge", "Credit balance, auto top-up, spending limit, usage, transactions and invoices."),
  component: Billing,
});

function AddCredits({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(25);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buy = async () => {
    setBusy(true); setError(null);
    try { await api.addCredits(amount); window.dispatchEvent(new Event("credits-changed")); setOpen(false); onDone(); } catch (e) { setError((e as Error).message); }
    setBusy(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="lg">Add credits</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add credits</DialogTitle></DialogHeader>
        <div className="grid grid-cols-4 gap-2">{creditPacks.map((p) => <button key={p} onClick={() => setAmount(p)} className={cn("rounded-md border py-3 font-mono", amount === p && "border-primary bg-primary/10 text-primary")}>${p}</button>)}</div>
        <div className="space-y-1"><Label className="text-xs">Or a custom amount</Label><Input type="number" min={5} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
        <p className="text-xs text-muted-foreground">Demo checkout. No card is charged.</p>
        {error && <p className="text-sm text-loss">{error}</p>}
        <DialogFooter><Button onClick={buy} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Pay {money(amount || 0, 2)}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const SERIES = [["running", "Workspace running", "var(--color-chart-1)"], ["storage", "Storage", "var(--color-chart-5)"], ["backtests", "Backtests", "var(--color-chart-2)"], ["ai", "AI usage", "var(--color-chart-3)"]] as const;

function Billing() {
  const dev = useDevState();
  const [bal, setBal] = useState<number | null>(null);
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof api.getBillingSettings>> | null>(null);
  const [usage, setUsage] = useState<Awaited<ReturnType<typeof api.getUsageBreakdown>> | null>(null);
  const [tx, setTx] = useState<Awaited<ReturnType<typeof api.getTransactions>> | null>(null);
  const [inv, setInv] = useState<Awaited<ReturnType<typeof api.getInvoices>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState("");
  const load = () => {
    setError(null);
    Promise.all([api.getCreditBalance(), api.getBillingSettings(), api.getUsageBreakdown(), api.getTransactions(), api.getInvoices()])
      .then(([b, s, u, t, i]) => { setBal(b.balance); setSettings(s); setLimitInput(String(s.spendingLimit.limit)); setUsage(u); setTx(t); setInv(i); })
      .catch((e) => setError(e.message));
  };
  useEffect(load, [dev.credit]);

  if (error) return <Page title="Billing"><ErrorState message={error} onRetry={load} /></Page>;
  const pct = settings ? (settings.spendingLimit.spent / settings.spendingLimit.limit) * 100 : 0;

  return (
    <Page title="Billing" subtitle="Prepaid credits. No plans, no subscriptions.">
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border bg-card p-5 lg:col-span-1">
          <div className="text-xs text-muted-foreground">Credit balance</div>
          {bal == null ? <Skeleton className="mt-2 h-10 w-32" /> : <div className={cn("mt-1 font-mono text-4xl font-semibold", bal <= 0 ? "text-loss" : bal < 2 && "text-warning")}>{money(bal, 2)}</div>}
          <p className="mt-1 text-xs text-muted-foreground">≈ {bal ? Math.floor(bal / api.hourlyRate()) : 0} workspace hours</p>
          <div className="mt-4"><AddCredits onDone={load} /></div>
        </section>
        <section className="space-y-4 rounded-lg border bg-card p-5">
          {!settings ? <Skeleton className="h-32" /> : (<>
            <label className="flex items-center justify-between text-sm font-medium">Auto top-up<Switch checked={settings.autoTopUp.enabled} onCheckedChange={async (v) => setSettings({ ...settings, autoTopUp: await api.setAutoTopUp({ ...settings.autoTopUp, enabled: v }) })} /></label>
            <div className={cn("flex flex-wrap items-center gap-2 text-sm", !settings.autoTopUp.enabled && "opacity-50")}>
              Top up $<Input className="h-8 w-20" type="number" disabled={!settings.autoTopUp.enabled} value={settings.autoTopUp.amount} onChange={(e) => setSettings({ ...settings, autoTopUp: { ...settings.autoTopUp, amount: Number(e.target.value) } })} onBlur={() => api.setAutoTopUp(settings.autoTopUp)} />
              when balance falls below $<Input className="h-8 w-20" type="number" disabled={!settings.autoTopUp.enabled} value={settings.autoTopUp.below} onChange={(e) => setSettings({ ...settings, autoTopUp: { ...settings.autoTopUp, below: Number(e.target.value) } })} onBlur={() => api.setAutoTopUp(settings.autoTopUp)} />
            </div>
          </>)}
        </section>
        <section className="space-y-3 rounded-lg border bg-card p-5">
          {!settings ? <Skeleton className="h-32" /> : (<>
            <div className="text-sm font-medium">Monthly spending limit</div>
            <div className="flex gap-2"><Input type="number" className="h-8" value={limitInput} onChange={(e) => setLimitInput(e.target.value)} /><Button size="sm" variant="outline" onClick={async () => setSettings({ ...settings, spendingLimit: await api.setSpendingLimit(Number(limitInput)) })}>Save</Button></div>
            <Progress value={Math.min(100, pct)} className="h-1.5" />
            <p className="text-xs text-muted-foreground">{money(settings.spendingLimit.spent, 2)} of {money(settings.spendingLimit.limit, 2)} used this month</p>
            {pct >= 80 && <p className="flex items-center gap-1.5 text-xs text-warning"><AlertTriangle className="h-3.5 w-3.5" /> You've used {Math.round(pct)}% of your limit. Workspaces stop at 100%.</p>}
          </>)}
        </section>
      </div>

      <section className="mt-6 rounded-lg border bg-card p-5">
        <h2 className="mb-3 font-semibold">Usage by day</h2>
        {!usage ? <Skeleton className="h-64" /> : (
          <div className="h-64"><ResponsiveContainer>
            <BarChart data={usage.byDay}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} width={40} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", fontSize: 12 }} formatter={(v: number) => money(v, 2)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {SERIES.map(([k, n, c]) => <Bar key={k} dataKey={k} name={n} stackId="a" fill={c} />)}
            </BarChart>
          </ResponsiveContainer></div>
        )}
        {usage && (
          <Table className="mt-4">
            <TableHeader><TableRow><TableHead>Workspace</TableHead>{SERIES.map(([k, n]) => <TableHead key={k} className="text-right">{n}</TableHead>)}<TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>{usage.byWorkspace.map((w) => <TableRow key={w.workspace}><TableCell>{w.workspace}</TableCell>{SERIES.map(([k]) => <TableCell key={k} className="text-right font-mono">{money(w[k], 2)}</TableCell>)}<TableCell className="text-right font-mono font-semibold">{money(w.running + w.storage + w.backtests + w.ai, 2)}</TableCell></TableRow>)}</TableBody>
          </Table>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border bg-card p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Transactions</h2>
          {!tx ? <Skeleton className="h-40" /> : tx.length === 0 ? <EmptyState title="No transactions yet" /> : (
            <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>{tx.map((t) => <TableRow key={t.id}><TableCell className="font-mono text-xs">{t.date}</TableCell><TableCell>{t.type}</TableCell><TableCell className="text-muted-foreground">{t.description}</TableCell><TableCell className={cn("text-right font-mono", t.amount >= 0 ? "text-profit" : "")}>{t.amount >= 0 ? "+" : ""}{money(t.amount, 2)}</TableCell></TableRow>)}</TableBody></Table>
          )}
        </section>
        <section className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-semibold">Invoices</h2>
          {!inv ? <Skeleton className="h-40" /> : inv.length === 0 ? <EmptyState title="No invoices yet" /> : inv.map((i) => (
            <div key={i.id} className="flex items-center gap-2 border-t py-2 text-sm first:border-0"><span className="flex-1 font-mono text-xs">{i.id}<span className="block text-muted-foreground">{i.date}</span></span><span className="font-mono">{money(i.amount, 2)}</span>
              <Button size="icon" variant="ghost" aria-label={`Download ${i.id}`} onClick={() => api.downloadText(`${i.id}.txt`, `Invoice ${i.id}\nDate: ${i.date}\nCredit top-up: ${money(i.amount, 2)}`)}><Download className="h-4 w-4" /></Button></div>
          ))}
        </section>
      </div>
    </Page>
  );
}
