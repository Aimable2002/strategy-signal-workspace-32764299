import { useEffect, useState } from "react";
import { Play, Square, Trash2, LineChart, Info, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { WorkspaceStatus } from "@/mockData";
import { cn } from "@/lib/utils";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

export function TopBar({ status, startedAt, onStart, onStop, onDelete, usage, onToggleSidebar }: {
  status: WorkspaceStatus; startedAt: number; onStart: () => void; onStop: () => void; onDelete: () => void;
  usage: { used: number; limit: number }; onToggleSidebar: () => void;
}) {
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
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LineChart className="h-4 w-4" />
        </div>
        <span className="hidden font-semibold tracking-tight sm:inline">Tickforge</span>
      </div>

      <div className="mx-auto flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs">
          <span className={cn("h-2 w-2 rounded-full", status === "running" && "bg-profit animate-pulse-dot", status === "starting" && "bg-warning animate-pulse-dot", status === "stopped" && "bg-muted-foreground")} />
          <span className="font-medium">{status === "running" ? "Running" : status === "starting" ? "Starting..." : "Stopped"}</span>
          {status === "running" && <span className="font-mono text-muted-foreground">{fmt(now - startedAt)}</span>}
        </div>
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
              <AlertDialogDescription>All strategies, compiled files, backtest reports and history in this workspace will be permanently removed. This cannot be undone.</AlertDialogDescription>
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
      <div className="hidden w-44 flex-col gap-1 md:flex">
        <div className="text-[11px] text-muted-foreground"><span className="font-medium text-foreground">{usage.used} / {usage.limit}</span> hours used this month</div>
        <Progress value={(usage.used / usage.limit) * 100} className="h-1.5" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button aria-label="Account menu"><Avatar className="h-8 w-8"><AvatarFallback className="bg-secondary text-xs">JD</AvatarFallback></Avatar></button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>jane@example.com</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Usage</DropdownMenuItem>
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
