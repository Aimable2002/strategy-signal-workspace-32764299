import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmAction, FilterChips, tableSkeleton, useLoad } from "@/components/market/adminShared";
import { EmptyState, ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import type { DisputeStatus } from "@/mockData";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/disputes")({
  head: () => meta("Disputes and refunds · Tickforge Admin", "Decide refund requests between buyers and builders."),
  component: Disputes,
});

const FILTERS = ["All", "Open", "Responded", "Resolved", "Refunded"] as const;
const tone: Record<DisputeStatus, string> = { Open: "border-warning/40 text-warning", Responded: "border-primary/40 text-primary", Resolved: "border-profit/40 text-profit", Refunded: "text-muted-foreground" };
type Dispute = Awaited<ReturnType<typeof api.getDisputes>>[number];

function Disputes() {
  const { data, error, load } = useLoad(() => api.getDisputes());
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [act, setAct] = useState<{ d: Dispute; kind: "refund" | "deny" } | null>(null);
  const rows = data?.filter((d) => filter === "All" || d.status === filter);
  const refund = act?.kind === "refund";

  return (
    <Page title="Disputes and refunds" subtitle="Approve a refund or deny the request. Both decisions are final.">
      <div className="mb-4"><FilterChips value={filter} options={FILTERS} onChange={setFilter} /></div>
      {error ? <ErrorState message={error} onRetry={load} /> : !rows ? tableSkeleton : rows.length === 0 ? <EmptyState title="No disputes in this view" /> : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Dispute</TableHead><TableHead>Buyer</TableHead><TableHead>Builder</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Reason and messages</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((d) => {
                const decided = d.status === "Resolved" || d.status === "Refunded";
                return (
                  <TableRow key={d.id}>
                    <TableCell><div className="font-medium">{d.listing}</div><div className="text-xs text-muted-foreground">{d.orderId} · {d.date}</div></TableCell>
                    <TableCell>{d.buyer}</TableCell>
                    <TableCell>{d.builder}</TableCell>
                    <TableCell className="text-right font-mono">{money(d.amount, 2)}</TableCell>
                    <TableCell className="max-w-sm space-y-1 text-sm">
                      <div className="font-medium">{d.reason}</div>
                      <p className="text-muted-foreground">Buyer: “{d.message}”</p>
                      {d.response ? <p className="text-muted-foreground">Builder: “{d.response}”</p> : <p className="text-xs text-muted-foreground">No builder response yet.</p>}
                    </TableCell>
                    <TableCell><Badge variant="outline" className={cn(tone[d.status])}>{d.status}</Badge></TableCell>
                    <TableCell className="space-x-1 whitespace-nowrap text-right">
                      <Button size="sm" disabled={decided} onClick={() => setAct({ d, kind: "refund" })}>Approve refund</Button>
                      <Button size="sm" variant="outline" disabled={decided} onClick={() => setAct({ d, kind: "deny" })}>Deny</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <ConfirmAction
        open={!!act}
        title={refund ? `Refund ${act ? money(act.d.amount, 2) : ""} to ${act?.d.buyer}?` : `Deny the request from ${act?.d.buyer}?`}
        body={refund ? "The buyer is refunded and the builder's earnings for this order are reversed." : "The dispute is closed and no refund is issued. The buyer is notified."}
        confirmLabel={refund ? "Approve refund" : "Deny request"} destructive={!refund}
        onConfirm={async () => { await api.setDisputeStatus(act!.d.id, refund ? "Refunded" : "Resolved"); load(); }}
        onClose={() => setAct(null)}
      />
    </Page>
  );
}
