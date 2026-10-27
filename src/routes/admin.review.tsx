import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState, EquityChart, ErrorState, MetricGrid, Page, PlatformRecorded, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/admin/review")({
  head: () => meta("Review queue · Tickforge Admin", "Approve or reject strategies submitted to the marketplace."),
  component: ReviewQueue,
});

type Item = Awaited<ReturnType<typeof api.getReviewQueue>>[number];

function ReviewQueue() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Item | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = () => { setError(null); setItems(null); api.getReviewQueue().then(setItems).catch((e) => setError(e.message)); };
  useEffect(load, []);

  const decide = async (approve: boolean) => {
    if (!open) return;
    setBusy(true); setActionError(null);
    try {
      await api.reviewListing(open.id, { approve, reason });
      setItems((xs) => xs?.filter((x) => x.id !== open.id) ?? null);
      setOpen(null); setReason("");
    } catch (e) { setActionError((e as Error).message); }
    setBusy(false);
  };

  return (
    <Page title="Review queue" subtitle="Listings waiting for approval">
      {error ? <ErrorState message={error} onRetry={load} /> : !items ? <Skeleton className="h-40" /> : items.length === 0 ? <EmptyState title="Queue is empty" body="New submissions will appear here." /> : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Strategy</TableHead><TableHead>Builder</TableHead><TableHead>Market</TableHead><TableHead>Submitted</TableHead><TableHead className="text-right">Price</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {items.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.title}</TableCell>
                  <TableCell>{q.builder.name}</TableCell>
                  <TableCell className="font-mono text-xs">{q.symbol} · {q.timeframe}</TableCell>
                  <TableCell className="font-mono text-xs">{q.submittedAt}</TableCell>
                  <TableCell className="text-right font-mono">{money(q.price)}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => { setOpen(q); setReason(""); setActionError(null); }}>Open</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {open && (
            <>
              <DialogHeader><DialogTitle>{open.title}</DialogTitle></DialogHeader>
              <div className="flex flex-wrap gap-1.5 text-xs"><Badge variant="secondary">{open.symbol}</Badge><Badge variant="secondary">{open.timeframe}</Badge><Badge variant="outline">{open.style}</Badge><span className="text-muted-foreground">by {open.builder.name} · {money(open.price)}</span></div>
              <p className="text-sm text-muted-foreground">{open.description}</p>
              <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Recorded results (read-only)</h3><PlatformRecorded /></div>
              <EquityChart height={220} series={[{ name: "Recorded result", data: open.equity, color: "var(--color-primary)" }]} />
              <MetricGrid metrics={open.metrics} />
              <div className="space-y-1"><Label className="text-xs">Reason (required to reject)</Label><Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
              {actionError && <p className="text-sm text-loss">{actionError}</p>}
              <DialogFooter>
                <Button variant="outline" className="border-loss/40 text-loss" disabled={busy} onClick={() => decide(false)}>Reject</Button>
                <Button disabled={busy} onClick={() => decide(true)}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Approve</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Page>
  );
}
