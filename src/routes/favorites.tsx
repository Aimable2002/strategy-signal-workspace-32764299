import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton, EmptyState, ErrorState, ListingCard, Page, type ListingWithBuilder } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/favorites")({
  head: () => meta("Favorites · Tickforge", "Strategies you've saved."),
  component: Favorites,
});

function Favorites() {
  const [items, setItems] = useState<ListingWithBuilder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getFavorites().then(setItems).catch((e) => setError(e.message)); }, []);
  return (
    <Page title="Favorites">
      {error ? <ErrorState message={error} /> : !items ? <CardGridSkeleton n={3} /> : items.length === 0 ? <EmptyState title="No favorites yet" body="Tap the heart on any strategy to save it here." action={<Button size="sm" asChild><Link to="/marketplace">Browse marketplace</Link></Button>} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((l) => <ListingCard key={l.id} listing={l} />)}</div>
      )}
    </Page>
  );
}
