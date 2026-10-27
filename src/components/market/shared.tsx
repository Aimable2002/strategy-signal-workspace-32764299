import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Info, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Builder, EquityPoint, Listing, Metrics } from "@/mockData";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "./extras";

export const money = (n: number, d = 0) => `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export function Page({ title, subtitle, actions, children }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
        </div>
        {actions}
      </div>
      {children}
    </main>
  );
}

export function BacktestNote() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Info className="h-3.5 w-3.5" /> Backtest results are historical simulations and do not guarantee future performance.
    </p>
  );
}

export function RiskDisclosure() {
  return (
    <div className="mt-10 rounded-md border bg-panel p-4 text-xs leading-relaxed text-muted-foreground">
      <strong className="text-foreground">Risk disclosure.</strong> Trading foreign exchange, metals and indices on margin carries a high level of risk and may not be suitable for all investors. Backtest results are historical simulations based on past data and do not guarantee future performance. The platform never places real trades; strategies are tools you run at your own discretion.
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-loss/40 bg-loss/5 p-8 text-center">
      <AlertTriangle className="h-5 w-5 text-loss" />
      <p className="text-sm">{message}</p>
      {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      {body && <p className="max-w-sm text-xs text-muted-foreground">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
      <span className="font-medium">{rating.toFixed(1)}</span>
      {count != null && <span className="text-muted-foreground">({count})</span>}
    </span>
  );
}

export function BuilderAvatar({ builder, size = "sm" }: { builder: Builder; size?: "sm" | "lg" }) {
  return (
    <Avatar className={size === "lg" ? "h-16 w-16" : "h-6 w-6"}>
      <AvatarFallback className={cn("bg-secondary", size === "lg" ? "text-lg" : "text-[10px]")}>{builder.initials}</AvatarFallback>
    </Avatar>
  );
}

export function Sparkline({ data, positive }: { data: EquityPoint[]; positive: boolean }) {
  const color = positive ? "var(--color-profit)" : "var(--color-loss)";
  return (
    <div className="h-14 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Area dataKey="equity" stroke={color} fill={color} fillOpacity={0.12} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EquityChart({ series, height = 300 }: { series: { name: string; data: EquityPoint[]; color: string }[]; height?: number }) {
  const rows = series[0]!.data.map((p, i) => Object.fromEntries([["i", p.i], ...series.map((s) => [s.name, s.data[i]?.equity])]));
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis dataKey="i" hide />
          <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} width={52} />
          <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", fontSize: 12 }} formatter={(v: number) => money(v)} labelFormatter={() => ""} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => <Line key={s.name} dataKey={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export const METRIC_DEFS: { key: keyof Metrics; label: string; fmt: (m: Metrics) => string; tone?: (m: Metrics) => string }[] = [
  { key: "netProfit", label: "Net profit", fmt: (m) => money(m.netProfit), tone: (m) => (m.netProfit >= 0 ? "text-profit" : "text-loss") },
  { key: "profitFactor", label: "Profit factor", fmt: (m) => m.profitFactor.toFixed(2) },
  { key: "drawdown", label: "Max drawdown", fmt: (m) => `${m.drawdown.toFixed(1)}%`, tone: () => "text-loss" },
  { key: "winRate", label: "Win rate", fmt: (m) => `${m.winRate}%` },
  { key: "totalTrades", label: "Total trades", fmt: (m) => String(m.totalTrades) },
  { key: "sharpe", label: "Sharpe ratio", fmt: (m) => m.sharpe.toFixed(2) },
];

export function MetricGrid({ metrics, compare }: { metrics: Metrics; compare?: Metrics }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {METRIC_DEFS.map((d) => (
        <div key={d.key} className="rounded-md border bg-card p-3">
          <div className="text-[11px] text-muted-foreground">{d.label}</div>
          <div className={cn("mt-1 font-mono text-base font-semibold", d.tone?.(metrics))}>{d.fmt(metrics)}</div>
          {compare && <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">Listed: {d.fmt(compare)}</div>}
        </div>
      ))}
    </div>
  );
}

export type ListingWithBuilder = Listing & { builder: Builder };

export function ListingCard({ listing, preview }: { listing: ListingWithBuilder; preview?: boolean }) {
  const m = listing.metrics;
  return (
    <div className="flex flex-col rounded-lg border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-tight">{listing.title}</h3>
        <span className="flex items-center gap-1">{!preview && <FavoriteButton listingId={listing.id} />}<span className="font-mono text-sm font-semibold">{money(listing.price)}</span></span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <BuilderAvatar builder={listing.builder} /> {listing.builder.name}
      </div>
      <div className="mt-3"><Sparkline data={listing.equity} positive={m.netProfit >= 0} /></div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[["Net profit", money(m.netProfit), m.netProfit >= 0 ? "text-profit" : "text-loss"], ["Max DD", `${m.drawdown}%`, "text-loss"], ["Win rate", `${m.winRate}%`, ""]].map(([l, v, c]) => (
          <div key={l} className="rounded bg-muted px-1 py-1.5">
            <div className="text-[10px] text-muted-foreground">{l}</div>
            <div className={cn("font-mono text-xs font-semibold", c)}>{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="secondary">{listing.symbol}</Badge>
        <Badge variant="secondary">{listing.timeframe}</Badge>
        <Badge variant="outline">{listing.style}</Badge>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Tested on: {listing.broker}</p>
      <div className="mt-auto flex items-center justify-between pt-3">
        <Stars rating={listing.rating} count={listing.reviewCount} />
        {preview ? <Button size="sm" variant="outline" disabled>View</Button> : (
          <Button size="sm" variant="outline" asChild><Link to="/marketplace/$id" params={{ id: listing.id }}>View</Link></Button>
        )}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ n = 6 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => <Skeleton key={i} className="h-80 rounded-lg" />)}
    </div>
  );
}

export const PLATFORM_RECORDED_TIP = "Results come from a backtest run in the builder's workspace. They are historical simulations and do not guarantee future performance.";
export function PlatformRecorded() {
  return (
    <TooltipProvider delayDuration={150}>
      <UiTooltip>
        <TooltipTrigger asChild><span tabIndex={0} className="inline-flex cursor-help items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] text-muted-foreground"><Info className="h-3 w-3" /> Platform-recorded</span></TooltipTrigger>
        <TooltipContent className="max-w-xs">{PLATFORM_RECORDED_TIP}</TooltipContent>
      </UiTooltip>
    </TooltipProvider>
  );
}
