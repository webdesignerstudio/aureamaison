"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { C } from "@/lib/landing/colors";
import { useMobile } from "@/hooks/use-mobile";

export type NavTab = { href: string; icon: string; label: string; badge?: number };
export type NavCat = { id: string; icon: string; label: string; tabs: NavTab[] };

interface SidebarShellProps {
  cats: NavCat[];
  logoSubtitle: string;
  userName: string;
  /** Optional mini-stats block rendered under the logo (owner). */
  statsSlot?: React.ReactNode;
  /** Optional element rendered next to "Uitloggen" (e.g. SettingsGear). */
  settingsSlot?: React.ReactNode;
  /** When true, render a flat nav (no category accordion) — used by client/legger portals. */
  flat?: boolean;
  onLogout: () => void;
  children: React.ReactNode;
}

/** Returns the href of the tab that best matches the current pathname. */
function bestMatch(cats: NavCat[], pathname: string): string | null {
  let best: string | null = null;
  for (const cat of cats) {
    for (const t of cat.tabs) {
      const exact = pathname === t.href;
      const nested = pathname.startsWith(t.href + "/");
      if (exact || nested) {
        if (best === null || t.href.length > best.length) best = t.href;
      }
    }
  }
  return best;
}

export function SidebarShell({
  cats,
  logoSubtitle,
  userName,
  statsSlot,
  settingsSlot,
  flat = false,
  onLogout,
  children,
}: SidebarShellProps) {
  const mobile = useMobile();
  const router = useRouter();
  const pathname = usePathname() || "";
  const activeHref = bestMatch(cats, pathname);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openCats, setOpenCats] = useState<string[]>(cats.map((c) => c.id));
  const toggleCat = (id: string) =>
    setOpenCats((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const catBadge = (cat: NavCat) => cat.tabs.reduce((s, t) => s + (t.badge || 0), 0);

  const go = (href: string, onNav?: () => void) => {
    router.push(href);
    onNav?.();
  };

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo + status */}
      <div style={{ padding: "24px 20px 18px", borderBottom: `1px solid ${C.bdr}`, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.05rem", fontWeight: 500, letterSpacing: 4, color: C.gold, marginBottom: 2 }}>AUREA MAISON</div>
        <div style={{ fontSize: "0.44rem", letterSpacing: 3, color: "rgba(198,165,107,.4)", textTransform: "uppercase", marginBottom: 12 }}>{logoSubtitle}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          <span style={{ fontSize: "0.56rem", color: C.green, letterSpacing: 1 }}>Online</span>
        </div>
      </div>

      {/* Mini stats (optional) */}
      {statsSlot && (
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.bdr}`, flexShrink: 0 }}>{statsSlot}</div>
      )}

      {/* Flat nav (client/legger) */}
      {flat ? (
        <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px", scrollbarWidth: "none" }}>
          {cats.flatMap((cat) => cat.tabs).map((t) => {
            const active = t.href === activeHref;
            return (
              <button
                key={t.href}
                onClick={() => go(t.href)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "11px 14px", background: active ? "rgba(198,165,107,.08)" : "transparent", border: active ? `1px solid rgba(198,165,107,.2)` : "1px solid transparent", color: active ? C.gold : C.muted, cursor: "pointer", borderRadius: 6, fontSize: "0.7rem", letterSpacing: 1, textAlign: "left", marginBottom: 3, transition: "all .2s" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>{t.label}
                </span>
                {(t.badge || 0) > 0 && <span style={{ fontSize: "0.5rem", background: "rgba(224,90,90,.25)", color: C.red, padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>{t.badge}</span>}
              </button>
            );
          })}
        </nav>
      ) : (
      /* Accordion nav */
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 10px 0", scrollbarWidth: "none" }}>
        {cats.map((cat) => {
          const isOpen = openCats.includes(cat.id);
          const badge = catBadge(cat);
          const hasActive = cat.tabs.some((t) => t.href === activeHref);
          return (
            <div key={cat.id} style={{ marginBottom: 2 }}>
              <button
                onClick={() => toggleCat(cat.id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "9px 10px", background: hasActive ? "rgba(198,165,107,.06)" : "transparent", border: "none", cursor: "pointer", borderRadius: 7, transition: "background .15s" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.66rem", color: hasActive ? C.gold : C.muted, fontWeight: hasActive ? 600 : 400, letterSpacing: 0.5 }}>
                  <span style={{ fontSize: "0.9rem" }}>{cat.icon}</span>
                  {cat.label}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {badge > 0 && <span style={{ fontSize: "0.5rem", background: "rgba(224,90,90,.25)", color: C.red, padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>{badge}</span>}
                  <span style={{ fontSize: "0.5rem", color: C.dim, transition: "transform .2s", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none" }}>›</span>
                </span>
              </button>

              {isOpen && (
                <div style={{ paddingLeft: 12, paddingBottom: 4, animation: "slideUp .15s ease both" }}>
                  {cat.tabs.map((t) => {
                    const active = t.href === activeHref;
                    return (
                      <button
                        key={t.href}
                        onClick={() => go(t.href, onNav)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 10px", background: active ? "rgba(198,165,107,.1)" : "transparent", border: active ? `1px solid rgba(198,165,107,.2)` : "1px solid transparent", color: active ? C.gold : "rgba(248,245,239,.45)", cursor: "pointer", borderRadius: 5, fontSize: "0.64rem", letterSpacing: 0.5, textAlign: "left", marginBottom: 1, transition: "all .15s" }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: "0.75rem", opacity: active ? 1 : 0.7 }}>{t.icon}</span>
                          {t.label}
                        </span>
                        {(t.badge || 0) > 0 && <span style={{ fontSize: "0.5rem", background: "rgba(224,90,90,.25)", color: C.red, padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>{t.badge}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      )}

      {/* Footer */}
      <div style={{ padding: "14px 18px", borderTop: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={onLogout} style={{ fontSize: "0.58rem", color: C.muted, background: "none", border: "none", cursor: "pointer", letterSpacing: 1 }}>← Uitloggen</button>
        {settingsSlot}
      </div>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex" }}>
      {/* ══ DESKTOP SIDEBAR — uitklapbaar ══ */}
      {!mobile && (
        <>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={{ position: "fixed", top: 20, left: sidebarOpen ? 212 : 12, zIndex: 300, width: 28, height: 28, background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: C.muted, transition: "left .3s ease", flexShrink: 0 }}
          >
            {sidebarOpen ? "‹" : "›"}
          </button>

          <div style={{ width: sidebarOpen ? 232 : 0, background: C.deep, minHeight: "100vh", borderRight: `1px solid ${sidebarOpen ? C.bdr : "transparent"}`, flexShrink: 0, overflow: "hidden", transition: "width .3s ease", position: "relative" }}>
            <div style={{ width: 232, height: "100%", position: "absolute", top: 0, left: 0 }}>
              <SidebarContent />
            </div>
          </div>
        </>
      )}

      {/* ══ MOBILE TOPBAR ══ */}
      {mobile && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: "rgba(5,5,5,.98)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.bdr}` }}>
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              style={{ background: "none", border: `1px solid ${C.bdr}`, cursor: "pointer", display: "flex", flexDirection: "column", gap: 4, padding: "7px 8px", borderRadius: 6, flexShrink: 0 }}
            >
              <span style={{ display: "block", width: 18, height: 1.5, background: sidebarOpen ? C.gold : C.muted, transition: "all .25s", transform: sidebarOpen ? "rotate(45deg) translate(4px,4px)" : "none" }} />
              <span style={{ display: "block", width: 18, height: 1.5, background: C.muted, transition: "all .25s", opacity: sidebarOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 18, height: 1.5, background: sidebarOpen ? C.gold : C.muted, transition: "all .25s", transform: sidebarOpen ? "rotate(-45deg) translate(4px,-4px)" : "none" }} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", fontWeight: 500, letterSpacing: 3, color: C.gold, lineHeight: 1 }}>AUREA MAISON</div>
              <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>{userName}</div>
            </div>
            {settingsSlot}
            <button onClick={onLogout} style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${C.bdr}`, color: C.muted, fontSize: "0.58rem", letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", borderRadius: 4, flexShrink: 0 }}>Uitloggen</button>
          </div>
        </div>
      )}

      {/* ══ MOBILE DRAWER ══ */}
      {mobile && sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: "relative", width: 260, background: C.deep, height: "100%", borderRight: `1px solid ${C.bdr}`, zIndex: 1, animation: "slideRight .25s ease both", overflowY: "auto" }}>
            <SidebarContent onNav={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ══ MAIN ══ */}
      <div style={{ flex: 1, overflowY: "auto", padding: mobile ? "72px 16px 32px" : `36px ${sidebarOpen ? "44px" : "56px"} 36px 40px`, minWidth: 0, transition: "padding .3s ease" }}>
        {children}
      </div>
    </div>
  );
}
