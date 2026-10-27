import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bot, FileCode2, FlaskConical, Lock, MessageSquareText, Server, Upload } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton, ErrorState, MetricGrid, ListingCard, type ListingWithBuilder } from "@/components/market/shared";
import * as api from "@/services/api";
import { listings } from "@/mockData";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/welcome")({
  head: () => meta("Tickforge · Build and backtest trading strategies with an AI agent", "Describe a trading idea; an AI agent writes, compiles and backtests it in MetaTrader 5. Sell it or download it. Pay only for what you use."),
  component: Landing,
});

const steps = [
  { icon: MessageSquareText, title: "Describe your idea", body: "Tell the agent your entry, exit and risk rules in plain words." },
  { icon: Bot, title: "The agent builds and backtests it", body: "It writes the .mq5 code, compiles it and runs the MT5 Strategy Tester." },
  { icon: Upload, title: "Publish or download", body: "Download your files, or list the strategy on the marketplace." },
];
const features = [
  { icon: Lock, title: "Private workspace", body: "Your own cloud machine. Only you see your code." },
  { icon: Server, title: "MT5 Strategy Tester", body: "Real MetaTrader 5 backtests on years of history." },
  { icon: FileCode2, title: ".mq5 and .ex5 files", body: "Source and compiled files, ready for your terminal." },
  { icon: FlaskConical, title: "Test before you buy", body: "Run a marketplace strategy on your settings first." },
];
const faq = [
  ["Does the platform trade with my money?", "No. The platform never places real trades and you never connect a real-money account. Backtests are historical simulations."],
  ["Is there a subscription?", "No. You pay only for infrastructure you use from a prepaid credit balance."],
  ["Do you take a commission on sales?", "No. Builders keep 100% of the sale price, minus payment processing fees."],
  ["Do I need to know MQL5?", "No. Describe the idea and the agent writes the code. You can still read and edit it."],
];

function Landing() {
  const [featured, setFeatured] = useState<ListingWithBuilder[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { api.getListings({ sort: "rating" }).then((d) => setFeatured(d.slice(0, 3))).catch(() => setError(true)); }, []);
  return (
    <main className="flex-1">
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">MetaTrader 5 · AI agent</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Build and backtest trading strategies with an AI agent</h1>
          <p className="mt-4 max-w-lg text-muted-foreground">From idea to compiled Expert Advisor and a Strategy Tester summary in minutes. Keep it, or sell it on the marketplace.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/signup">Start with $5 free credit</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/marketplace">Browse strategies</Link></Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No real trades. Backtests are historical simulations.</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-2xl">
          <div className="mb-2 flex justify-between font-mono text-xs text-muted-foreground"><span>EMA_Cross.ex5 · EURUSD H1</span><span className="text-profit">+$3,412</span></div>
          <MetricGrid metrics={listings[11]!.metrics} />
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">EURUSD · H1 · 2023-01-01 to 2024-12-31 · Deposit $10,000</p>
        </div>
      </section>

      <section className="border-y bg-panel">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-lg border bg-card p-5">
                <div className="flex items-center gap-3"><span className="font-mono text-sm text-primary">0{i + 1}</span><s.icon className="h-5 w-5 text-primary" /></div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-lg border p-5"><f.icon className="h-5 w-5 text-primary" /><h3 className="mt-3 font-semibold">{f.title}</h3><p className="mt-1 text-sm text-muted-foreground">{f.body}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="mb-4 flex items-end justify-between"><h2 className="text-2xl font-semibold">Featured strategies</h2><Link to="/marketplace" className="text-sm text-primary">See all</Link></div>
        {error ? <ErrorState message="Couldn't load featured strategies." /> : !featured ? <CardGridSkeleton n={3} /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featured.map((l) => <ListingCard key={l.id} listing={l} />)}</div>}
      </section>

      <section className="border-y bg-panel">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-12">
          <div>
            <h2 className="text-2xl font-semibold">Pay only for what you use. No subscriptions. No commission on your sales.</h2>
            <p className="mt-2 text-sm text-muted-foreground">Workspace from ${api.hourlyRate().toFixed(2)}/hour while running. Backtests from ${api.getTrialRunCost().cost.toFixed(2)} per run.</p>
          </div>
          <Button variant="outline" asChild><Link to="/pricing">See pricing</Link></Button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="mb-4 text-2xl font-semibold">FAQ</h2>
        <Accordion type="single" collapsible>
          {faq.map(([q, a]) => <AccordionItem key={q} value={q!}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </section>
    </main>
  );
}
