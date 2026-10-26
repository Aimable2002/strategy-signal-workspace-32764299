import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/admin")({
  head: () => meta("Admin · Tickforge", "Platform administration."),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex flex-1">
      <aside className="w-48 shrink-0 border-r bg-sidebar p-3">
        <Link to="/admin/review" className="block rounded px-2 py-1.5 text-sm text-muted-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground">Review queue</Link>
      </aside>
      <div className="min-w-0 flex-1"><Outlet /></div>
    </div>
  );
}
