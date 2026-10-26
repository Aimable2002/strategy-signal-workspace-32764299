import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sell/payouts")({
  head: () => meta("Payout setup · Tickforge", "Identity, payout method and tax details for builder earnings."),
  component: Payouts,
});

const COUNTRIES = ["United Kingdom", "United States", "Germany", "Nigeria", "Egypt", "Rwanda", "Japan", "Brazil"];
const badge: Record<string, string> = { Verified: "border-profit/40 text-profit", Pending: "border-warning/40 text-warning", "Not started": "text-muted-foreground" };

function Payouts() {
  const [f, setF] = useState<Awaited<ReturnType<typeof api.getPayoutSetup>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { api.getPayoutSetup().then(setF).catch((e) => setError(e.message)); }, []);
  if (error) return <Page title="Payout setup"><ErrorState message={error} /></Page>;
  if (!f) return <Page title="Payout setup"><Skeleton className="h-96" /></Page>;
  const save = async () => { setBusy(true); setF(await api.savePayoutSetup(f)); setBusy(false); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const field = (k: keyof typeof f, label: string, type = "text") => <div className="space-y-1"><Label className="text-xs">{label}</Label><Input type={type} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>;
  const sample = 50;

  return (
    <Page title="Payout setup" subtitle="No platform fee. You keep 100% of the sale price minus payment processing.">
      <div className="mb-6 flex flex-wrap gap-2">
        {([["Identity", f.identity], ["Payout method", f.bank], ["Tax information", f.tax]] as const).map(([l, s]) => <Badge key={l} variant="outline" className={cn(badge[s])}>{l}: {s}</Badge>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-3 rounded-lg border bg-card p-5">
            <h2 className="font-semibold">Identity</h2>
            <div className="grid gap-3 sm:grid-cols-2">{field("fullName", "Legal name")}{field("dob", "Date of birth", "date")}</div>
            {field("address", "Address")}
            <div className="space-y-1"><Label className="text-xs">Country</Label><Select value={f.country} onValueChange={(country) => setF({ ...f, country })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          </section>
          <section className="space-y-3 rounded-lg border bg-card p-5">
            <h2 className="font-semibold">Payout method</h2>
            <RadioGroup value={f.method} onValueChange={(method) => setF({ ...f, method })} className="grid gap-2 sm:grid-cols-2">
              {[["bank", "Bank transfer"], ["provider", "Payout provider (e.g. Wise, PayPal)"]].map(([v, l]) => <label key={v} className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm has-[[data-state=checked]]:border-primary"><RadioGroupItem value={v!} />{l}</label>)}
            </RadioGroup>
            <div className="grid gap-3 sm:grid-cols-2">{field("accountName", "Account holder name")}{field("iban", f.method === "bank" ? "IBAN / account number" : "Provider email")}</div>
          </section>
          <section className="space-y-3 rounded-lg border bg-card p-5">
            <h2 className="font-semibold">Tax information</h2>
            <div className="grid gap-3 sm:grid-cols-2">{field("taxId", "Tax ID / VAT number")}<div className="space-y-1"><Label className="text-xs">Tax residence</Label><Select value={f.taxCountry} onValueChange={(taxCountry) => setF({ ...f, taxCountry })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div></div>
          </section>
          <div className="flex items-center gap-3"><Button onClick={save} disabled={busy || !f.fullName.trim()}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Save payout details</Button>{saved && <span className="flex items-center gap-1 text-sm text-profit"><CheckCircle2 className="h-4 w-4" />Saved, verification pending</span>}</div>
        </div>
        <aside className="h-fit rounded-lg border bg-panel p-5">
          <h2 className="font-semibold">Your earnings per sale</h2>
          <p className="mt-1 text-xs text-muted-foreground">Sale price − payment processing fee = Your earnings</p>
          <div className="mt-4 space-y-1.5 font-mono text-sm">
            <div className="flex justify-between"><span>Sale price</span><span>{money(sample, 2)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Payment processing fee</span><span>−{money(api.processingFee(sample), 2)}</span></div>
            <div className="flex justify-between border-t pt-1.5 font-semibold text-profit"><span>Your earnings</span><span>{money(api.builderEarnings(sample), 2)}</span></div>
          </div>
        </aside>
      </div>
    </Page>
  );
}
