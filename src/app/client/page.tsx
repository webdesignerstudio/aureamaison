"use client";

import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatEuro } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

export default function ClientPortalPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    const supabase = createClient();
    supabase.from("orders").select("*").eq("client_email", user.email).order("created_at", { ascending: false })
      .then((res: { data: unknown }) => { setOrders((res.data as Order[]) || []); setLoading(false); });
  }, [user?.email]);

  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "11px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  if (loading) return (
    <ClientLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </ClientLayout>
  );

  const actief = orders.filter((o) => o.status !== "afgerond" && o.status !== "afgewezen");
  const afgerond = orders.filter((o) => o.status === "afgerond");
  const openFacturen = orders.filter((o) => o.invoice_nr && !o.invoice_paid);
  const totaleWaarde = orders.filter((o) => o.price).reduce((s, o) => s + (Number(o.price) || 0), 0);
  const openBedrag = orders.filter((o) => o.price && o.status !== "afgerond").reduce((s, o) => s + (Number(o.price) || 0), 0);

  const isZakelijk = (user?.onboarding_data as Record<string, unknown>)?.type === "zakelijk";

  const VLOER_EMOJI: Record<string, string> = { "Laminaat": "🪵", "PVC / Vinyl": "⬜", "Parket": "🌳", "Hout": "🏕", "Visgraat": "🔷", "Traprenovatie": "🪜", "Egaliseren": "📐", "Tegelwerk": "🟫" };

  const statCard = (label: string, value: string | number, color: string) => (
    <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontSize: "0.48rem", letterSpacing: 2.5, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", fontWeight: 300, color }}>{value}</div>
    </div>
  );

  return (
    <ClientLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>
            {isZakelijk ? "Zakelijk Portaal" : "Opdrachtgeversportaal"}
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            {isZakelijk
              ? <>{user?.name || "Uw bedrijf"} — <em style={{ fontStyle: "italic", color: C.goldL }}>Projecten</em></>
              : <>Welkom, <em style={{ fontStyle: "italic", color: C.goldL }}>{user?.name?.split(" ")[0] || "klant"}</em></>
            }
          </h1>
        </div>

        {/* Abonnement-banner zakelijk */}
        {isZakelijk && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 16px", marginBottom: 16, background: "rgba(74,158,232,.08)", border: "1px solid rgba(74,158,232,.3)", borderRadius: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>🎁</span>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.white }}>Zakelijk account · Proefperiode</div>
                <div style={{ fontSize: "0.6rem", color: C.muted }}>Volledige toegang tijdens uw proefperiode</div>
              </div>
            </div>
            <Link href="/client/instellingen" style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${C.gold}`, color: C.gold, borderRadius: 6, fontSize: "0.6rem", fontWeight: 700, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>Beheer</Link>
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 24 }}>
          {statCard("Actieve opdrachten", actief.length, C.gold)}
          {statCard("Afgerond", afgerond.length, C.green)}
          {isZakelijk
            ? <>{statCard("Totale waarde", totaleWaarde > 0 ? `€ ${totaleWaarde.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—", C.gold)}
                {statCard("Openstaand", openBedrag > 0 ? `€ ${openBedrag.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—", openBedrag > 0 ? C.orange : C.muted)}</>
            : <>{statCard("Totaal ingediend", orders.length, C.muted)}
                {statCard("Open facturen", openFacturen.length, openFacturen.length > 0 ? C.orange : C.muted)}</>
          }
        </div>

        {/* Orders */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase" }}>Mijn opdrachten</div>
            <Link href="/client/opdracht" style={{ fontSize: "0.6rem", color: C.gold, textDecoration: "none" }}>+ Nieuwe opdracht</Link>
          </div>
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
            {orders.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Geen orders gevonden.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={th}>Status</th><th style={th}>Vloer</th><th style={th}>Prijs</th>
                    <th style={th}>Factuur</th><th style={th}>Datum</th>
                  </tr></thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td style={td}><StatusBadge status={order.status} /></td>
                        <td style={{ ...td, color: C.dim }}>
                          <span style={{ marginRight: 4 }}>{VLOER_EMOJI[order.vloer_type || ""] || "📋"}</span>
                          {order.vloer_type || "—"}
                          {order.oppervlakte ? ` · ${order.oppervlakte} m²` : ""}
                        </td>
                        <td style={{ ...td, color: C.dim }}>{order.price ? `€ ${formatEuro(order.price)}` : "—"}</td>
                        <td style={td}>
                          {order.invoice_paid ? <span style={{ color: C.green }}>Betaald ✓</span>
                            : order.invoice_nr ? <span style={{ color: C.gold }}>Open</span>
                            : <span style={{ color: C.dim }}>—</span>}
                        </td>
                        <td style={{ ...td, color: C.dim }}>{formatDate(order.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 10, textAlign: "center" }}>
          <Link href="/client/offertes" style={{ fontSize: "0.6rem", color: C.muted, textDecoration: "none" }}>Offertes bekijken →</Link>
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </ClientLayout>
  );
}
