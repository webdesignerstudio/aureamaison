"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { C } from "@/lib/landing/colors";
import { SidebarShell, type NavCat } from "./sidebar-shell";
import { SettingsGear } from "@/components/modules/settings-gear";

export function LeggerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, error, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/legger/login");
    }
    if (!loading && user && user.role !== "legger") {
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

  if (!user || user.role !== "legger") {
    return null;
  }

  const cats: NavCat[] = [
    {
      id: "legger", icon: "🔨", label: "Legger Portaal",
      tabs: [
        { href: "/legger", icon: "🔨", label: "Mijn Klussen" },
        { href: "/legger/agenda", icon: "📅", label: "Agenda" },
        { href: "/legger/planning", icon: "🗓", label: "Planning" },
        { href: "/legger/verdiensten", icon: "💶", label: "Verdiensten" },
        { href: "/legger/profiel", icon: "👤", label: "Profiel" },
        { href: "/legger/instellingen", icon: "⚙️", label: "Instellingen" },
      ],
    },
  ];

  return (
    <SidebarShell
      cats={cats}
      flat
      logoSubtitle="Legger Portaal"
      userName={user.name || user.email}
      settingsSlot={<SettingsGear userId={user.id} email={user.email} name={user.name || ""} />}
      onLogout={signOut}
    >
      {children}
    </SidebarShell>
  );
}
