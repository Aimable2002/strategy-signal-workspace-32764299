import { useEffect, useState } from "react";
import { Play, Square, Trash2, Info, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { WorkspaceStatus } from "@/mockData";
import { cn } from "@/lib/utils";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

export function TopBar({ status, startedAt, onStart, onStop, onDelete, credit, onToggleSidebar }: {
  status: WorkspaceStatus; startedAt: number; onStart: () => void; onStop: () => void; onDelete: () => void;
  credit: { balance: number; hourly: number }; onToggleSidebar: () => void;
}) {
  const hoursLeft = credit.hourly > 0 ? Math.floor(credit.balance / credit.hourly) : 0;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-panel px-3">
      <Button variant="ghost" size="icon" className="hidden h-8 w-8 lg:inline-flex" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <PanelLeft className="h-4 w-4" />
      </Button>

      <div className="mx-auto flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs">
          <span className={cn("h-2 w-2 rounded-full", status === "running" && "bg-profit animate-pulse-dot", status === "starting" && "bg-warning animate-pulse-dot", status === "stopped" && "bg-muted-foreground")} />
          <span className="font-medium">{status === "running" ? "Running" : status === "starting" ? "Starting..." : "Stopped"}</span>
          {status === "running" && <span className="font-mono text-muted-foreground">{fmt(now - startedAt)}</span>}
        </div>
        <span className="hidden text-[11px] text-muted-foreground lg:inline">Costs ${credit.hourly.toFixed(2)}/hour while running</span>
        <Button variant="outline" size="sm" className="h-8" onClick={onStop} disabled={status !== "running"}>
          <Square className="h-3.5 w-3.5" /><span className="hidden md:inline">Stop</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={onStart} disabled={status !== "stopped"}>
          <Play className="h-3.5 w-3.5" /><span className="hidden md:inline">Start</span>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /><span className="hidden xl:inline">Delete workspace</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
              <AlertDialogDescription>All strategies, compiled files, backtest summaries and history in this workspace will be permanently removed. This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete workspace</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="hidden items-center gap-1.5 text-xs text-muted-foreground 2xl:flex" title="Backtests are historical simulations. No real trades are placed.">
        <Info className="h-3.5 w-3.5" /> No real trades are placed
      </div>
      <div className="hidden flex-col items-end md:flex">
        <span className="rounded-full border bg-card px-2.5 py-0.5 font-mono text-xs">${credit.balance.toFixed(2)}</span>
        <span className="text-[11px] text-muted-foreground">about {hoursLeft} hours left at the current rate</span>
      </div>
    </header>
  );
}
