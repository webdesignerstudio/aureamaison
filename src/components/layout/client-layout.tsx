"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { C } from "@/lib/landing/colors";
import { SidebarShell, type NavCat } from "./sidebar-shell";
import { SettingsGear } from "@/components/modules/settings-gear";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, error, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/client/login");
    }
    if (!loading && user && user.role !== "client") {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: C.bg, color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
  );

  if (error) return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: C.bg, padding: "0 20px" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "24px", borderRadius: 12, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, textAlign: "center", fontSize: "0.72rem", color: C.red }}>
        Er is een fout opgetreden bij het laden van uw sessie.
      </div>
    </div>
  );

  if (!user || user.role !== "client") {
    return null;
  }

  const isZakelijk = (user.onboarding_data as Record<string, unknown>)?.type === "zakelijk";
  const portaalLabel = isZakelijk ? "Zakelijk Portaal" : "Particulier Portaal";

  const cats: NavCat[] = [
    {
      id: "portaal", icon: "📋", label: "Mijn Portaal",
      tabs: [
        { href: "/client", icon: "📋", label: "Opdrachten" },
        { href: "/client/opdracht", icon: "➕", label: "Nieuwe Opdracht" },
        { href: "/client/offertes", icon: "📄", label: "Offertes" },
        { href: "/client/facturen", icon: "🧾", label: "Facturen" },
        ...(isZakelijk ? [{ href: "/client/marktplaats", icon: "🛒", label: "Leggers vinden" }] : []),
        { href: "/client/profiel", icon: "👤", label: isZakelijk ? "Bedrijfsprofiel" : "Profiel" },
        { href: "/client/instellingen", icon: "⚙️", label: "Instellingen" },
      ],
    },
  ];

  const userCard = (
    <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.bdr}`, marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "rgba(255,255,255,.03)", borderRadius: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},#8B6E3E)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: C.bg, flexShrink: 0 }}>
          {(user.name || user.email || "?")[0].toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "0.72rem", color: C.white, fontWeight: 500, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name || user.email}</div>
          {isZakelijk && (
            <div style={{ fontSize: "0.54rem", color: C.muted, marginTop: 1 }}>Zakelijk account</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <SidebarShell
      cats={cats}
      flat
      logoSubtitle={portaalLabel}
      userName={user.name || user.email}
      statsSlot={userCard}
      settingsSlot={<SettingsGear userId={user.id} email={user.email} name={user.name || ""} />}
      onLogout={signOut}
    >
      {children}
    </SidebarShell>
  );
}
