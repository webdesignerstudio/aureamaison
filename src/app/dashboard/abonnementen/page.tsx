"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { LEGGER_TIERS, Abonnement } from "@/lib/tiers";
import { calcMRR } from "@/lib/admin-stats";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { C } from "@/lib/landing/colors";

export default function AbonnementenPage() {
  const supabase = createClient();
  const [companyId, setCompanyId] = useState("");
  const [sub, setSub] = useState<"overzicht" | "handmatig" | "betaling">("overzicht");

  // Haal company_id op uit auth
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();
        if (profile?.company_id) {
          setCompanyId(profile.company_id);
        }
      }
    })();
  }, [supabase]);

  // Fetch abonnementen
  const { data: abonnementen = [], isLoading } = useQuery({
    queryKey: ["abonnementen", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("abonnementen")
        .select("*")
        .eq("company_id", companyId);
      if (error) throw error;
      return (data || []) as Abonnement[];
    },
    enabled: !!companyId,
  });

  const mrr = calcMRR(abonnementen);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("abonnementen")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) {
      // Refetch
      window.location.reload();
    }
  };

  const styles = {
    wrap: { padding: "20px", maxWidth: 1200, margin: "0 auto" },
    header: { marginBottom: 24 },
    title: {
      fontFamily: "'Cormorant Garamond',serif",
      fontSize: "2rem",
      fontWeight: 300,
      color: C.white,
      margin: "0 0 8px",
    },
    subtitle: { fontSize: "0.72rem", color: C.muted },
    tabs: {
      display: "flex",
      gap: 12,
      marginBottom: 20,
      borderBottom: `1px solid ${C.bdr}`,
      paddingBottom: 12,
    },
    tab: (active: boolean) => ({
      padding: "8px 16px",
      background: active ? `${C.gold}20` : "transparent",
      border: `1px solid ${active ? C.gold : C.bdr}`,
      borderRadius: 6,
      color: active ? C.gold : C.muted,
      cursor: "pointer",
      fontSize: "0.72rem",
      fontWeight: 600,
    }),
    card: {
      background: C.deep,
      border: `1px solid ${C.bdr}`,
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
    },
    kpiRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 12,
      marginBottom: 20,
    },
    kpiCard: {
      background: `${C.gold}10`,
      border: `1px solid ${C.bdr}`,
      borderRadius: 8,
      padding: 16,
      textAlign: "center" as const,
    },
    kpiValue: { fontSize: "1.8rem", fontWeight: 600, color: C.gold, margin: "0 0 4px" },
    kpiLabel: { fontSize: "0.62rem", color: C.muted, textTransform: "uppercase" as const },
  };

  return (
    <DashboardLayout>
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>Abonnementen</h1>
        <p style={styles.subtitle}>Beheer legger-abonnementen en tier-systeem</p>
      </div>

      {/* KPI's */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiValue}>€{mrr.toLocaleString("nl-NL")}</div>
          <div style={styles.kpiLabel}>MRR (actief)</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiValue}>{abonnementen.length}</div>
          <div style={styles.kpiLabel}>Totaal abonnementen</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiValue}>
            {abonnementen.filter((a) => a.status === "proefperiode").length}
          </div>
          <div style={styles.kpiLabel}>In proefperiode</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(["overzicht", "handmatig", "betaling"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSub(tab)}
            style={styles.tab(sub === tab)}
          >
            {tab === "overzicht" && "📋 Overzicht"}
            {tab === "handmatig" && "✍️ Handmatig"}
            {tab === "betaling" && "💳 Betaling"}
          </button>
        ))}
      </div>

      {/* Overzicht Tab */}
      {sub === "overzicht" && (
        <div>
          {isLoading ? (
            <div style={{ textAlign: "center", color: C.muted }}>Laden…</div>
          ) : abonnementen.length === 0 ? (
            <div style={{ textAlign: "center", color: C.muted, padding: "40px 20px" }}>
              Geen abonnementen gevonden
            </div>
          ) : (
            abonnementen.map((abo) => (
              <div key={abo.id} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: C.white }}>
                      {abo.naam}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: C.muted }}>
                      {abo.email} • {abo.type}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 600, color: C.gold }}>
                      €{LEGGER_TIERS[abo.tier as 1 | 2 | 3]?.prijs || 0}/mo
                    </div>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        padding: "4px 8px",
                        background:
                          abo.status === "actief"
                            ? "rgba(60,184,122,.2)"
                            : abo.status === "proefperiode"
                              ? "rgba(74,158,232,.2)"
                              : "rgba(255,255,255,.1)",
                        color:
                          abo.status === "actief"
                            ? "#3CB87A"
                            : abo.status === "proefperiode"
                              ? "#4A9EE8"
                              : C.muted,
                        borderRadius: 4,
                        marginTop: 4,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      {abo.status}
                    </div>
                  </div>
                </div>

                {abo.volgende_factuur && (
                  <div style={{ fontSize: "0.65rem", color: C.muted, marginBottom: 12 }}>
                    Volgende factuur: {new Date(abo.volgende_factuur).toLocaleDateString("nl-NL")}
                  </div>
                )}

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {abo.status !== "actief" && (
                    <button
                      onClick={() => handleStatusChange(abo.id, "actief")}
                      style={{
                        padding: "6px 12px",
                        background: "rgba(60,184,122,.1)",
                        border: "1px solid rgba(60,184,122,.3)",
                        color: "#3CB87A",
                        borderRadius: 6,
                        fontSize: "0.62rem",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      ▶ Activeren
                    </button>
                  )}
                  {abo.status === "actief" && (
                    <button
                      onClick={() => handleStatusChange(abo.id, "gepauzeerd")}
                      style={{
                        padding: "6px 12px",
                        background: "rgba(255,255,255,.04)",
                        border: `1px solid ${C.bdr}`,
                        color: C.muted,
                        borderRadius: 6,
                        fontSize: "0.62rem",
                        cursor: "pointer",
                      }}
                    >
                      ⏸ Pauzeren
                    </button>
                  )}
                  {abo.status !== "verlopen" && (
                    <button
                      onClick={() => handleStatusChange(abo.id, "verlopen")}
                      style={{
                        padding: "6px 12px",
                        background: "rgba(224,90,90,.1)",
                        border: "1px solid rgba(224,90,90,.2)",
                        color: "#E05A5A",
                        borderRadius: 6,
                        fontSize: "0.62rem",
                        cursor: "pointer",
                      }}
                    >
                      ✕ Verlopen
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Handmatig Tab */}
      {sub === "handmatig" && (
        <div style={styles.card}>
          <div style={{ fontSize: "0.7rem", color: C.muted, lineHeight: 1.8 }}>
            <strong style={{ color: C.white }}>Handmatig beheer</strong> — Jij maakt een abonnement aan, stuurt zelf een factuur, en activeert de tier zodra betaald. Geen automatische incasso.
          </div>
        </div>
      )}

      {/* Betaling Tab */}
      {sub === "betaling" && (
        <div style={styles.card}>
          <div style={{ fontSize: "0.7rem", color: C.muted, lineHeight: 1.8 }}>
            <strong style={{ color: C.white }}>Automatische betaling</strong> — Stuur een betaallink per e-mail. Klant betaalt via iDEAL. Jij ziet de betaling automatisch binnenkomen.
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
