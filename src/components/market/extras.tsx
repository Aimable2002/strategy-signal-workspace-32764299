import { useEffect, useState } from "react";
import { Flag, Heart, Loader2, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/services/api";
import { useDevState } from "@/lib/devState";
import { cn } from "@/lib/utils";

export function FavoriteButton({ listingId, className }: { listingId: string; className?: string }) {
  const [fav, setFav] = useState(false);
  useEffect(() => setFav(api.isFavoriteSync(listingId)), [listingId]);
  return (
    <button
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={fav}
      onClick={async (e) => { e.preventDefault(); setFav(!fav); setFav(await api.toggleFavorite(listingId)); }}
      className={cn("rounded p-1 text-muted-foreground transition-colors hover:text-loss", fav && "text-loss", className)}
    >
      <Heart className={cn("h-4 w-4", fav && "fill-current")} />
    </button>
  );
}

export function WhatsAppContact({ builderId, title }: { builderId: string; title?: string }) {
  const dev = useDevState();
  const [s, setS] = useState<{ number: string; enabled: boolean } | null>(null);
  useEffect(() => { api.getWhatsAppSettings(builderId).then(setS); }, [builderId]);
  if (!dev.loggedIn || !s?.enabled || !s.number) return null;
  return (
    <div className="space-y-1.5">
      <Button variant="outline" size="sm" className="w-full" asChild>
        <a href={api.whatsAppLink(s.number, title)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> Contact builder on WhatsApp</a>
      </Button>
      <p className="text-[11px] leading-snug text-muted-foreground">Chats happen on WhatsApp, outside this platform. Do not pay or share files outside the platform. We cannot help with disputes about off-platform conversations.</p>
    </div>
  );
}

const REPORT_REASONS = ["Misleading claims", "Suspicious results", "Copyright", "Other"];

export function ReportDialog({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    setBusy(true); setError(null);
    try { await api.reportListing(listingId, { reason, details }); setDone(true); } catch (e) { setError((e as Error).message); }
    setBusy(false);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setDone(false); setReason(""); setDetails(""); } }}>
      <DialogTrigger asChild><Button variant="ghost" size="sm" className="text-muted-foreground"><Flag className="h-3.5 w-3.5" /> Report listing</Button></DialogTrigger>
      <DialogContent>
        {done ? (
          <>
            <DialogHeader><DialogTitle>Thanks for your report</DialogTitle><DialogDescription>Our team will review this listing. We may contact you if we need more details.</DialogDescription></DialogHeader>
            <DialogFooter><Button onClick={() => setOpen(false)}>Close</Button></DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader><DialogTitle>Report this listing</DialogTitle></DialogHeader>
            <div className="space-y-1"><Label className="text-xs">Reason</Label>
              <Select value={reason} onValueChange={setReason}><SelectTrigger><SelectValue placeholder="Choose a reason" /></SelectTrigger><SelectContent>{REPORT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Details</Label><Textarea rows={4} value={details} onChange={(e) => setDetails(e.target.value)} /></div>
            {error && <p className="text-sm text-loss">{error}</p>}
            <DialogFooter><Button onClick={submit} disabled={busy || !reason}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit report</Button></DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} role="radio" aria-checked={value === n} aria-label={`${n} stars`} onClick={() => onChange(n)}>
          <Star className={cn("h-6 w-6", n <= value ? "fill-warning text-warning" : "text-muted-foreground")} />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ listingId }: { listingId: string }) {
  const [purchased, setPurchased] = useState(false);
  const [mine, setMine] = useState<{ rating: number; comment: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.hasPurchased(listingId).then(setPurchased); api.getMyReview(listingId).then(setMine); }, [listingId]);

  const save = async (d: { rating: number; comment: string } | null) => {
    setBusy(true); setError(null);
    try { setMine(await api.submitReview(listingId, d)); setOpen(false); } catch (e) { setError((e as Error).message); }
    setBusy(false);
  };
  if (!purchased) return <p className="text-xs text-muted-foreground">Only verified buyers can write a review.</p>;
  return (
    <div className="space-y-3">
      {mine && (
        <div className="rounded-md border border-primary/30 bg-card p-3">
          <div className="flex items-center gap-2 text-sm"><span className="font-medium">Your review</span><span className="flex">{Array.from({ length: mine.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}</span>
            <Button size="sm" variant="ghost" className="ml-auto h-7" onClick={() => { setRating(mine.rating); setComment(mine.comment); setOpen(true); }}>Edit</Button>
            <Button size="sm" variant="ghost" className="h-7 text-loss" disabled={busy} onClick={() => save(null)}>Delete</Button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{mine.comment}</p>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        {!mine && <DialogTrigger asChild><Button size="sm" variant="outline" onClick={() => { setRating(0); setComment(""); }}>Write a review</Button></DialogTrigger>}
        <DialogContent>
          <DialogHeader><DialogTitle>{mine ? "Edit your review" : "Write a review"}</DialogTitle><DialogDescription>Shown with a "Verified purchase" badge.</DialogDescription></DialogHeader>
          <StarPicker value={rating} onChange={setRating} />
          <Textarea rows={4} placeholder="How did it perform in your own tests?" value={comment} onChange={(e) => setComment(e.target.value)} />
          {error && <p className="text-sm text-loss">{error}</p>}
          <DialogFooter><Button disabled={busy || rating === 0 || comment.trim().length < 3} onClick={() => save({ rating, comment })}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Save review</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
