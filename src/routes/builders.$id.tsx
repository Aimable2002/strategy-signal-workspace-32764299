import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BuilderAvatar, CardGridSkeleton, EmptyState, ErrorState, ListingCard, Page, Stars } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";
import { WhatsAppContact } from "@/components/market/extras";

export const Route = createFileRoute("/builders/$id")({
  head: () => meta("Builder profile · Tickforge Marketplace", "Strategies, sales and ratings from this strategy builder."),
  component: Profile,
});

function Profile() {
  const { id } = Route.useParams();
  const [b, setB] = useState<Awaited<ReturnType<typeof api.getBuilderProfile>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = () => { setError(null); setB(null); api.getBuilderProfile(id).then(setB).catch((e) => setError(e.message)); };
  useEffect(load, [id]);

  if (error) return <Page title="Builder"><ErrorState message={error} onRetry={load} /></Page>;
  if (!b) return <main className="mx-auto max-w-7xl space-y-6 px-6 py-6"><Skeleton className="h-28" /><CardGridSkeleton n={3} /></main>;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-5 rounded-lg border bg-card p-5">
        <BuilderAvatar builder={b} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold">{b.name}</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{b.bio}</p>
          <div className="mt-3 max-w-sm"><WhatsAppContact builderId={b.id} /></div>
        </div>
        <dl className="grid grid-cols-3 gap-6 text-sm">
          <div><dt className="text-xs text-muted-foreground">Member since</dt><dd className="font-mono">{b.memberSince}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Total sales</dt><dd className="font-mono">{b.totalSales}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Avg rating</dt><dd><Stars rating={b.rating} /></dd></div>
        </dl>
      </div>
      <h2 className="mb-3 mt-8 font-semibold">Strategies</h2>
      {b.listings.length === 0 ? <EmptyState title="No live strategies yet" /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{b.listings.map((l) => <ListingCard key={l.id} listing={l} />)}</div>
      )}
    </main>
  );
}
