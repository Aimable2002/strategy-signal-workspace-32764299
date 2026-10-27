import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmAction, FilterChips, tableSkeleton, useLoad } from "@/components/market/adminShared";
import { EmptyState, ErrorState, Page } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/reports")({
  head: () => meta("Reports · Tickforge Admin", "Review listings reported by buyers."),
  component: Reports,
});

const FILTERS = ["All", "Open", "Resolved", "Listing removed"] as const;
const tone: Record<string, string> = { Open: "border-warning/40 text-warning", Resolved: "border-profit/40 text-profit", "Listing removed": "border-loss/40 text-loss" };
type Report = Awaited<ReturnType<typeof api.getReports>>[number];

function Reports() {
  const { data, error, load } = useLoad(() => api.getReports());
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [remove, setRemove] = useState<Report | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const rows = data?.filter((r) => filter === "All" || r.status === filter);

  const resolve = async (r: Report) => {
    setBusyId(r.id); setActionError(null);
    try { await api.resolveReport(r.id, "resolve"); load(); } catch (e) { setActionError((e as Error).message); }
    setBusyId(null);
  };

  return (
    <Page title="Reports" subtitle="Listings reported by buyers. Resolve a report or remove the listing.">
      <div className="mb-4"><FilterChips value={filter} options={FILTERS} onChange={setFilter} /></div>
      {actionError && <p className="mb-3 text-sm text-loss">{actionError}</p>}
      {error ? <ErrorState message={error} onRetry={load} /> : !rows ? tableSkeleton : rows.length === 0 ? <EmptyState title="No reports in this view" body="Reports from buyers show up here." /> : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Listing</TableHead><TableHead>Reason</TableHead><TableHead>Details</TableHead><TableHead>Reporter</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium"><Link to="/marketplace/$id" params={{ id: r.listingId }} className="hover:text-primary hover:underline">{r.listing}</Link></TableCell>
                  <TableCell>{r.reason}</TableCell>
                  <TableCell className="max-w-xs text-muted-foreground">{r.details}</TableCell>
                  <TableCell>{r.reporter}</TableCell>
                  <TableCell className="text-muted-foreground">{r.date}</TableCell>
                  <TableCell><Badge variant="outline" className={cn(tone[r.status])}>{r.status}</Badge></TableCell>
                  <TableCell className="space-x-1 whitespace-nowrap text-right">
                    <Button size="sm" variant="outline" disabled={r.status !== "Open" || busyId === r.id} onClick={() => resolve(r)}>{busyId === r.id ? "Saving…" : "Resolve"}</Button>
                    <Button size="sm" variant="outline" className="text-loss" disabled={r.status !== "Open"} onClick={() => setRemove(r)}>Remove listing</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <ConfirmAction
        open={!!remove} title={`Remove “${remove?.listing}”?`} destructive confirmLabel="Remove listing"
        body="The listing leaves the marketplace and the builder is notified. Buyers who already purchased keep their files."
        onConfirm={async () => { await api.resolveReport(remove!.id, "remove"); load(); }}
        onClose={() => setRemove(null)}
      />
    </Page>
  );
}
