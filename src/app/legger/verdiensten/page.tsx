"use client";

import { useState, useEffect, useMemo } from "react";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { useAuth } from "@/hooks/use-auth";
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

  const afgerond = orders.filter((o) => o.status === "afgerond");
  const gepland   = orders.filter((o) => !["afgerond"].includes(o.status));
  const totaalVerdiend = afgerond.reduce((s, o) => s + (parseFloat(String(o.legger_prijs || 0)) || 0), 0);
  const prognose       = gepland.reduce((s, o) => s + (parseFloat(String(o.legger_prijs || 0)) || 0), 0);

  const eur = (v: number) => v > 0 ? `€ ${v.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}` : "—";

  // 6-month bar chart data — matches MODULES
  const maanden = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
      const k = d.toISOString().slice(0, 7);
      const v  = afgerond.filter((o) => ((o.legger_afgerond_at || o.datum) || "").startsWith(k))
                         .reduce((s, o) => s + (parseFloat(String(o.legger_prijs || 0)) || 0), 0);
      const vp = gepland.filter((o) => (o.datum || "").startsWith(k))
                        .reduce((s, o) => s + (parseFloat(String(o.legger_prijs || 0)) || 0), 0);
      return { l: d.toLocaleDateString("nl-NL", { month: "short" }), v, vp };
    });
  }, [afgerond, gepland]);

  const maxM = Math.max(...maanden.map((m) => m.v + m.vp), 1);

  if (loading) return (
    <LeggerLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </LeggerLayout>
  );

  return (
    <LeggerLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: "0.56rem", letterSpacing: 4, color: C.blue, textTransform: "uppercase", marginBottom: 4 }}>Financieel overzicht</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Mijn <em style={{ fontStyle: "italic", color: C.goldL }}>Verdiensten</em>
          </h1>
        </div>

        {/* 4 KPI cards — matches MODULES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 22 }}>
          {[
            { label: "Totaal verdiend",   val: eur(totaalVerdiend), color: C.green },
            { label: "Prognose komend",   val: eur(prognose),        color: C.gold },
            { label: "Klussen afgerond",  val: afgerond.length,      color: C.green },
            { label: "Klussen gepland",   val: gepland.length,       color: C.blue },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: "0.52rem", letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>{label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: typeof val === "string" ? "1.45rem" : "2rem", color, fontWeight: 300, lineHeight: 1 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* 6-month bar chart — matches MODULES */}
        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "20px 22px", marginBottom: 16 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 18 }}>Verdiensten per maand</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110 }}>
            {maanden.map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: "0.5rem", color: C.gold, height: 14, textAlign: "center" }}>
                  {(m.v + m.vp) > 0 ? `€${Math.round((m.v + m.vp) / 1000) || "<1"}k` : ""}
                </div>
                <div style={{
                  width: "100%", display: "flex", flexDirection: "column",
                  borderRadius: "3px 3px 0 0", overflow: "hidden",
                  height: Math.max((m.v + m.vp) / maxM * 90, (m.v + m.vp) > 0 ? 4 : 2) + "px",
                  transition: "height .5s",
                }}>
                  {m.v > 0 && <div style={{ flex: m.v, background: `linear-gradient(180deg,${C.green},${C.green}88)` }} />}
                  {m.vp > 0 && <div style={{ flex: m.vp, background: `linear-gradient(180deg,${C.gold}cc,${C.gold}55)` }} />}
                  {(m.v + m.vp) === 0 && <div style={{ flex: 1, background: "rgba(255,255,255,.05)" }} />}
                </div>
                <div style={{ fontSize: "0.5rem", color: C.dim }}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: "0.55rem", color: C.muted }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.green, display: "inline-block" }} /> Afgerond</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.gold, display: "inline-block" }} /> Gepland</span>
          </div>
        </div>

        {/* Klus overzicht — afgerond + gepland — matches MODULES */}
        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "20px 22px" }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Klus overzicht — vergoedingen</div>
          {orders.length === 0 ? (
            <div style={{ color: C.muted, fontSize: "0.76rem", padding: "14px 0" }}>Nog geen klussen aangenomen.</div>
          ) : (
            [...orders].sort((a, b) => (b.datum || "").localeCompare(a.datum || "")).map((o) => {
              const isAfg = o.status === "afgerond";
              const dateStr = o.datum ? new Date(o.datum).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }) : "—";
              const prijs = parseFloat(String(o.legger_prijs || 0));
              return (
                <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid rgba(255,255,255,.05)`, gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.78rem", color: isAfg ? C.muted : C.white, fontWeight: 500 }}>
                      {o.straat ? `${o.straat}, ${o.plaats}` : o.plaats || "—"}
                    </div>
                    <div style={{ fontSize: "0.6rem", color: C.dim, marginTop: 2 }}>{dateStr} · {o.vloer_type || "Overig"}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {prijs > 0 ? (
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: isAfg ? C.green : C.gold }}>
                        € {prijs.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                      </div>
                    ) : <div style={{ fontSize: "0.65rem", color: C.dim }}>—</div>}
                    <div style={{ fontSize: "0.58rem", color: isAfg ? C.green : C.blue, marginTop: 2 }}>{isAfg ? "✓ Afgerond" : "⏳ Gepland"}</div>
                  </div>
                </div>
              );
            })
          )}
          {totaalVerdiend > 0 && (
            <div style={{ paddingTop: 16, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "0.6rem", color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Totaal afgerond</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: C.green }}>
                € {totaalVerdiend.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </LeggerLayout>
  );
}
