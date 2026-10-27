import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, Page } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/help/")({
  head: () => meta("Help center · Tickforge", "Guides for workspaces, backtesting, buying, selling and credits."),
  component: Help,
});

function Help() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [d, setD] = useState<Awaited<ReturnType<typeof api.getHelpArticles>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = () => { setError(null); api.getHelpArticles(q).then(setD).catch((e) => setError((e as Error).message)); };
  useEffect(load, [q]);
  const active = d?.categories.find((c) => c.slug === cat);
  const articles = d?.articles.filter((a) => !cat || a.category === cat) ?? [];

  return (
    <Page title="Help center">
      <Input placeholder="Search help articles" aria-label="Search help articles" value={q} onChange={(e) => setQ(e.target.value)} className="mb-6 max-w-lg" />
      {error ? <ErrorState message={error} onRetry={load} /> : !d ? <Skeleton className="h-48" /> : (<>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {d.categories.map((c) => (
            <button key={c.slug} onClick={() => setCat(cat === c.slug ? null : c.slug)} aria-pressed={cat === c.slug}
              className={cn("rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/50", cat === c.slug && "border-primary bg-primary/5")}>
              <div className="font-semibold">{c.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
            </button>
          ))}
        </div>
        <div className="mb-3 mt-8 flex items-center gap-2">
          <h2 className="font-semibold">Articles</h2>
          {active && <button onClick={() => setCat(null)} className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs hover:bg-accent" aria-label={`Clear filter ${active.title}`}>{active.title}<X className="h-3 w-3" /></button>}
        </div>
        {articles.length === 0 ? <EmptyState title="No articles match" body="Try a different search or clear the category filter." /> : (
          <div className="divide-y rounded-lg border">
            {articles.map((a) => (
              <Link key={a.slug} to="/help/$slug" params={{ slug: a.slug }} className="block p-4 hover:bg-accent/50">
                <div className="text-sm font-medium">{a.title}</div>
                <p className="text-sm text-muted-foreground">{a.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </>)}
    </Page>
  );
}
