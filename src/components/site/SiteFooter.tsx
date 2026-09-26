import { Link } from "@tanstack/react-router";
import { QrCode } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <QrCode className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight">Cytic Link</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            One professional page and one QR code for your work — free, with no limits.
          </p>
        </div>

        <div>
          <h2 className="eyebrow">Product</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/templates" className="text-muted-foreground hover:text-foreground">
                Templates
              </Link>
            </li>
            <li>
              <Link to="/features" className="text-muted-foreground hover:text-foreground">
                Features
              </Link>
            </li>
            <li>
              <Link to="/qr-codes" className="text-muted-foreground hover:text-foreground">
                QR codes
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">Company</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">Get started</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Everything on Cytic Link is free. No card, no trial, no upgrade screens.
          </p>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Create your page
          </Link>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Cytic Link. All rights reserved.
      </div>
    </footer>
  );
}
