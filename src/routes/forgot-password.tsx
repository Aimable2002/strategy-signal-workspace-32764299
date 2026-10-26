import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/market/AuthCard";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/forgot-password")({
  head: () => meta("Forgot password · Tickforge", "Reset your Tickforge password."),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); await api.resetPassword({ email }); setBusy(false); setSent(true); };
  if (sent) return (
    <AuthCard title="Check your email" footer={<Link to="/login" className="text-primary">Back to log in</Link>}>
      <div className="flex items-start gap-3 text-sm text-muted-foreground"><MailCheck className="h-5 w-5 shrink-0 text-primary" />If an account exists for {email}, we've sent a link to reset your password. <Link to="/reset-password" className="text-primary">(Demo: open reset page)</Link></div>
    </AuthCard>
  );
  return (
    <AuthCard title="Forgot your password?" subtitle="We'll email you a reset link." footer={<Link to="/login" className="text-primary">Back to log in</Link>}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link</Button>
      </form>
    </AuthCard>
  );
}
