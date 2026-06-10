"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

interface NavbarProps {
  items: NavItem[];
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

export function Navbar({ items, userName, userRole, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gold/10 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-gold">
          Aurea Maison
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-gold"
                  : "text-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden text-sm text-muted sm:inline">
              {userName}
              {userRole && (
                <span className="ml-1 text-xs text-gold/60">({userRole})</span>
              )}
            </span>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="hidden rounded-md border border-gold/20 px-3 py-1.5 text-xs font-medium text-gold/70 transition-colors hover:border-gold/50 hover:text-gold md:block"
            >
              Uitloggen
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-muted transition-colors hover:bg-gold/10 hover:text-foreground md:hidden"
            aria-label="Menu"
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gold/10 bg-background px-4 py-3 md:hidden">
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-gold/10 text-gold"
                    : "text-muted hover:bg-gold/5 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            {onLogout && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onLogout();
                }}
                className="mt-2 w-full rounded-md border border-gold/20 px-3 py-2 text-left text-xs font-medium text-gold/70 transition-colors hover:border-gold/50 hover:text-gold"
              >
                Uitloggen
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
