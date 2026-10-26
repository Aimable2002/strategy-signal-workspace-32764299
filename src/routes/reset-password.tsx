import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/market/AuthCard";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/reset-password")({
  head: () => meta("Set a new password · Tickforge", "Choose a new password for your Tickforge account."),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (pw !== pw2) return setError("Passwords don't match");
    setBusy(true);
    try { await api.resetPassword({ password: pw }); setDone(true); } catch (err) { setError((err as Error).message); }
    setBusy(false);
  };
  if (done) return <AuthCard title="Password updated"><p className="flex items-center gap-2 text-sm text-profit"><CheckCircle2 className="h-4 w-4" /> You can now log in with your new password.</p><Button className="w-full" asChild><Link to="/login">Log in</Link></Button></AuthCard>;
  return (
    <AuthCard title="Set a new password">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1"><Label htmlFor="pw">New password</Label><Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
        <div className="space-y-1"><Label htmlFor="pw2">Confirm password</Label><Input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required /></div>
        {error && <p className="text-sm text-loss">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Update password</Button>
      </form>
    </AuthCard>
  );
}
