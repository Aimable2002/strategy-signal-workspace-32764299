import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { BacktestNote, CardGridSkeleton, EmptyState, ErrorState, ListingCard, Page, type ListingWithBuilder } from "@/components/market/shared";
import * as api from "@/services/api";
import { BROKERS, STYLES, SYMBOLS, TIMEFRAMES } from "@/mockData";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/marketplace/")({
  head: () => meta("Strategy marketplace · Tickforge", "Browse MT5 trading strategies, test them on your own settings, and buy the ones that hold up."),
  component: Marketplace,
});

const ALL = "all";

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-full sm:w-36" aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function Marketplace() {
  const [q, setQ] = useState("");
  const [symbol, setSymbol] = useState(ALL);
  const [timeframe, setTimeframe] = useState(ALL);
  const [style, setStyle] = useState(ALL);
  const [broker, setBroker] = useState(ALL);
  const [maxPrice, setMaxPrice] = useState(250);
  const [sort, setSort] = useState<api.SortKey>("newest");
  const [data, setData] = useState<ListingWithBuilder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;
    setData(null); setError(null);
    const f = (v: string) => (v === ALL ? undefined : v);
    const t = setTimeout(() => {
      api.getListings({ q, symbol: f(symbol), timeframe: f(timeframe), style: f(style), broker: f(broker), maxPrice, sort })
        .then((d) => live && setData(d)).catch((e) => live && setError(e.message));
    }, 200);
    return () => { live = false; clearTimeout(t); };
  }, [q, symbol, timeframe, style, broker, maxPrice, sort, nonce]);

  const reset = () => { setQ(""); setSymbol(ALL); setTimeframe(ALL); setStyle(ALL); setBroker(ALL); setMaxPrice(250); };

  return (
    <Page title="Marketplace" subtitle={<BacktestNote />}>
      <div className="mb-5 space-y-3 rounded-lg border bg-panel p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search strategies" className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Symbols" value={symbol} onChange={setSymbol} options={SYMBOLS} />
          <FilterSelect label="Timeframes" value={timeframe} onChange={setTimeframe} options={TIMEFRAMES} />
          <FilterSelect label="Styles" value={style} onChange={setStyle} options={STYLES} />
          <FilterSelect label="Brokers" value={broker} onChange={setBroker} options={BROKERS} />
          <div className="flex w-full items-center gap-3 sm:w-56">
            <span className="whitespace-nowrap text-xs text-muted-foreground">Up to ${maxPrice}</span>
            <Slider min={25} max={250} step={5} value={[maxPrice]} onValueChange={([v]) => setMaxPrice(v!)} />
          </div>
          <div className="ml-auto">
            <Select value={sort} onValueChange={(v) => setSort(v as api.SortKey)}>
              <SelectTrigger className="h-9 w-44" aria-label="Sort"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="purchased">Most purchased</SelectItem>
                <SelectItem value="rating">Highest rated</SelectItem>
                <SelectItem value="drawdown">Lowest drawdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {error ? <ErrorState message={error} onRetry={() => setNonce((n) => n + 1)} /> : !data ? <CardGridSkeleton /> : data.length === 0 ? (
        <EmptyState title="No strategies match your filters" body="Try a different symbol or raise the price limit." action={<Button size="sm" variant="outline" onClick={reset}>Clear filters</Button>} />
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground">{data.length} strategies</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.map((l) => <ListingCard key={l.id} listing={l} />)}</div>
        </>
      )}
    </Page>
  );
}
