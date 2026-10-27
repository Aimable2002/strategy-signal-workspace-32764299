import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmAction, tableSkeleton, useLoad } from "@/components/market/adminShared";
import { EmptyState, ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  head: () => meta("Users · Tickforge Admin", "Search and manage platform users."),
  component: Users,
});

type User = Awaited<ReturnType<typeof api.getAdminUsers>>[number];

const activity = (u: User) => [
  `Joined on ${u.joined}`,
  u.role === "Builder" ? "Published a strategy for review" : u.role === "Buyer" ? "Ran 3 test backtests" : "Reviewed a listing",
  `Credit balance is ${money(u.balance, 2)}`,
  u.status === "Suspended" ? "Account suspended by an admin" : "Last seen today",
];

function Users() {
  const [q, setQ] = useState("");
  const { data, error, load } = useLoad(() => api.getAdminUsers(q), [q]);
  const [confirm, setConfirm] = useState<User | null>(null);
  const [view, setView] = useState<User | null>(null);
  const suspending = confirm?.status === "Active";

  return (
    <Page title="Users" subtitle="Search by name or email. Suspended users cannot sign in.">
      <Input placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-sm" aria-label="Search users" />
      {error ? <ErrorState message={error} onRetry={load} /> : !data ? tableSkeleton : data.length === 0 ? <EmptyState title="No users match your search" /> : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Credits</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell className="text-right font-mono">{money(u.balance, 2)}</TableCell>
                  <TableCell><Badge variant="outline" className={cn(u.status === "Active" ? "border-profit/40 text-profit" : "border-loss/40 text-loss")}>{u.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{u.joined}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setView(u)}>View</Button>
                    <Button size="sm" variant="outline" disabled={u.role === "Admin"} onClick={() => setConfirm(u)}>{u.status === "Active" ? "Suspend" : "Reactivate"}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmAction
        open={!!confirm}
        title={suspending ? `Suspend ${confirm?.name}?` : `Reactivate ${confirm?.name}?`}
        body={suspending ? "They will be signed out and cannot use the platform until reactivated. Their files are kept." : "They will be able to sign in and use the platform again."}
        confirmLabel={suspending ? "Suspend user" : "Reactivate user"}
        destructive={suspending}
        onConfirm={async () => { await api.setUserStatus(confirm!.id, suspending ? "Suspended" : "Active"); load(); }}
        onClose={() => setConfirm(null)}
      />

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent>
          {view && (<>
            <SheetHeader>
              <SheetTitle>{view.name}</SheetTitle>
              <SheetDescription>{view.email}</SheetDescription>
            </SheetHeader>
            <dl className="mt-4 grid grid-cols-2 gap-3 px-4 text-sm">
              <div><dt className="text-xs text-muted-foreground">Role</dt><dd>{view.role}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Status</dt><dd>{view.status}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Credit balance</dt><dd className="font-mono">{money(view.balance, 2)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Joined</dt><dd>{view.joined}</dd></div>
            </dl>
            <h3 className="mt-6 px-4 text-sm font-semibold">Recent activity</h3>
            <ul className="mt-2 space-y-2 px-4 text-sm text-muted-foreground">{activity(view).map((a) => <li key={a} className="border-l-2 pl-3">{a}</li>)}</ul>
          </>)}
        </SheetContent>
      </Sheet>
    </Page>
  );
}
