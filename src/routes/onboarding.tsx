import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Hammer, LayoutPanelLeft, PlayCircle, ShoppingBag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SYMBOLS, STYLES } from "@/mockData";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => meta("Get started · Tickforge", "Set up your Tickforge account in three quick steps."),
  component: Onboarding,
});

const tour = [
  { icon: LayoutPanelLeft, title: "Strategies", body: "Left: every strategy you've built, with versions." },
  { icon: Bot, title: "Agent chat", body: "Middle: describe changes and the agent edits, compiles and tests." },
  { icon: PlayCircle, title: "Results", body: "Right: equity curve, metrics, files and Strategy Tester settings." },
];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={cn("rounded-full border px-3 py-1 text-sm", on ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>{children}</button>;
}

function Onboarding() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("both");
  const [symbols, setSymbols] = useState<string[]>(["EURUSD"]);
  const [styles, setStyles] = useState<string[]>([]);
  const toggle = (arr: string[], v: string, set: (x: string[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="mb-6 flex gap-2">{[0, 1, 2].map((i) => <span key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />)}</div>
      <div className="rounded-lg border bg-card p-6">
        {step === 0 && (<>
          <h1 className="text-xl font-semibold">What brings you here?</h1>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[["build", "Build strategies", Hammer], ["buy", "Buy strategies", ShoppingBag], ["both", "Both", Users]].map(([v, l, Icon]) => {
              const I = Icon as typeof Hammer;
              return <button key={v as string} onClick={() => setGoal(v as string)} className={cn("flex flex-col items-center gap-2 rounded-lg border p-5 text-sm", goal === v && "border-primary bg-primary/5")}><I className="h-5 w-5 text-primary" />{l as string}</button>;
            })}
          </div>
        </>)}
        {step === 1 && (<>
          <h1 className="text-xl font-semibold">Your favorite markets</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'll use these to suggest strategies and default backtest settings.</p>
          <div className="mt-5 text-xs font-medium text-muted-foreground">Symbols</div>
          <div className="mt-2 flex flex-wrap gap-2">{SYMBOLS.map((s) => <Chip key={s} on={symbols.includes(s)} onClick={() => toggle(symbols, s, setSymbols)}>{s}</Chip>)}</div>
          <div className="mt-5 text-xs font-medium text-muted-foreground">Style</div>
          <div className="mt-2 flex flex-wrap gap-2">{STYLES.map((s) => <Chip key={s} on={styles.includes(s)} onClick={() => toggle(styles, s, setStyles)}>{s}</Chip>)}</div>
        </>)}
        {step === 2 && (<>
          <h1 className="text-xl font-semibold">A quick tour of your workspace</h1>
          <div className="mt-5 space-y-3">{tour.map((t) => <div key={t.title} className="flex gap-3 rounded-md border p-3"><t.icon className="h-5 w-5 shrink-0 text-primary" /><div><div className="text-sm font-medium">{t.title}</div><div className="text-sm text-muted-foreground">{t.body}</div></div></div>)}</div>
        </>)}
        <div className="mt-6 flex justify-between border-t pt-4">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          {step < 2 ? <Button onClick={() => setStep(step + 1)} disabled={step === 1 && symbols.length === 0}>Continue</Button> : (
            <div className="flex gap-2"><Button variant="outline" asChild><Link to="/marketplace">Open marketplace</Link></Button><Button asChild><Link to="/">Open workspace</Link></Button></div>
          )}
        </div>
      </div>
    </main>
  );
}
