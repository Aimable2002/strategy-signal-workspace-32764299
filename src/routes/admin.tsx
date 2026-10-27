import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/market/shared";
import { setDevState, useDevState } from "@/lib/devState";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/admin")({
  head: () => meta("Admin · Tickforge", "Platform administration."),
  component: AdminLayout,
});

const items = [
  { to: "/admin/review", label: "Review queue" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/disputes", label: "Disputes and refunds" },
  { to: "/admin/payouts", label: "Payouts" },
  { to: "/admin/cost", label: "Cost monitor" },
] as const;

function AdminLayout() {
  const dev = useDevState();
  if (!dev.loggedIn || dev.role !== "admin") {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-16">
        <EmptyState
          title="Admin only"
          body="This area is for platform admins. Switch the dev role to Admin to preview it."
          action={<Button size="sm" onClick={() => setDevState({ loggedIn: true, role: "admin" })}>Preview as admin</Button>}
        />
      </main>
    );
  }
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="flex w-full shrink-0 gap-1 overflow-x-auto border-b bg-sidebar p-2 md:block md:w-52 md:space-y-0.5 md:border-b-0 md:border-r md:p-3">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="block whitespace-nowrap rounded px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground">{i.label}</Link>
        ))}
      </aside>
      <div className="min-w-0 flex-1"><Outlet /></div>
    </div>
  );
}
