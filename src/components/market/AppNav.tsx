import { Link } from "@tanstack/react-router";
import { LineChart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Workspace", exact: true },
  { to: "/marketplace", label: "Marketplace", exact: false },
  { to: "/library", label: "My Library", exact: false },
  { to: "/sell", label: "Sell", exact: false },
] as const;

export function AppNav() {
  return (
    <nav className="flex h-12 shrink-0 items-center gap-1 border-b bg-sidebar px-3">
      <Link to="/" className="mr-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground"><LineChart className="h-3.5 w-3.5" /></span>
        <span className="hidden text-sm font-semibold sm:inline">Tickforge</span>
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeOptions={{ exact: l.exact }}
            className="whitespace-nowrap rounded px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground"
          >
            {l.label}
          </Link>
        ))}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button aria-label="User menu"><Avatar className="h-7 w-7"><AvatarFallback className="bg-secondary text-[11px]">JD</AvatarFallback></Avatar></button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Jamie Doe</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/builders/$id" params={{ id: "b1" }}>My public profile</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/sell">Builder dashboard</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/admin/review">Admin review queue</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
