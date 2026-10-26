import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/market/AuthCard";
import * as api from "@/services/api";
import { setDevState } from "@/lib/devState";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/login")({
  head: () => meta("Log in · Tickforge", "Log in to your Tickforge workspace."),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    try { await api.logIn(f); setDevState({ loggedIn: true }); navigate({ to: "/" }); } catch (err) { setError((err as Error).message); }
    setBusy(false);
  };
  return (
    <AuthCard title="Log in" footer={<>New here? <Link to="/signup" className="text-primary">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
        <div className="space-y-1"><div className="flex justify-between"><Label htmlFor="pw">Password</Label><Link to="/forgot-password" className="text-xs text-primary">Forgot password?</Link></div><Input id="pw" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></div>
        {error && <p className="text-sm text-loss">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Log in</Button>
        <p className="text-center text-[11px] text-muted-foreground">Demo: any email works. Use the password "wrong" to see the error state.</p>
      </form>
    </AuthCard>
  );
}
