import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AuthCard } from "@/components/market/AuthCard";
import * as api from "@/services/api";
import { SIGNUP_BONUS } from "@/mockData";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/signup")({
  head: () => meta("Sign up · Tickforge", "Create your Tickforge account and get free credit to start."),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", goal: "both" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    try { await api.signUp(f); navigate({ to: "/verify-email", search: { email: f.email } }); } catch (err) { setError((err as Error).message); }
    setBusy(false);
  };
  return (
    <AuthCard title="Create your account" footer={<>Already have an account? <Link to="/login" className="text-primary">Log in</Link></>}>
      <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"><Gift className="h-4 w-4" /> New accounts get ${SIGNUP_BONUS} free credit.</div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1"><Label htmlFor="name">Name</Label><Input id="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
        <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
        <div className="space-y-1"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /><p className="text-[11px] text-muted-foreground">At least 8 characters.</p></div>
        <div className="space-y-2"><Label>I want to</Label>
          <RadioGroup value={f.goal} onValueChange={(goal) => setF({ ...f, goal })} className="grid grid-cols-3 gap-2">
            {[["build", "Build strategies"], ["buy", "Buy strategies"], ["both", "Both"]].map(([v, l]) => (
              <label key={v} className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border p-2 text-center text-xs has-[[data-state=checked]]:border-primary"><RadioGroupItem value={v!} />{l}</label>
            ))}
          </RadioGroup>
        </div>
        <label className="flex items-start gap-2 text-xs"><Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
          <span>I agree to the <Link to="/legal/$doc" params={{ doc: "terms" }} className="text-primary">Terms</Link> and have read the <Link to="/legal/$doc" params={{ doc: "risk" }} className="text-primary">Risk Disclosure</Link>.</span></label>
        {error && <p className="text-sm text-loss">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy || !agree}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account</Button>
      </form>
    </AuthCard>
  );
}
