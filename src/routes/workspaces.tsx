import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Archive, Info, Loader2, Play, Plus, Square, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, Page, money } from "@/components/market/shared";
import * as api from "@/services/api";
import { rateCard } from "@/mockData";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workspaces")({
  head: () => meta("Workspaces · Tickforge", "Start, stop, archive and delete your cloud workspaces."),
  component: Workspaces,
});

type WS = Awaited<ReturnType<typeof api.getWorkspaces>>[number];
const tone = { Running: "border-profit/40 text-profit", Stopped: "text-muted-foreground", Archived: "border-primary/30 text-primary" };

function Workspaces() {
  const [items, setItems] = useState<WS[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = () => { setError(null); api.getWorkspaces().then(setItems).catch((e) => setError(e.message)); };
  useEffect(load, []);
  const act = async (id: string, action: Parameters<typeof api.updateWorkspaceState>[1]) => {
    setBusy(id + action); setActionError(null);
    try { setItems(await api.updateWorkspaceState(id, action)); } catch (e) { setActionError((e as Error).message); }
    setBusy(null);
  };
  const storageRate = rateCard.find((r) => r.id === "storage")!.rate;
  const archiveRate = rateCard.find((r) => r.id === "archive")!.rate;
  const B = ({ id, action, icon: I, label, disabled }: { id: string; action: "start" | "stop" | "archive"; icon: typeof Play; label: string; disabled?: boolean }) => (
    <Button size="sm" variant="outline" disabled={disabled || !!busy} onClick={() => act(id, action)}>{busy === id + action ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <I className="h-3.5 w-3.5" />}{label}</Button>
  );
  return (
    <Page title="Workspaces" actions={<Button onClick={() => act("", "create")} disabled={!!busy}><Plus className="h-4 w-4" /> New workspace</Button>}>
      {actionError && <p className="mb-3 text-sm text-loss">{actionError} <Link to="/billing" className="underline">Add credits</Link></p>}
      {error ? <ErrorState message={error} onRetry={load} /> : !items ? <Skeleton className="h-48" /> : items.length === 0 ? <EmptyState title="No workspaces" body="Create one to start building strategies." /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((w) => (
            <div key={w.id} className="flex flex-col rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{w.name}</h3><Badge variant="outline" className={cn(tone[w.status])}>{w.status}</Badge></div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div><dt className="text-muted-foreground">Cost this month</dt><dd className="font-mono">{money(w.costThisMonth, 2)}</dd></div>
                <div><dt className="text-muted-foreground">Storage</dt><dd className="font-mono">{w.storageGb} GB</dd></div>
                <div><dt className="text-muted-foreground">Last active</dt><dd>{w.lastActive}</dd></div>
              </dl>
              {w.status === "Stopped" && <p className="mt-3 flex gap-1.5 text-[11px] text-muted-foreground"><Info className="mt-0.5 h-3 w-3 shrink-0" />Stopped workspaces still pay storage ({money(storageRate * w.storageGb, 2)}/month). Archive to pay {money(archiveRate * w.storageGb, 2)}/month.</p>}
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                {w.status === "Running" ? <B id={w.id} action="stop" icon={Square} label="Stop" /> : <B id={w.id} action="start" icon={Play} label="Start" />}
                <B id={w.id} action="archive" icon={Archive} label="Archive" disabled={w.status === "Archived"} />
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="text-loss" disabled={!!busy}><Trash2 className="h-3.5 w-3.5" />Delete</Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete {w.name}?</AlertDialogTitle><AlertDialogDescription>All strategies, files and reports in this workspace are permanently removed.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => act(w.id, "delete")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
