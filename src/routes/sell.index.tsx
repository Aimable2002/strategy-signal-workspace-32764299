import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import type { ListingStatus } from "@/mockData";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sell/")({
  head: () => meta("Builder dashboard · Tickforge", "Revenue, listings, test runs and payouts for your strategies."),
  component: Dashboard,
});

export const statusClass: Record<ListingStatus, string> = {
  Live: "border-profit/40 text-profit",
  "In review": "border-warning/40 text-warning",
  Paused: "border-border text-muted-foreground",
  Draft: "border-border text-muted-foreground",
};

function Dashboard() {
  const [d, setD] = useState<Awaited<ReturnType<typeof api.getBuilderDashboard>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = () => { setError(null); setD(null); api.getBuilderDashboard().then(setD).catch((e) => setError(e.message)); };
  useEffect(load, []);

  return (
    <Page title="Builder dashboard" actions={<Button asChild><Link to="/sell/publish"><Plus className="h-4 w-4" /> Publish a strategy</Link></Button>}>
      {error ? <ErrorState message={error} onRetry={load} /> : !d ? <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-72" /></div> : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["Total revenue", money(d.revenue)], ["Units sold", String(d.unitsSold)], ["Trial runs this month", String(d.trialRunsThisMonth)], ["Trial-to-sale conversion", `${d.conversion}%`]].map(([l, v]) => (
              <div key={l} className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="mt-1 font-mono text-xl font-semibold">{v}</div></div>
            ))}
          </div>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 font-semibold">Revenue</h2>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={d.revenueSeries}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} width={52} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", fontSize: 12 }} formatter={(v: number) => money(v)} />
                  <Line dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section>
            <h2 className="mb-3 font-semibold">My listings</h2>
            {d.listings.filter((l) => l.connectionLost).map((l) => (
              <div key={l.id} className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-warning/40 bg-warning/5 px-3 py-2 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" /> <strong>{l.title}:</strong> Demo account connection lost. Reconnect to keep test runs working.
                <Button size="sm" variant="outline" className="ml-auto h-7" asChild><Link to="/sell/publish">Reconnect</Link></Button>
              </div>
            ))}
            <div className="rounded-lg border">
              <Table>
                <TableHeader><TableRow><TableHead>Strategy</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Sales</TableHead></TableRow></TableHeader>
                <TableBody>
                  {d.listings.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.title}</TableCell>
                      <TableCell><Badge variant="outline" className={cn(statusClass[l.status])}>{l.status}</Badge></TableCell>
                      <TableCell className="text-right font-mono">{l.price ? money(l.price) : "—"}</TableCell>
                      <TableCell className="text-right font-mono">{l.sales}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-semibold">Payouts</h2><p className="text-xs text-muted-foreground">Available balance</p><div className="font-mono text-2xl font-semibold">{money(d.payouts.balance, 2)}</div></div>
              <Button variant="outline">Connect payout account</Button>
            </div>
            <Table className="mt-4">
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {d.payouts.history.map((p) => <TableRow key={p.id}><TableCell className="font-mono">{p.date}</TableCell><TableCell>{p.status}</TableCell><TableCell className="text-right font-mono">{money(p.amount, 2)}</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </section>
        </div>
      )}
    </Page>
  );
}
