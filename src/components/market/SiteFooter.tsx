import { Link, useLocation } from "@tanstack/react-router";

export function SiteFooter() {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname === "/maintenance") return null;
  return (
    <footer className="mt-auto border-t bg-sidebar">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 text-sm sm:grid-cols-4">
        <div>
          <div className="font-semibold">Tickforge</div>
          <p className="mt-2 text-xs text-muted-foreground">No real trades. Backtests are historical simulations.</p>
        </div>
        <div className="space-y-1.5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Product</div>
          <Link to="/marketplace" className="block hover:text-primary">Marketplace</Link>
          <Link to="/pricing" className="block hover:text-primary">Pricing</Link>
          <Link to="/welcome" className="block hover:text-primary">About</Link>
        </div>
        <div className="space-y-1.5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Help</div>
          <Link to="/help" className="block hover:text-primary">Help center</Link>
          <Link to="/contact" className="block hover:text-primary">Contact support</Link>
        </div>
        <div className="space-y-1.5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Legal</div>
          <Link to="/legal/$doc" params={{ doc: "terms" }} className="block hover:text-primary">Terms of Service</Link>
          <Link to="/legal/$doc" params={{ doc: "privacy" }} className="block hover:text-primary">Privacy Policy</Link>
          <Link to="/legal/$doc" params={{ doc: "risk" }} className="block hover:text-primary">Risk Disclosure</Link>
          <Link to="/legal/$doc" params={{ doc: "refund" }} className="block hover:text-primary">Refund Policy</Link>
          <Link to="/legal/$doc" params={{ doc: "builder-agreement" }} className="block hover:text-primary">Builder Agreement</Link>
        </div>
      </div>
    </footer>
  );
}
