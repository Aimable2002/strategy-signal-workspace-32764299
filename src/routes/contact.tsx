import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Page } from "@/components/market/shared";
import * as api from "@/services/api";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/contact")({
  head: () => meta("Contact support · Tickforge", "Send a question to the Tickforge support team."),
  component: Contact,
});

function Contact() {
  const [f, setF] = useState({ topic: "", message: "" });
  const [ticket, setTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => { setError(null); try { setTicket((await api.submitSupportRequest(f)).ticket); } catch (e) { setError((e as Error).message); } };
  if (ticket) return <Page title="Message sent"><p className="text-sm text-muted-foreground">Ticket {ticket}. We'll reply by email within 1–2 business days.</p></Page>;
  return (
    <Page title="Contact support">
      <div className="max-w-lg space-y-3 rounded-lg border bg-card p-5">
        <div className="space-y-1"><Label>Topic</Label><Input value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} /></div>
        <div className="space-y-1"><Label>Message</Label><Textarea rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
        <div className="space-y-1"><Label>Attachment (optional)</Label><Input type="file" /></div>
        {error && <p className="text-sm text-loss">{error}</p>}
        <Button onClick={submit}>Send</Button>
      </div>
    </Page>
  );
}
