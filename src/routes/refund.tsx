import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/refund")({
  head: () => meta("Request a refund · Tickforge", "Ask for a refund on a strategy purchase."),
  component: Refund,
});

const REASONS = ["Doesn't match listed results", "Files don't work", "Bought by mistake", "Other"];

function Refund() {
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof api.getOrders>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({ orderId: "", reason: "", details: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  useEffect(() => { api.getOrders().then(setOrders).catch((e) => setError(e.message)); }, []);
  const submit = async () => {
    setBusy(true); setFormError(null);
    try { await api.createRefundRequest(f); setDone(true); } catch (e) { setFormError((e as Error).message); }
    setBusy(false);
  };
  if (done) return <Page title="Refund requested"><div className="max-w-lg space-y-3 rounded-lg border bg-card p-5"><p className="flex items-center gap-2 text-profit"><CheckCircle2 className="h-5 w-5" /> Your request is open.</p><p className="text-sm text-muted-foreground">The builder has 3 days to respond. If you can't agree, our team reviews it. We'll notify you of any update.</p><Button variant="outline" asChild><Link to="/library">Back to library</Link></Button></div></Page>;
  return (
    <Page title="Request a refund" subtitle={<>See the <Link to="/legal/$doc" params={{ doc: "refund" }} className="text-primary">Refund Policy</Link>.</>}>
      {error ? <ErrorState message={error} /> : !orders ? <Skeleton className="h-64 max-w-lg" /> : orders.length === 0 ? <EmptyState title="No purchases to refund" /> : (
        <div className="max-w-lg space-y-4 rounded-lg border bg-card p-5">
          <div className="space-y-1"><Label className="text-xs">Purchase</Label><Select value={f.orderId} onValueChange={(orderId) => setF({ ...f, orderId })}><SelectTrigger><SelectValue placeholder="Choose a purchase" /></SelectTrigger><SelectContent>{orders.map((o) => <SelectItem key={o.id} value={o.id}>{o.item} · {money(o.amount)} · {o.date}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-xs">Reason</Label><Select value={f.reason} onValueChange={(reason) => setF({ ...f, reason })}><SelectTrigger><SelectValue placeholder="Choose a reason" /></SelectTrigger><SelectContent>{REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-xs">Details</Label><Textarea rows={4} value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} /></div>
          {formError && <p className="text-sm text-loss">{formError}</p>}
          <Button onClick={submit} disabled={busy || !f.orderId || !f.reason}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit request</Button>
        </div>
      )}
    </Page>
  );
}
