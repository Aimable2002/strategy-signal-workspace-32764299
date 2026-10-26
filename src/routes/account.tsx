import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Monitor, Smartphone } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Page } from "@/components/market/shared";
import * as api from "@/services/api";
import { myBuilderId } from "@/mockData";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/account")({
  head: () => meta("Account settings · Tickforge", "Profile, WhatsApp contact, security, notifications and account deletion."),
  component: Account,
});

function Saved({ show }: { show: boolean }) {
  return show ? <span className="flex items-center gap-1 text-sm text-profit"><CheckCircle2 className="h-4 w-4" /> Saved</span> : null;
}

function Account() {
  const [profile, setProfile] = useState({ name: "Jamie Doe", bio: "Building trend systems on majors.", publicProfile: true });
  const [savedProfile, setSavedProfile] = useState(false);
  const [wa, setWa] = useState<{ number: string; enabled: boolean } | null>(null);
  const [waBusy, setWaBusy] = useState(false);
  const [waMsg, setWaMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [notif, setNotif] = useState({ emailSales: true, emailReviews: true, emailCredits: true, appAll: true, appMarketing: false });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  useEffect(() => { api.getWhatsAppSettings(myBuilderId).then(setWa); }, []);

  const saveWa = async () => {
    if (!wa) return;
    setWaBusy(true); setWaMsg(null);
    try { setWa(await api.saveWhatsAppSettings(myBuilderId, wa)); setWaMsg({ ok: true, text: "Saved" }); } catch (e) { setWaMsg({ ok: false, text: (e as Error).message }); }
    setWaBusy(false);
  };

  if (deleted) return <Page title="Account deleted"><p className="text-sm text-muted-foreground">Your account has been scheduled for deletion. (Demo only, nothing was removed.)</p></Page>;

  return (
    <Page title="Account settings">
      <Tabs defaultValue="profile">
        <TabsList className="h-auto flex-wrap justify-start">
          {["profile", "whatsapp", "security", "notifications", "danger"].map((t) => <TabsTrigger key={t} value={t}>{{ profile: "Profile", whatsapp: "WhatsApp contact", security: "Security", notifications: "Notifications", danger: "Danger zone" }[t]}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="profile" className="mt-4 max-w-xl space-y-4 rounded-lg border bg-card p-5">
          <div className="flex items-center gap-4"><Avatar className="h-16 w-16"><AvatarFallback className="bg-secondary text-lg">JD</AvatarFallback></Avatar><Button variant="outline" size="sm" asChild><label className="cursor-pointer">Change avatar<input type="file" accept="image/*" className="hidden" /></label></Button></div>
          <div className="space-y-1"><Label>Name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
          <div className="space-y-1"><Label>Bio</Label><Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></div>
          <label className="flex items-center justify-between gap-3 text-sm"><span>Public builder profile<span className="block text-xs text-muted-foreground">Show your profile and listings to buyers.</span></span><Switch checked={profile.publicProfile} onCheckedChange={(v) => setProfile({ ...profile, publicProfile: v })} /></label>
          <div className="flex items-center gap-3"><Button onClick={() => { setSavedProfile(true); setTimeout(() => setSavedProfile(false), 2000); }} disabled={!profile.name.trim()}>Save profile</Button><Saved show={savedProfile} /></div>
        </TabsContent>
        <TabsContent value="whatsapp" className="mt-4 max-w-xl space-y-4 rounded-lg border bg-card p-5">
          {!wa ? <Skeleton className="h-32" /> : (<>
            <p className="text-sm text-muted-foreground">Optional. There is no in-app chat; buyers can reach you on WhatsApp instead.</p>
            <div className="space-y-1"><Label>WhatsApp number (with country code)</Label><Input placeholder="+44 7700 900123" value={wa.number} onChange={(e) => setWa({ ...wa, number: e.target.value })} /></div>
            <label className="flex items-center justify-between gap-3 text-sm">Show a WhatsApp contact button on my listings and profile<Switch checked={wa.enabled} onCheckedChange={(v) => setWa({ ...wa, enabled: v })} /></label>
            <div className="flex gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-xs text-warning"><AlertTriangle className="h-4 w-4 shrink-0" />Buyers who click will see your WhatsApp number. Only share a number you are comfortable using.</div>
            <div className="flex items-center gap-3"><Button onClick={saveWa} disabled={waBusy}>{waBusy && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>{waMsg && <span className={waMsg.ok ? "text-sm text-profit" : "text-sm text-loss"}>{waMsg.text}</span>}</div>
          </>)}
        </TabsContent>
        <TabsContent value="security" className="mt-4 max-w-xl space-y-6">
          <div className="space-y-3 rounded-lg border bg-card p-5">
            <h2 className="font-semibold">Change password</h2>
            <div className="space-y-1"><Label>Current password</Label><Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
            <div className="space-y-1"><Label>New password</Label><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
            <div className="flex items-center gap-3"><Button disabled={!pw.current || !pw.next} onClick={() => setPwMsg(pw.next.length < 8 ? "Password must be at least 8 characters" : "Password updated")}>Update password</Button>{pwMsg && <span className="text-sm text-muted-foreground">{pwMsg}</span>}</div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-3 font-semibold">Active sessions</h2>
            {[{ icon: Monitor, d: "Chrome on macOS · London", t: "This device" }, { icon: Smartphone, d: "Safari on iPhone · London", t: "2 days ago" }].map((s) => (
              <div key={s.d} className="flex items-center gap-3 border-t py-2.5 text-sm first:border-0"><s.icon className="h-4 w-4 text-muted-foreground" /><span className="flex-1">{s.d}<span className="block text-xs text-muted-foreground">{s.t}</span></span>{s.t !== "This device" && <Button size="sm" variant="ghost">Sign out</Button>}</div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="notifications" className="mt-4 max-w-xl space-y-3 rounded-lg border bg-card p-5">
          {([["emailSales", "Email: sales and payouts"], ["emailReviews", "Email: reviews and reports"], ["emailCredits", "Email: low balance and workspace stops"], ["appAll", "In-app: all activity"], ["appMarketing", "In-app: product news"]] as const).map(([k, l]) => (
            <label key={k} className="flex items-center justify-between text-sm">{l}<Switch checked={notif[k]} onCheckedChange={(v) => setNotif({ ...notif, [k]: v })} /></label>
          ))}
        </TabsContent>
        <TabsContent value="danger" className="mt-4 max-w-xl rounded-lg border border-loss/40 bg-loss/5 p-5">
          <h2 className="font-semibold text-loss">Delete account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Removes your workspaces, files, listings and purchases. Unused credits can be refunded first. This cannot be undone.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline" className="mt-4 border-loss/50 text-loss">Delete my account</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete your account?</AlertDialogTitle><AlertDialogDescription>Type DELETE to confirm.</AlertDialogDescription></AlertDialogHeader>
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={confirmText !== "DELETE"} onClick={() => setDeleted(true)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete account</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </Page>
  );
}
