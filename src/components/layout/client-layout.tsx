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

  const cats: NavCat[] = [
    {
      id: "portaal", icon: "📋", label: "Mijn Portaal",
      tabs: [
        { href: "/client", icon: "📋", label: "Opdrachten" },
        { href: "/client/opdracht", icon: "➕", label: "Nieuwe Opdracht" },
        { href: "/client/offertes", icon: "📄", label: "Offertes" },
        { href: "/client/facturen", icon: "🧾", label: "Facturen" },
        { href: "/client/profiel", icon: "👤", label: "Profiel" },
        { href: "/client/instellingen", icon: "⚙️", label: "Instellingen" },
      ],
    },
  ];

  return (
    <SidebarShell
      cats={cats}
      flat
      logoSubtitle="Particulier Portaal"
      userName={user.name || user.email}
      settingsSlot={<SettingsGear userId={user.id} email={user.email} name={user.name || ""} />}
      onLogout={signOut}
    >
      {children}
    </SidebarShell>
  );
}
