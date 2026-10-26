import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/checkout/$id")({
  head: () => meta("Checkout · Tickforge Marketplace", "Complete your strategy purchase."),
  component: Checkout,
});

function Checkout() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [l, setL] = useState<Awaited<ReturnType<typeof api.getListing>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [option, setOption] = useState("ex5");
  const [agree, setAgree] = useState(false);
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvc: "" });
  const [paying, setPaying] = useState(false);
  useEffect(() => { api.getListing(id).then(setL).catch((e) => setError(e.message)); }, [id]);

  if (error) return <Page title="Checkout"><ErrorState message={error} /></Page>;
  if (!l) return <main className="mx-auto max-w-4xl space-y-4 px-6 py-6"><Skeleton className="h-64" /></main>;

  const includeSource = option === "source";
  const total = api.orderTotal(l, includeSource);
  const cardOk = card.name && card.number.replace(/\s/g, "").length >= 12 && card.exp && card.cvc.length >= 3;
  const pay = async () => {
    setPaying(true);
    try {
      const o = await api.createOrder(l.id, { includeSource });
      navigate({ to: "/checkout/success", search: { listing: l.id, order: o.id } });
    } catch (e) { setError((e as Error).message); setPaying(false); }
  };

  return (
    <Page title="Checkout" subtitle={<>Buying <Link to="/marketplace/$id" params={{ id: l.id }} className="text-foreground underline">{l.title}</Link> by {l.builder.name}</>}>
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="space-y-4 lg:col-span-3">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 font-semibold">What's included</h2>
            <RadioGroup value={option} onValueChange={setOption} className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-primary">
                <RadioGroupItem value="ex5" className="mt-0.5" />
                <div className="flex-1"><div className="text-sm font-medium">.ex5 compiled file</div><div className="text-xs text-muted-foreground">Ready to run in MetaTrader 5. Includes version updates.</div></div>
                <span className="font-mono text-sm">{money(l.price)}</span>
              </label>
              {l.sourcePrice != null && (
                <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-primary">
                  <RadioGroupItem value="source" className="mt-0.5" />
                  <div className="flex-1"><div className="text-sm font-medium">.ex5 compiled file + .mq5 source code</div><div className="text-xs text-muted-foreground">Full source so you can read and modify the logic.</div></div>
                  <span className="font-mono text-sm">{money(l.sourcePrice)}</span>
                </label>
              )}
            </RadioGroup>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-1 font-semibold">Payment</h2>
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Demo checkout. No card is charged.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2"><Label className="text-xs">Name on card</Label><Input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></div>
              <div className="space-y-1 sm:col-span-2"><Label className="text-xs">Card number</Label><Input inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Expiry</Label><Input placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">CVC</Label><Input inputMode="numeric" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} /></div>
            </div>
          </div>
        </section>
        <aside className="h-fit space-y-4 rounded-lg border bg-panel p-4 lg:col-span-2">
          <h2 className="font-semibold">Order summary</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span>{l.title}</span><span className="font-mono">{money(total)}</span></div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3 w-3 text-profit" /> .ex5 compiled file</div>
            {includeSource && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3 w-3 text-profit" /> .mq5 source code</div>}
            <div className="flex justify-between border-t pt-2 font-semibold"><span>Total</span><span className="font-mono">{money(total)}</span></div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Refund policy.</strong> You can request a full refund within 14 days if you haven't downloaded the files. After download, refunds are reviewed case by case.</p>
          <label className="flex items-start gap-2 text-xs">
            <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
            <span>I agree to the terms of sale and understand the risk disclosure: backtests do not guarantee future results and I trade at my own risk.</span>
          </label>
          <Button className="w-full" disabled={!agree || !cardOk || paying} onClick={pay}>{paying && <Loader2 className="h-4 w-4 animate-spin" />} Pay {money(total)}</Button>
        </aside>
      </div>
    </Page>
  );
}
