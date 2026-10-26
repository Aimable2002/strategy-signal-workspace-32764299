import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { FILES_KEPT_DAYS } from "@/mockData";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/pricing")({
  head: () => meta("Pricing · Pay only for what you use · Tickforge", "No subscriptions and no commission on sales. Prepaid credits for workspace time, storage, backtests and AI usage."),
  component: Pricing,
});

function Pricing() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getRateCard>> | null>(null);
  const [error, setError] = useState(false);
  const [hours, setHours] = useState(10);
  const [tests, setTests] = useState(20);
  const [custom, setCustom] = useState("");
  useEffect(() => { api.getRateCard().then(setData).catch(() => setError(true)); }, []);
  const estimate = api.estimateCost(hours, tests);

  return (
    <Page title="Pay only for what you use" subtitle="No subscriptions. No commission on your sales.">
      {error ? <ErrorState message="Couldn't load prices." /> : !data ? <Skeleton className="h-64" /> : (
        <div className="space-y-10">
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border">
              <Table>
                <TableHeader><TableRow><TableHead>Resource</TableHead><TableHead>Unit</TableHead><TableHead className="text-right">Rate</TableHead></TableRow></TableHeader>
                <TableBody>{data.rates.map((r) => <TableRow key={r.id}><TableCell>{r.label}</TableCell><TableCell className="text-muted-foreground">{r.unit}</TableCell><TableCell className="text-right font-mono">{money(r.rate, 2)}</TableCell></TableRow>)}</TableBody>
              </Table>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <h2 className="font-semibold">Cost estimator</h2>
              <div className="mt-5 space-y-5">
                <div><div className="mb-2 flex justify-between text-sm"><span>Workspace hours per week</span><span className="font-mono">{hours} h</span></div><Slider min={0} max={60} value={[hours]} onValueChange={([v]) => setHours(v!)} /></div>
                <div><div className="mb-2 flex justify-between text-sm"><span>Backtests per week</span><span className="font-mono">{tests}</span></div><Slider min={0} max={200} step={5} value={[tests]} onValueChange={([v]) => setTests(v!)} /></div>
              </div>
              <div className="mt-6 rounded-md bg-muted p-4"><div className="text-xs text-muted-foreground">Estimated monthly cost</div><div className="font-mono text-3xl font-semibold">{money(estimate, 2)}</div><div className="mt-1 text-[11px] text-muted-foreground">Includes ~100 AI messages/week and 3 GB storage. Estimate only.</div></div>
            </div>
          </section>
          <section>
            <h2 className="mb-3 font-semibold">Credit packs</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {data.packs.map((p) => <div key={p} className="rounded-lg border bg-card p-5 text-center"><div className="font-mono text-2xl font-semibold">${p}</div><div className="mt-1 text-xs text-muted-foreground">≈ {Math.round(p / api.hourlyRate())} workspace hours</div><Button className="mt-4 w-full" variant="outline" asChild><Link to="/billing">Buy</Link></Button></div>)}
              <div className="rounded-lg border border-dashed p-5 text-center"><div className="text-sm font-medium">Custom amount</div><Input className="mt-3 text-center" type="number" min={5} placeholder="$" value={custom} onChange={(e) => setCustom(e.target.value)} /><Button className="mt-3 w-full" variant="outline" disabled={Number(custom) < 5} asChild><Link to="/billing">Buy</Link></Button></div>
            </div>
          </section>
          <p className="rounded-md border border-profit/30 bg-profit/5 p-4 text-sm">Builders keep 100% of their sale price, minus payment processing fees. We never take a commission.</p>
          <section className="max-w-3xl">
            <h2 className="mb-2 font-semibold">FAQ</h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="a"><AccordionTrigger>What happens when credits run out?</AccordionTrigger><AccordionContent className="text-muted-foreground">Your workspace stops automatically. Your files are kept for {FILES_KEPT_DAYS} days so you can add credits and pick up where you left off.</AccordionContent></AccordionItem>
              <AccordionItem value="b"><AccordionTrigger>Do credits expire?</AccordionTrigger><AccordionContent className="text-muted-foreground">Purchased credits don't expire while your account is active. Free signup credit expires after 90 days.</AccordionContent></AccordionItem>
              <AccordionItem value="c"><AccordionTrigger>Can I get a refund for unused credits?</AccordionTrigger><AccordionContent className="text-muted-foreground">Yes, within 90 days of purchase, minus payment processing fees. See the <Link to="/legal/$doc" params={{ doc: "refund" }} className="text-primary">Refund Policy</Link>.</AccordionContent></AccordionItem>
            </Accordion>
          </section>
        </div>
      )}
    </Page>
  );
}
