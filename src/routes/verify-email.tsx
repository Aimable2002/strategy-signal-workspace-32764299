import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/market/AuthCard";
import { setDevState } from "@/lib/devState";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (s: Record<string, unknown>) => ({ email: s["email"] ? String(s["email"]) : undefined }) as { email?: string | undefined },
  head: () => meta("Verify your email · Tickforge", "Confirm your email address to finish creating your account."),
  component: Verify,
});

function Verify() {
  const { email } = Route.useSearch();
  const [resent, setResent] = useState(false);
  return (
    <AuthCard title="Verify your email">
      <p className="flex items-start gap-3 text-sm text-muted-foreground"><MailCheck className="h-5 w-5 shrink-0 text-primary" />We sent a confirmation link to {email ?? "your email"}. Click it to activate your account.</p>
      <Button variant="outline" className="w-full" disabled={resent} onClick={() => setResent(true)}>{resent ? "Email sent again" : "Resend email"}</Button>
      <Button className="w-full" asChild><Link to="/onboarding" onClick={() => setDevState({ loggedIn: true })}>Demo: I've verified, continue</Link></Button>
    </AuthCard>
  );
}
