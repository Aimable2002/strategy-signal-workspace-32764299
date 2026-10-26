import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { EmptyState, Page } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/legal/$doc")({
  head: () => meta("Legal · Tickforge", "Terms, privacy, risk disclosure, refund policy and builder agreement."),
  component: Legal,
});

function Legal() {
  const { doc } = Route.useParams();
  const d = api.getLegalDoc(doc);
  if (!d) return <Page title="Not found"><EmptyState title="This document doesn't exist" /></Page>;
  return (
    <Page title={d.title}>
      <div className="mb-6 flex items-center gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm text-warning"><AlertTriangle className="h-4 w-4" />Draft text. To be reviewed by a lawyer before launch.</div>
      <div className="max-w-3xl space-y-5">{d.sections.map((s) => <section key={s.h}><h2 className="font-semibold">{s.h}</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.p}</p></section>)}</div>
    </Page>
  );
}
