import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, Page } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/help/$slug")({
  head: () => meta("Help article · Tickforge", "Guides for workspaces, backtesting, buying, selling and credits."),
  component: Article,
});

type Data = Awaited<ReturnType<typeof api.getHelpArticle>>;

function Article() {
  const { slug } = Route.useParams();
  const [d, setD] = useState<Data | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const load = () => { setError(null); setD(undefined); setVote(null); api.getHelpArticle(slug).then(setD).catch((e) => setError((e as Error).message)); };
  useEffect(load, [slug]);

  if (error) return <Page title="Help"><ErrorState message={error} onRetry={load} /></Page>;
  if (d === undefined) return <Page title="Help"><Skeleton className="h-64 max-w-2xl" /></Page>;
  if (d === null) return (
    <Page title="Article not found">
      <EmptyState title="We couldn't find that article" body="It may have moved or the link is wrong. Search the help center instead." action={<Button asChild size="sm"><Link to="/help">Back to help center</Link></Button>} />
    </Page>
  );
  const { article, category, related } = d;

  return (
    <Page title={article.title} subtitle={article.summary}>
      <nav aria-label="Breadcrumb" className="-mt-4 mb-6 text-xs text-muted-foreground">
        <Link to="/help" className="hover:text-foreground hover:underline">Help</Link>
        {category && <> / <span>{category.title}</span></>} / <span className="text-foreground">{article.title}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,42rem)_1fr]">
        <article className="space-y-6">
          {article.body.map((s) => (
            <section key={s.h}>
              <h2 className="text-base font-semibold">{s.h}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
            </section>
          ))}
          <div className="flex flex-wrap items-center gap-3 border-t pt-5 text-sm">
            {vote ? <p className="text-muted-foreground">{vote === "yes" ? "Thanks. Glad it helped." : "Thanks for telling us. Contact support if you're still stuck."}</p> : (<>
              <span>Was this helpful?</span>
              <Button size="sm" variant="outline" onClick={() => setVote("yes")}><ThumbsUp className="h-3.5 w-3.5" /> Yes</Button>
              <Button size="sm" variant="outline" onClick={() => setVote("no")}><ThumbsDown className="h-3.5 w-3.5" /> No</Button>
            </>)}
          </div>
          <p className="text-sm text-muted-foreground">Still need help? <Link to="/contact" className="text-primary underline">Contact support</Link>.</p>
        </article>
        {related.length > 0 && (
          <aside>
            <h2 className="mb-2 text-sm font-semibold">Related articles</h2>
            <ul className="divide-y rounded-lg border">
              {related.map((r) => (
                <li key={r.slug}><Link to="/help/$slug" params={{ slug: r.slug }} className="block p-3 hover:bg-accent/50"><div className="text-sm font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{r.summary}</div></Link></li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </Page>
  );
}
