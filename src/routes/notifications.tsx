import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, Page } from "@/components/market/shared";
import * as api from "@/services/api";
import type { NotificationType } from "@/mockData";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => meta("Notifications · Tickforge", "Sales, reviews, listing decisions, credit and workspace alerts."),
  component: Notifications,
});

const FILTERS: { id: string; label: string; types?: NotificationType[] }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "sales", label: "Sales & refunds", types: ["sale", "refund"] },
  { id: "listings", label: "Listings", types: ["approved", "rejected", "version", "review", "connection"] },
  { id: "account", label: "Credits & workspace", types: ["credit", "stopping"] },
];

function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Awaited<ReturnType<typeof api.getNotifications>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    const load = () => api.getNotifications().then(setItems).catch((e) => setError(e.message));
    load();
    return api.subscribeNotifications(load);
  }, []);
  const f = FILTERS.find((x) => x.id === filter)!;
  const shown = items?.filter((n) => (filter === "unread" ? !n.read : !f.types || f.types.includes(n.type)));
  return (
    <Page title="Notifications" actions={<Button size="sm" variant="outline" onClick={() => api.markNotificationRead("all")}>Mark all read</Button>}>
      <div className="mb-4 flex flex-wrap gap-2">{FILTERS.map((x) => <button key={x.id} onClick={() => setFilter(x.id)} className={cn("rounded-full border px-3 py-1 text-sm", filter === x.id ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")}>{x.label}</button>)}</div>
      {error ? <ErrorState message={error} /> : !shown ? <Skeleton className="h-64" /> : shown.length === 0 ? <EmptyState title="Nothing here" body="You're all caught up." /> : (
        <div className="divide-y rounded-lg border">
          {shown.map((n) => (
            <button key={n.id} onClick={() => { api.markNotificationRead(n.id); if (n.href) navigate({ to: n.href }); }} className={cn("flex w-full gap-3 p-4 text-left hover:bg-accent", !n.read && "bg-primary/5")}>
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} />
              <span className="flex-1"><span className="flex items-center justify-between gap-2 text-sm font-medium">{n.title}<span className="font-mono text-[11px] font-normal text-muted-foreground">{n.date}</span></span><span className="mt-0.5 block text-sm text-muted-foreground">{n.body}</span></span>
            </button>
          ))}
        </div>
      )}
    </Page>
  );
}
