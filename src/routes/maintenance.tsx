import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LineChart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/maintenance")({
  head: () => meta("We'll be right back · Tickforge", "Tickforge is down for scheduled maintenance."),
  component: Maintenance,
});

function Maintenance() {
  const [checking, setChecking] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const check = () => {
    setChecking(true);
    setTimeout(() => { setChecking(false); setCheckedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })); }, 1200);
  };
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded bg-primary text-primary-foreground"><LineChart className="h-5 w-5" aria-hidden /></span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">We'll be right back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tickforge is down for scheduled maintenance. Your workspaces and files are safe, and credits are not charged while we're away.</p>
        <p className="mt-4 text-sm">Expected back by <span className="font-medium">04:30 UTC</span></p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Button onClick={check} disabled={checking}>{checking && <Loader2 className="h-4 w-4 animate-spin" />}{checking ? "Checking…" : "Check again"}</Button>
          <p className="min-h-5 text-xs text-muted-foreground" role="status">{checkedAt && !checking ? `Still down as of ${checkedAt}.` : ""}</p>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Need to reach us? <Link to="/contact" className="text-primary underline">Contact support</Link>.</p>
      </div>
    </main>
  );
}
