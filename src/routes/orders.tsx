import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/orders")({
  head: () => meta("Order history · Tickforge", "Your strategy purchases and receipts."),
  component: Orders,
});

type Order = Awaited<ReturnType<typeof api.getOrders>>[number];
const receiptText = (o: Order) => `Tickforge receipt\nOrder: ${o.id}\nDate: ${o.date}\nItem: ${o.item}\nPaid with: ${o.method}\nTotal: ${money(o.amount, 2)}`;

function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Order | null>(null);
  const load = () => { setError(null); setOrders(null); api.getOrders().then(setOrders).catch((e) => setError(e.message)); };
  useEffect(load, []);
  return (
    <Page title="Orders">
      {error ? <ErrorState message={error} onRetry={load} /> : !orders ? <Skeleton className="h-40" /> : orders.length === 0 ? <EmptyState title="No orders yet" action={<Button size="sm" asChild><Link to="/marketplace">Browse marketplace</Link></Button>} /> : (
        <div className="rounded-lg border"><Table>
          <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Date</TableHead><TableHead>Item</TableHead><TableHead className="text-right">Total</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{orders.map((o) => <TableRow key={o.id}><TableCell className="font-mono text-xs">{o.id}</TableCell><TableCell className="font-mono text-xs">{o.date}</TableCell><TableCell>{o.item}</TableCell><TableCell className="text-right font-mono">{money(o.amount, 2)}</TableCell><TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setOpen(o)}>Receipt</Button></TableCell></TableRow>)}</TableBody>
        </Table></div>
      )}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          {open && (<>
            <DialogHeader><DialogTitle>Receipt {open.id}</DialogTitle></DialogHeader>
            <dl className="space-y-2 text-sm">
              {[["Date", open.date], ["Item", open.item], ["Paid with", open.method]].map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>)}
              <div className="flex justify-between border-t pt-2 font-semibold"><dt>Total</dt><dd className="font-mono">{money(open.amount, 2)}</dd></div>
            </dl>
            <DialogFooter><Button onClick={() => api.downloadText(`receipt-${open.id}.txt`, receiptText(open))}><Download className="h-4 w-4" /> Download receipt</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>
    </Page>
  );
}
