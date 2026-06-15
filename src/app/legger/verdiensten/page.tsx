"use client";

import { useState, useEffect } from "react";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatEuro } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

export default function LeggerVerdiensten() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    supabase.from("orders")
      .select("*")
      .eq("legger_id", user.id)
      .order("datum", { ascending: false })
      .then((res: { data: unknown }) => { setOrders((res.data as Order[]) || []); setLoading(false); });
  }, [user?.id]);

  const afgerond = orders.filter((o) => o.status === "afgerond" && o.legger_prijs);
  const totaalVerdiend = afgerond.reduce((s, o) => s + (parseFloat(String(o.legger_prijs)) || 0), 0);
  const gemiddeld = afgerond.length > 0 ? totaalVerdiend / afgerond.length : 0;
  const lopend = orders.filter((o) => ["gepland", "bezig", "ter goedkeuring"].includes(o.status) && o.legger_prijs);
  const verwacht = lopend.reduce((s, o) => s + (parseFloat(String(o.legger_prijs)) || 0), 0);

  const eur = (v: number) => v.toLocaleString("nl-NL", { minimumFractionDigits: 2 });

  const td = { padding: "11px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };
  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };

  if (loading) return (
    <LeggerLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </LeggerLayout>
  );

  return (
    <LeggerLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Financieel</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Mijn <em style={{ fontStyle: "italic", color: C.goldL }}>Verdiensten</em>
          </h1>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 28 }}>
          <div style={{ background: "rgba(60,184,122,.06)", border: "1px solid rgba(60,184,122,.2)", borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: "0.48rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>Totaal verdiend</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", color: C.green }}>{totaalVerdiend > 0 ? `€ ${eur(totaalVerdiend)}` : "—"}</div>
            <div style={{ fontSize: "0.58rem", color: C.dim, marginTop: 4 }}>{afgerond.length} klus{afgerond.length !== 1 ? "sen" : ""} afgerond</div>
          </div>
          <div style={{ background: "rgba(198,165,107,.06)", border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: "0.48rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>Gemiddeld per klus</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", color: C.gold }}>{gemiddeld > 0 ? `€ ${eur(gemiddeld)}` : "—"}</div>
          </div>
          <div style={{ background: "rgba(74,158,232,.06)", border: "1px solid rgba(74,158,232,.2)", borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: "0.48rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>Verwacht (lopend)</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", color: C.blue }}>{verwacht > 0 ? `€ ${eur(verwacht)}` : "—"}</div>
            <div style={{ fontSize: "0.58rem", color: C.dim, marginTop: 4 }}>{lopend.length} lopende klus{lopend.length !== 1 ? "sen" : ""}</div>
          </div>
        </div>

        {/* Klussen met vergoeding */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>Afgeronde klussen</div>
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
            {afgerond.length === 0 ? (
              <div style={{ padding: "36px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>💶</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 300 }}>Nog geen afgeronde klussen</div>
                <div style={{ fontSize: "0.68rem", color: C.muted, marginTop: 6 }}>Verdiensten verschijnen hier zodra klussen worden afgerond.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={th}>Datum</th>
                    <th style={th}>Adres</th>
                    <th style={th}>Vloer</th>
                    <th style={{ ...th, textAlign: "right" }}>Vergoeding</th>
                  </tr></thead>
                  <tbody>
                    {afgerond.map((order) => (
                      <tr key={order.id}>
                        <td style={{ ...td, color: C.dim }}>{order.datum ? formatDate(order.datum) : "—"}</td>
                        <td style={{ ...td, color: C.dim }}>{order.straat ? `${order.straat}, ${order.plaats}` : order.plaats || "—"}</td>
                        <td style={{ ...td, color: C.dim }}>{order.vloer_type || "—"}{order.oppervlakte ? ` (${order.oppervlakte} m²)` : ""}</td>
                        <td style={{ ...td, textAlign: "right", color: C.green, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.88rem" }}>
                          {order.legger_prijs ? `€ ${formatEuro(order.legger_prijs)}` : "—"}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} style={{ ...td, color: C.muted, fontSize: "0.58rem", letterSpacing: 1 }}>TOTAAL</td>
                      <td style={{ ...td, textAlign: "right", color: C.green, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", fontWeight: 700 }}>
                        € {eur(totaalVerdiend)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </LeggerLayout>
  );
}
