import { Link } from "@tanstack/react-router";
import { LineChart } from "lucide-react";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/welcome" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><LineChart className="h-4 w-4" /></span>
          <span className="font-semibold">Tickforge</span>
        </Link>
        <div className="rounded-lg border bg-card p-6">
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
          <div className="mt-5 space-y-4">{children}</div>
        </div>
        {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </main>
  );
}
