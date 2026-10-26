import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import type { DisputeStatus } from "@/mockData";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sell/disputes")({
  head: () => meta("Disputes · Tickforge", "Respond to buyer refund requests."),
  component: Disputes,
});

export const disputeTone: Record<DisputeStatus, string> = { Open: "border-warning/40 text-warning", Responded: "border-primary/40 text-primary", Resolved: "border-profit/40 text-profit", Refunded: "text-muted-foreground" };

function DisputeCard({ d, onUpdate }: { d: Awaited<ReturnType<typeof api.getDisputes>>[number]; onUpdate: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = async () => { setBusy(true); setError(null); try { await api.respondToDispute(d.id, text); onUpdate(); } catch (e) { setError((e as Error).message); } setBusy(false); };
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{d.listing}</span><Badge variant="outline" className={cn(disputeTone[d.status])}>{d.status}</Badge><span className="ml-auto font-mono text-sm">{money(d.amount)}</span></div>
      <p className="mt-1 text-xs text-muted-foreground">{d.orderId} · {d.buyer} · {d.date} · {d.reason}</p>
      <p className="mt-2 rounded bg-muted p-2 text-sm">"{d.message}"</p>
      {d.response ? <p className="mt-2 text-sm"><span className="text-xs text-muted-foreground">Your response: </span>{d.response}</p> : d.status === "Open" && (
        <div className="mt-3 space-y-2"><Textarea rows={3} placeholder="Explain or offer a fix…" value={text} onChange={(e) => setText(e.target.value)} />{error && <p className="text-sm text-loss">{error}</p>}<Button size="sm" onClick={send} disabled={busy || !text.trim()}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Send response</Button></div>
      )}
    </div>
  );
}

function Disputes() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof api.getDisputes>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = () => api.getDisputes().then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  return (
    <Page title="Disputes and refund requests">
      {error ? <ErrorState message={error} /> : !items ? <Skeleton className="h-40" /> : items.length === 0 ? <EmptyState title="No disputes" body="Refund requests from buyers will appear here." /> : <div className="space-y-3">{items.map((d) => <DisputeCard key={d.id} d={d} onUpdate={load} />)}</div>}
    </Page>
  );
}
