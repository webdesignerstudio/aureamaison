"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

interface NavbarProps {
  items: NavItem[];
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export function Navbar({ items, userName, userRole, onLogout }: NavbarProps) {
  const pathname = usePathname();

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
              className="rounded-md border border-gold/20 px-3 py-1.5 text-xs font-medium text-gold/70 transition-colors hover:border-gold/50 hover:text-gold"
            >
              Uitloggen
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
