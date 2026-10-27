import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tableSkeleton, useLoad } from "@/components/market/adminShared";
import { EmptyState, ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/payouts")({
  head: () => meta("Payouts · Tickforge Admin", "Approve or hold builder payouts."),
  component: Payouts,
});

const tone: Record<string, string> = { Pending: "border-warning/40 text-warning", Approved: "border-profit/40 text-profit", "On hold": "text-muted-foreground" };

function Payouts() {
  const { data, error, load } = useLoad(() => api.getPayouts());
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const sum = (s: string) => (data ?? []).filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0);

  const set = async (id: string, status: "Approved" | "On hold") => {
    setBusy(id + status); setActionError(null);
    try { await api.setPayoutStatus(id, status); load(); } catch (e) { setActionError((e as Error).message); }
    setBusy(null);
  };

  return (
    <Page title="Payouts" subtitle="Builders are paid 100% of each sale minus payment processing fees. Approve only verified builders.">
      {data && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {[["Pending", sum("Pending")], ["Approved", sum("Approved")], ["On hold", sum("On hold")]].map(([label, v]) => (
            <div key={label as string} className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 font-mono text-xl font-semibold">{money(v as number, 2)}</div></div>
          ))}
        </div>
      )}
      {actionError && <p className="mb-3 text-sm text-loss">{actionError}</p>}
      {error ? <ErrorState message={error} onRetry={load} /> : !data ? tableSkeleton : data.length === 0 ? <EmptyState title="No payouts waiting" /> : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Builder</TableHead><TableHead>Period</TableHead><TableHead>Method</TableHead><TableHead>Identity</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.builder}</TableCell>
                  <TableCell className="text-muted-foreground">{p.period}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell>{p.verified ? <span className="text-xs text-profit">Verified</span> : <span className="flex items-center gap-1 text-xs text-warning"><AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Not verified</span>}</TableCell>
                  <TableCell className="text-right font-mono">{money(p.amount, 2)}</TableCell>
                  <TableCell><Badge variant="outline" className={cn(tone[p.status])}>{p.status}</Badge></TableCell>
                  <TableCell className="space-x-1 whitespace-nowrap text-right">
                    <Button size="sm" disabled={!p.verified || p.status === "Approved" || busy === p.id + "Approved"} title={p.verified ? undefined : "Identity must be verified before approving"} onClick={() => set(p.id, "Approved")}>Approve</Button>
                    <Button size="sm" variant="outline" disabled={p.status === "On hold" || busy === p.id + "On hold"} onClick={() => set(p.id, "On hold")}>Hold</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Page>
  );
}
