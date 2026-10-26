import { Plus, MessageSquare, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Strategy } from "@/mockData";
import { cn } from "@/lib/utils";

export function Sidebar({ strategies, activeId, onSelect, onNew, engine }: {
  strategies: Strategy[] | null; activeId: string; onSelect: (id: string) => void; onNew: () => void;
  engine: { ready: boolean; label: string; coverage: string } | null;
}) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar">
      <div className="p-3">
        <Button className="w-full justify-start" size="sm" onClick={onNew}><Plus className="h-4 w-4" /> New strategy</Button>
      </div>
      <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Strategies</div>
      <nav className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-2">
        {!strategies && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="mx-1 my-1.5 h-9" />)}
        {strategies?.length === 0 && <p className="px-2 py-4 text-xs text-muted-foreground">No strategies yet. Start one with "New strategy".</p>}
        {strategies?.map((s) => (
          <button key={s.id} onClick={() => onSelect(s.id)}
            className={cn("flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent",
              s.id === activeId && "bg-sidebar-accent ring-1 ring-primary/40")}>
            <MessageSquare className={cn("mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground", s.id === activeId && "text-primary")} />
            <span className="min-w-0">
              <span className="block truncate">{s.title}</span>
              <span className="block text-[11px] text-muted-foreground">{s.updatedAt}</span>
            </span>
          </button>
        ))}
      </nav>
      <div className="m-3 rounded-md border bg-card p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground"><Database className="h-3 w-3" /> Backtest engine</div>
        {engine ? (
          <>
            <div className="flex items-center gap-2 text-sm"><span className={cn("h-2 w-2 rounded-full", engine.ready ? "bg-profit" : "bg-warning")} />{engine.label}</div>
            <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{engine.coverage}</p>
          </>
        ) : <Skeleton className="h-8" />}
      </div>
    </aside>
  );
}
