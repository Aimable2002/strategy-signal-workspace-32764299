import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmAction, tableSkeleton, useLoad } from "@/components/market/adminShared";
import { ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/cost")({
  head: () => meta("Cost monitor · Tickforge Admin", "Usage revenue, infrastructure cost and margin."),
  component: Cost,
});

const Stat = ({ label, value, tone, sub }: { label: string; value: string; tone?: string; sub?: string }) => (
  <div className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">{label}</div><div className={cn("mt-1 font-mono text-2xl font-semibold", tone)}>{value}</div>{sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}</div>
);

function Cost() {
  const { data, error, load } = useLoad(() => api.getCostMonitor());
  const [budget, setBudget] = useState("");
  const [saving, setSaving] = useState(false);
  const [budgetMsg, setBudgetMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmPause, setConfirmPause] = useState(false);
  useEffect(() => { if (data) setBudget(String(data.dailyBudget)); }, [data?.dailyBudget]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <Page title="Cost monitor"><ErrorState message={error} onRetry={load} /></Page>;
  if (!data) return <Page title="Cost monitor">{tableSkeleton}</Page>;

  const pct = Math.round((data.todaySpend / data.dailyBudget) * 100);
  const warn = api.budgetAlert(data.todaySpend, data.dailyBudget);
  const over = pct >= 100;
  const marginPct = data.revenue ? Math.round((data.margin / data.revenue) * 100) : 0;
  const lowMargin = [...data.lowMarginUsers].map((u) => ({ ...u, margin: u.revenue - u.cost })).sort((a, b) => a.margin - b.margin).slice(0, 10);

  const save = async () => {
    setSaving(true); setBudgetMsg(null);
    try { await api.setBudgetAlert(Number(budget)); setBudgetMsg({ ok: true, text: "Daily budget saved." }); load(); }
    catch (e) { setBudgetMsg({ ok: false, text: (e as Error).message }); }
    setSaving(false);
  };

  return (
    <Page title="Cost monitor" subtitle="Last 14 days. Revenue is what users were charged; cost is what the platform paid for infrastructure.">
      {(warn || data.trialsPaused) && (
        <div className={cn("mb-4 flex items-start gap-2 rounded-md border p-3 text-sm", over ? "border-loss/50 bg-loss/10 text-loss" : "border-warning/50 bg-warning/10 text-warning")} role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            {warn && <p>{over ? `Today's spend (${money(data.todaySpend)}) has passed the daily budget of ${money(data.dailyBudget)}.` : `Today's spend is ${pct}% of the daily budget.`}</p>}
            {data.trialsPaused && <p>New test runs are paused. Buyers cannot start a test until you turn them back on.</p>}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Usage revenue" value={money(data.revenue)} />
        <Stat label="Infrastructure cost" value={money(data.cost)} />
        <Stat label="Margin" value={money(data.margin)} tone={data.margin < 0 ? "text-loss" : "text-profit"} sub={`${marginPct}% of revenue`} />
      </div>

      <section className="mt-6 rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Revenue and cost per day</h2>
        <div className="h-64 w-full" role="img" aria-label="Line chart of daily revenue and infrastructure cost">
          <ResponsiveContainer>
            <LineChart data={data.revenueVsCost} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} width={48} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", fontSize: 12 }} formatter={(v: number) => money(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line name="Revenue" dataKey="revenue" stroke="var(--color-profit)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line name="Cost" dataKey="cost" stroke="var(--color-warning)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">Daily budget</h2>
          <p className="mt-1 text-xs text-muted-foreground">Today's spend: {money(data.todaySpend)} of {money(data.dailyBudget)}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.min(pct, 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Today's spend against the daily budget">
            <div className={cn("h-full rounded-full", over ? "bg-loss" : warn ? "bg-warning" : "bg-primary")} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <div className="mt-4 flex items-end gap-2">
            <div className="space-y-1"><Label htmlFor="budget" className="text-xs">Daily budget ($)</Label><Input id="budget" type="number" min={1} value={budget} onChange={(e) => setBudget(e.target.value)} className="w-32" /></div>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save budget"}</Button>
          </div>
          {budgetMsg && <p className={cn("mt-2 text-sm", budgetMsg.ok ? "text-profit" : "text-loss")}>{budgetMsg.text}</p>}
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">Pause new test runs</h2>
          <p className="mt-1 text-xs text-muted-foreground">Emergency switch. While on, buyers cannot start marketplace test runs. Runs already in progress finish normally.</p>
          <div className="mt-4 flex items-center gap-3">
            <Switch id="pause" checked={data.trialsPaused} onCheckedChange={(on) => (on ? setConfirmPause(true) : api.setTrialRunsPaused(false).then(load))} />
            <Label htmlFor="pause" className="text-sm">{data.trialsPaused ? "Test runs are paused" : "Test runs are running"}</Label>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 text-sm font-semibold">Lowest margin users</h2>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Margin</TableHead></TableRow></TableHeader>
              <TableBody>{lowMargin.map((u) => (
                <TableRow key={u.name}><TableCell className="font-medium">{u.name}</TableCell><TableCell className="text-right font-mono">{money(u.revenue, 2)}</TableCell><TableCell className="text-right font-mono">{money(u.cost, 2)}</TableCell><TableCell className={cn("text-right font-mono", u.margin < 0 ? "text-loss" : "text-profit")}>{money(u.margin, 2)}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </div>
        </section>
        <section>
          <h2 className="mb-2 text-sm font-semibold">Recent credit top-ups</h2>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>{data.recentTopUps.map((t) => (
                <TableRow key={t.user + t.date}><TableCell className="font-medium">{t.user}</TableCell><TableCell className="text-muted-foreground">{t.date}</TableCell><TableCell className="text-right font-mono">{money(t.amount, 2)}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </div>
        </section>
      </div>

      <ConfirmAction
        open={confirmPause} title="Pause new test runs?" destructive confirmLabel="Pause test runs"
        body="Buyers will not be able to start marketplace test runs until you turn this off. Use it when spend is out of control."
        onConfirm={async () => { await api.setTrialRunsPaused(true); load(); }}
        onClose={() => setConfirmPause(false)}
      />
    </Page>
  );
}
