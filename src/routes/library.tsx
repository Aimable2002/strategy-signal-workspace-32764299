import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState, Page, Sparkline, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({
  head: () => meta("My library · Tickforge", "Strategies you've purchased and tested."),
  component: Library,
});

function Library() {
  const [purchases, setPurchases] = useState<Awaited<ReturnType<typeof api.getPurchases>> | null>(null);
  const [trials, setTrials] = useState<Awaited<ReturnType<typeof api.getTrials>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = () => {
    setError(null); setPurchases(null); setTrials(null);
    Promise.all([api.getPurchases(), api.getTrials()]).then(([p, t]) => { setPurchases(p); setTrials(t); }).catch((e) => setError(e.message));
  };
  useEffect(load, []);
  const browse = <Button size="sm" asChild><Link to="/marketplace">Browse marketplace</Link></Button>;

  return (
    <Page title="My Library" actions={<Button size="sm" variant="outline" asChild><Link to="/refund">Request a refund</Link></Button>}>
      {error ? <ErrorState message={error} onRetry={load} /> : (
        <Tabs defaultValue="purchased">
          <TabsList><TabsTrigger value="purchased">Purchased</TabsTrigger><TabsTrigger value="tested">Tested</TabsTrigger></TabsList>
          <TabsContent value="purchased" className="mt-4 space-y-3">
            {!purchases ? <Skeleton className="h-24" /> : purchases.length === 0 ? <EmptyState title="No purchases yet" body="Strategies you buy appear here with their files." action={browse} /> : purchases.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <Link to="/marketplace/$id" params={{ id: p.listingId }} className="font-semibold hover:underline">{p.listing.title}</Link>
                  <p className="text-xs text-muted-foreground">Purchased {p.date} · version {p.version}</p>
                  {p.updateAvailable && <Badge variant="outline" className="mt-1.5 border-primary/40 text-primary">Update available: {p.listing.versions[0]!.version} · {p.listing.versions[0]!.notes}</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => api.downloadPurchase(p.listingId, "ex5")}><Download className="h-3.5 w-3.5" /> .ex5</Button>
                  {p.includesSource && <Button size="sm" variant="outline" onClick={() => api.downloadPurchase(p.listingId, "mq5")}><Download className="h-3.5 w-3.5" /> .mq5</Button>}
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="tested" className="mt-4 space-y-3">
            <p className="text-xs text-muted-foreground">You get {api.TRIAL_LIMIT} free test runs per day. After that, each test costs about ${api.getTrialRunCost().cost.toFixed(2)} and is deducted from your credits.</p>
            {!trials ? <Skeleton className="h-24" /> : trials.length === 0 ? <EmptyState title="No test runs yet" body="Open a strategy and use “Test this strategy” to see how it performs on your settings." action={browse} /> : trials.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
                <div className="w-32"><Sparkline data={t.equity} positive={t.metrics.netProfit >= 0} /></div>
                <div className="min-w-0 flex-1">
                  <Link to="/marketplace/$id" params={{ id: t.listingId }} className="font-semibold hover:underline">{t.listing.title}</Link>
                  <p className="font-mono text-xs text-muted-foreground">{t.settings.symbol} · {t.settings.timeframe} · {t.settings.from} to {t.settings.to} · tested {t.date}</p>
                  <p className="mt-1 font-mono text-xs">
                    <span className={cn(t.metrics.netProfit >= 0 ? "text-profit" : "text-loss")}>{money(t.metrics.netProfit)}</span> · DD {t.metrics.drawdown}% · Win {t.metrics.winRate}% · PF {t.metrics.profitFactor}
                  </p>
                </div>
                {t.purchased ? <Badge variant="secondary">Purchased</Badge> : <Button size="sm" asChild><Link to="/checkout/$id" params={{ id: t.listingId }}>Buy</Link></Button>}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </Page>
  );
}
