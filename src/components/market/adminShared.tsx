import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/** Loads data once and on demand; keeps the previous rows visible while reloading. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => { setError(null); fn().then(setData).catch((e) => setError((e as Error).message)); }, deps);
  useEffect(load, [load]);
  return { data, error, load };
}

export function FilterChips<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <Button key={o} size="sm" variant={value === o ? "secondary" : "ghost"} className="h-7 px-2.5 text-xs" onClick={() => onChange(o)}>{o}</Button>
      ))}
    </div>
  );
}

/** Confirmation dialog that runs an async action and shows its error inline. */
export function ConfirmAction({ open, title, body, confirmLabel, destructive, onConfirm, onClose }: {
  open: boolean; title: string; body: ReactNode; confirmLabel: string; destructive?: boolean;
  onConfirm: () => Promise<unknown>; onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) setError(null); }, [open]);
  const run = async () => {
    setBusy(true); setError(null);
    try { await onConfirm(); onClose(); } catch (e) { setError((e as Error).message); }
    setBusy(false);
  };
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o && !busy) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-loss">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={busy} onClick={(e) => { e.preventDefault(); void run(); }} className={destructive ? "bg-loss text-white hover:bg-loss/90" : undefined}>
            {busy ? "Working…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const tableSkeleton = <div className="h-48 animate-pulse rounded-md bg-muted/40" />;
