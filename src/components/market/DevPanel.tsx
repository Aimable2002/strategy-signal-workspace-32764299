import { useState } from "react";
import { Settings2, X } from "lucide-react";
import { setDevState, useDevState, type CreditState, type Role } from "@/lib/devState";
import { cn } from "@/lib/utils";

function Seg<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-md border p-0.5">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={cn("flex-1 rounded px-2 py-1 text-[11px] capitalize", value === o ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{o}</button>
      ))}
    </div>
  );
}

/** Prototype-only switcher to preview roles, signed-in state and credit states. */
export function DevPanel() {
  const dev = useDevState();
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-3 right-3 z-50">
      {open ? (
        <div className="w-64 space-y-3 rounded-lg border bg-popover p-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold">Preview as <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-3.5 w-3.5" /></button></div>
          <div className="space-y-1"><div className="text-[11px] text-muted-foreground">Role</div><Seg<Role> value={dev.role} options={["buyer", "builder", "admin"]} onChange={(role) => setDevState({ role })} /></div>
          <div className="space-y-1"><div className="text-[11px] text-muted-foreground">Session</div><Seg value={dev.loggedIn ? "signed in" : "signed out"} options={["signed in", "signed out"]} onChange={(v) => setDevState({ loggedIn: v === "signed in" })} /></div>
          <div className="space-y-1"><div className="text-[11px] text-muted-foreground">Credits</div><Seg<CreditState> value={dev.credit} options={["normal", "low", "zero"]} onChange={(credit) => setDevState({ credit })} /></div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-full border bg-popover px-3 py-1.5 text-xs shadow-lg"><Settings2 className="h-3.5 w-3.5" /> Dev</button>
      )}
    </div>
  );
}
