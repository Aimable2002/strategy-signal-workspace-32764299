import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, Page } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/help/")({
  head: () => meta("Help center · Tickforge", "Guides for workspaces, backtesting, buying, selling and credits."),
  component: Help,
});

function Help() {
  const [q, setQ] = useState("");
  const [d, setD] = useState<Awaited<ReturnType<typeof api.getHelpArticles>> | null>(null);
  useEffect(() => { api.getHelpArticles(q).then(setD); }, [q]);
  return (
    <Page title="Help center">
      <Input placeholder="Search help articles" value={q} onChange={(e) => setQ(e.target.value)} className="mb-6 max-w-lg" />
      {!d ? <Skeleton className="h-48" /> : (<>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{d.categories.map((c) => <div key={c.slug} className="rounded-lg border bg-card p-4"><div className="font-semibold">{c.title}</div><p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p></div>)}</div>
        <h2 className="mb-3 mt-8 font-semibold">Articles</h2>
        {d.articles.length === 0 ? <EmptyState title="No articles match your search" /> : <div className="divide-y rounded-lg border">{d.articles.map((a) => <div key={a.slug} className="p-4"><div className="text-sm font-medium">{a.title}</div><p className="text-sm text-muted-foreground">{a.summary}</p></div>)}</div>}
      </>)}
    </Page>
  );
}
