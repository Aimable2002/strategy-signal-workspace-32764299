import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, LineChart, Shield, Wallet } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import * as api from "@/services/api";
import { setDevState, useDevState } from "@/lib/devState";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Workspace", exact: true },
  { to: "/marketplace", label: "Marketplace", exact: false },
  { to: "/library", label: "Library", exact: false },
  { to: "/sell", label: "Sell", exact: false },
] as const;

const linkCls = "whitespace-nowrap rounded px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground";

export function CreditChip() {
  const dev = useDevState();
  const [bal, setBal] = useState<number | null>(null);
  useEffect(() => {
    const load = () => api.getCreditBalance().then((b) => setBal(b.balance));
    load();
    window.addEventListener("credits-changed", load);
    return () => window.removeEventListener("credits-changed", load);
  }, [dev.credit]);
  const tone = bal == null ? "" : bal <= 0 ? "border-loss/50 text-loss" : bal < 2 ? "border-warning/50 text-warning" : "";
  return (
    <Link to="/billing" className={cn("flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 font-mono text-xs", tone)} aria-label="Credit balance">
      <Wallet className="h-3.5 w-3.5" />{bal == null ? "…" : `$${bal.toFixed(2)}`}
    </Link>
  );
}

function NotificationsBell() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof api.getNotifications>> | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const load = () => api.getNotifications().then(setItems);
    load();
    return api.subscribeNotifications(load);
  }, []);
  const unread = items?.filter((n) => !n.read).length ?? 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded p-1.5 text-muted-foreground hover:text-foreground" aria-label={`Notifications, ${unread} unread`}>
          <Bell className="h-4 w-4" />
          {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{unread}</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && <button className="text-xs text-primary" onClick={() => api.markNotificationRead("all")}>Mark all read</button>}
        </div>
        <DropdownMenuSeparator />
        {!items ? <p className="p-3 text-xs text-muted-foreground">Loading…</p> : items.length === 0 ? <p className="p-3 text-xs text-muted-foreground">You're all caught up.</p> : items.slice(0, 5).map((n) => (
          <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5" onSelect={() => { api.markNotificationRead(n.id); if (n.href) navigate({ to: n.href }); }}>
            <span className="flex w-full items-center gap-2 text-sm font-medium">{!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}{n.title}<span className="ml-auto text-[10px] font-normal text-muted-foreground">{n.date.slice(5)}</span></span>
            <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/notifications" className="justify-center text-xs">View all</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppNav() {
  const dev = useDevState();
  const { pathname } = useLocation();
  if (pathname === "/maintenance") {
    return (
      <nav className="flex h-12 shrink-0 items-center border-b bg-sidebar px-3">
        <Link to="/welcome" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground"><LineChart className="h-3.5 w-3.5" /></span>
          <span className="text-sm font-semibold">Tickforge</span>
        </Link>
      </nav>
    );
  }
  return (
    <nav className="flex h-12 shrink-0 items-center gap-1 border-b bg-sidebar px-3">
      <Link to={dev.loggedIn ? "/" : "/welcome"} className="mr-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground"><LineChart className="h-3.5 w-3.5" /></span>
        <span className="hidden text-sm font-semibold sm:inline">Tickforge</span>
      </Link>
      <div className="scrollbar-thin flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {dev.loggedIn ? links.map((l) => <Link key={l.to} to={l.to} activeOptions={{ exact: l.exact }} className={linkCls}>{l.label}</Link>)
          : <><Link to="/marketplace" className={linkCls}>Marketplace</Link><Link to="/pricing" className={linkCls}>Pricing</Link><Link to="/help" className={linkCls}>Help</Link></>}
        {dev.loggedIn && dev.role === "admin" && <Link to="/admin" className={cn(linkCls, "flex items-center gap-1")}><Shield className="h-3.5 w-3.5" />Admin</Link>}
      </div>
      {dev.loggedIn ? (
        <div className="flex items-center gap-2">
          <CreditChip />
          <NotificationsBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="User menu"><Avatar className="h-7 w-7"><AvatarFallback className="bg-secondary text-[11px]">JD</AvatarFallback></Avatar></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Jamie Doe <span className="block text-[11px] font-normal capitalize text-muted-foreground">{dev.role} view</span></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/account">Account</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/billing">Billing</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/workspaces">Workspaces</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/orders">Orders</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/favorites">Favorites</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/help">Help</Link></DropdownMenuItem>
              {dev.role === "admin" && <DropdownMenuItem asChild><Link to="/admin">Admin</Link></DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/welcome" onClick={() => setDevState({ loggedIn: false })}>Log out</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" asChild><Link to="/login">Log in</Link></Button>
          <Button size="sm" asChild><Link to="/signup">Sign up</Link></Button>
        </div>
      )}
    </nav>
  );
}
