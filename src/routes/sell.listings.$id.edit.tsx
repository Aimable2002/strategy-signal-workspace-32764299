import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState, Page } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/sell/listings/$id/edit")({
  head: () => meta("Edit listing · Tickforge", "Edit a marketplace listing or publish a new version."),
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const [f, setF] = useState<{ title: string; description: string; price: number; tags: string } | null>(null);
  const [current, setCurrent] = useState("v3");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [versions, setVersions] = useState<string[]>([]);
  const [nv, setNv] = useState({ version: "", changelog: "" });
  const [vBusy, setVBusy] = useState(false);
  const [vMsg, setVMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api.getListing(id).then((l) => { setF({ title: l.title, description: l.description, price: l.price, tags: `${l.style}, ${l.symbol}` }); setCurrent(l.versions[0]!.version); }).catch((e) => setError(e.message));
    api.getWorkspaceStrategiesForPublish().then((s) => setVersions(["v4", "v5", ...s[0]!.versions].filter((v, i, a) => a.indexOf(v) === i)));
  }, [id]);

  if (error) return <Page title="Edit listing"><ErrorState message={error} /></Page>;
  if (!f) return <Page title="Edit listing"><Skeleton className="h-96" /></Page>;

  const save = async () => {
    setBusy(true); setMsg(null);
    try { await api.updateListing(id, f); setMsg({ ok: true, text: "Changes saved" }); } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    setBusy(false);
  };
  const publish = async () => {
    setVBusy(true); setVMsg(null);
    try { await api.publishNewVersion(id, nv); setVMsg({ ok: true, text: `${nv.version} submitted for review` }); setNv({ version: "", changelog: "" }); } catch (e) { setVMsg({ ok: false, text: (e as Error).message }); }
    setVBusy(false);
  };

  return (
    <Page title="Edit listing" actions={<Button variant="outline" asChild><Link to="/sell/listings/$id/analytics" params={{ id }}>View analytics</Link></Button>}>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Listing details</h2>
          <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea rows={5} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label className="text-xs">Price ($)</Label><Input type="number" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} /></div>
            <div className="space-y-1"><Label className="text-xs">Tags</Label><Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-3"><Button onClick={save} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Save changes</Button>{msg && <span className={msg.ok ? "flex items-center gap-1 text-sm text-profit" : "text-sm text-loss"}>{msg.ok && <CheckCircle2 className="h-4 w-4" />}{msg.text}</span>}</div>
        </section>
        <section className="space-y-3 rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Publish new version</h2>
          <p className="text-xs text-muted-foreground">Current live version: <span className="font-mono">{current}</span></p>
          <div className="space-y-1"><Label className="text-xs">Workspace version</Label><Select value={nv.version} onValueChange={(version) => setNv({ ...nv, version })}><SelectTrigger><SelectValue placeholder="Pick a version" /></SelectTrigger><SelectContent>{versions.filter((v) => v !== current).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-xs">Changelog</Label><Textarea rows={4} placeholder="What changed in this version?" value={nv.changelog} onChange={(e) => setNv({ ...nv, changelog: e.target.value })} /></div>
          <p className="flex gap-1.5 text-xs text-muted-foreground"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />New versions go through review. Existing buyers receive the update after approval.</p>
          <div className="flex items-center gap-3"><Button onClick={publish} disabled={vBusy || !nv.version}>{vBusy && <Loader2 className="h-4 w-4 animate-spin" />} Submit version for review</Button>{vMsg && <span className={vMsg.ok ? "text-sm text-warning" : "text-sm text-loss"}>{vMsg.text}</span>}</div>
        </section>
      </div>
    </Page>
  );
}
