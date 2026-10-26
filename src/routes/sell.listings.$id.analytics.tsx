import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, Page } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/sell/listings/$id/analytics")({
  head: () => meta("Listing analytics · Tickforge", "Views, test runs, sales and conversion for a listing."),
  component: Analytics,
});

function Analytics() {
  const { id } = Route.useParams();
  const [a, setA] = useState<Awaited<ReturnType<typeof api.getListingAnalytics>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getListingAnalytics(id).then(setA).catch((e) => setError(e.message)); }, [id]);
  if (error) return <Page title="Listing analytics"><ErrorState message={error} /></Page>;
  if (!a) return <Page title="Listing analytics"><Skeleton className="h-96" /></Page>;
  const funnel = [["Views", a.views], ["Test runs started", a.started], ["Test runs completed", a.completed], ["Sales", a.sales]] as const;
  return (
    <Page title={a.title} subtitle="Last 30 days">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {funnel.map(([l, v]) => <div key={l} className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="mt-1 font-mono text-xl font-semibold">{v.toLocaleString()}</div></div>)}
      </div>
      <section className="mt-6 rounded-lg border bg-card p-5">
        <h2 className="mb-4 font-semibold">Conversion funnel</h2>
        <div className="space-y-2">
          {funnel.map(([l, v], i) => {
            const pct = (v / a.views) * 100;
            const prev = i ? funnel[i - 1]![1] : v;
            return (
              <div key={l} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 text-muted-foreground">{l}</span>
                <div className="h-6 flex-1 rounded bg-muted"><div className="h-6 rounded bg-primary/70" style={{ width: `${Math.max(pct, 1)}%` }} /></div>
                <span className="w-24 text-right font-mono text-xs">{i ? `${((v / prev) * 100).toFixed(1)}% of prev` : "100%"}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="mt-6 rounded-lg border bg-card p-5">
        <h2 className="mb-3 font-semibold">Daily activity</h2>
        <div className="h-72"><ResponsiveContainer>
          <LineChart data={a.daily}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} width={32} />
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line dataKey="views" name="Views" stroke="var(--color-chart-5)" dot={false} strokeWidth={2} />
            <Line dataKey="tests" name="Test runs" stroke="var(--color-primary)" dot={false} strokeWidth={2} />
            <Line dataKey="sales" name="Sales" stroke="var(--color-profit)" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer></div>
      </section>
    </Page>
  );
}
