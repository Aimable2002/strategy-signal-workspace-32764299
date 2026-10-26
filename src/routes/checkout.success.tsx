import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (s: Record<string, unknown>) => ({ listing: String(s["listing"] ?? ""), order: String(s["order"] ?? "") }),
  head: () => meta("Purchase complete · Tickforge", "Your strategy is now in your library."),
  component: Success,
});

function Success() {
  const { order } = Route.useSearch();
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <CheckCircle2 className="h-10 w-10 text-profit" />
      <h1 className="mt-4 text-xl font-semibold">Payment successful</h1>
      <p className="mt-2 text-sm text-muted-foreground">Order {order || "—"} is confirmed. Your files are ready in My Library.</p>
      <div className="mt-6 flex gap-2">
        <Button asChild><Link to="/library">Go to My Library</Link></Button>
        <Button variant="outline" asChild><Link to="/marketplace">Keep browsing</Link></Button>
      </div>
    </main>
  );
}
