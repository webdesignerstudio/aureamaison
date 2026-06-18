"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { SidebarShell, type NavCat } from "./sidebar-shell";
import { SettingsGear } from "@/components/modules/settings-gear";
import { CommandSearch } from "@/components/ui/command-search";
import { C } from "@/lib/landing/colors";

const eur = (v: number) => (v > 0 ? `€ ${v.toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—");

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, error, signOut } = useAuth();
  const router = useRouter();
  const { data: orders = [] } = useOrders(user?.company_id);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: C.bg, color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
  );

  if (error) return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: C.bg, padding: "0 20px" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "24px", borderRadius: 12, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, textAlign: "center", fontSize: "0.72rem", color: C.red }}>
        Er is een fout opgetreden bij het laden van uw sessie. Probeer de pagina te vernieuwen.
      </div>
    </div>
  );

  if (!user) {
    return null;
  }

  // ── Live tellingen voor badges + mini-stats ──
  const byStatus = (s: string) => orders.filter((o) => (o.status || "").toLowerCase() === s).length;
  const nieuw = byStatus("ingediend");
  const lopend = orders.filter((o) => ["in behandeling", "gepland", "bezig", "ter goedkeuring"].includes((o.status || "").toLowerCase())).length;
  const afgerond = byStatus("afgerond");
  const omzet = orders.filter((o) => (o.status || "").toLowerCase() === "afgerond").reduce((s, o) => s + (Number(o.price) || 0), 0);

  const cats: NavCat[] = [
    {
      id: "operationeel", icon: "🏠", label: "Operationeel",
      tabs: [
        { href: "/dashboard", icon: "📊", label: "Dashboard" },
        { href: "/dashboard/orders", icon: "📋", label: "Opdrachten", badge: nieuw },
        { href: "/dashboard/aanvragen", icon: "🌐", label: "Aanvragen", badge: nieuw },
        { href: "/dashboard/uitzetten", icon: "🔨", label: "Uitzetten" },
        { href: "/dashboard/oplevering", icon: "✅", label: "Oplevering" },
        { href: "/dashboard/planning", icon: "📅", label: "Planning" },
        { href: "/dashboard/calculator", icon: "📐", label: "Calculator" },
      ],
    },
    {
      id: "mensen", icon: "👥", label: "Mensen",
      tabs: [
        { href: "/dashboard/leggers", icon: "👷", label: "Leggers" },
        { href: "/dashboard/aanmeldingen", icon: "📝", label: "Aanmeldingen" },
        { href: "/dashboard/klanten", icon: "👥", label: "Klanten" },
      ],
    },
    {
      id: "financieel", icon: "💰", label: "Financieel",
      tabs: [
        { href: "/dashboard/offertes", icon: "📄", label: "Offertes" },
        { href: "/dashboard/facturen", icon: "🧾", label: "Facturen" },
        { href: "/dashboard/uitbetalingen", icon: "💸", label: "Uitbetalingen" },
        { href: "/dashboard/statistieken", icon: "�", label: "Statistieken" },
        { href: "/dashboard/financieel", icon: "💶", label: "Fin. overzicht" },
      ],
    },
    {
      id: "beheer", icon: "⚙️", label: "Beheer",
      tabs: [
        { href: "/dashboard/producten", icon: "📦", label: "Producten" },
        { href: "/dashboard/emaillog", icon: "📧", label: "E-mail log" },
        { href: "/dashboard/beschikbaar", icon: "📅", label: "Beschikbaar" },
        { href: "/dashboard/leveranciers", icon: "🚚", label: "Leveranciers" },
        { href: "/dashboard/audit", icon: "🔒", label: "Audit log" },
        { href: "/dashboard/settings", icon: "⚙️", label: "Instellingen" },
      ],
    },
  ];

  const stats: [string, number | string, string][] = [
    ["Totaal", orders.length, C.gold],
    ["Nieuw", nieuw, C.gold],
    ["Lopend", lopend, C.green],
    ["Afgerond", afgerond, "rgba(255,255,255,.3)"],
  ];

  const statsSlot = (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
        {stats.map(([l, c, col]) => (
          <div key={l} style={{ background: "rgba(255,255,255,.03)", borderRadius: 5, padding: "7px 8px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: col, lineHeight: 1 }}>{c}</div>
            <div style={{ fontSize: "0.44rem", letterSpacing: 1, color: C.muted, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "8px 10px", background: "rgba(198,165,107,.05)", border: `1px solid rgba(198,165,107,.12)`, borderRadius: 5 }}>
        <div style={{ fontSize: "0.44rem", letterSpacing: 1, color: C.muted, textTransform: "uppercase", marginBottom: 2 }}>Omzet</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.gold }}>{eur(omzet)}</div>
      </div>
    </>
  );

  return (
    <>
      <CommandSearch />
      <SidebarShell
        cats={cats}
        logoSubtitle="Eigenaar Dashboard"
        userName={user.name || user.email}
        statsSlot={statsSlot}
        settingsSlot={<SettingsGear userId={user.id} email={user.email} name={user.name || ""} />}
        onLogout={signOut}
      >
        {children}
      </SidebarShell>
    </>
  );
}
