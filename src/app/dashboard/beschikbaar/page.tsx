"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { C } from "@/lib/landing/colors";
import type { Legger } from "@/types";

const DAYS_NL = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function getNext14Days() {
  const days: { iso: string; label: string; dayIdx: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    const dayIdx = (d.getDay() + 6) % 7;
    days.push({ iso, label: `${DAYS_NL[dayIdx]} ${d.getDate()}/${d.getMonth() + 1}`, dayIdx });
  }
  return days;
}

export default function BeschikbaarPage() {
  const { user } = useAuth();
  const [leggers, setLeggers] = useState<Legger[]>([]);
  const [orders, setOrders] = useState<{ legger_id: string | null; datum: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const days = getNext14Days();

  useEffect(() => {
    if (!user?.company_id) return;
    const supabase = createClient();
    Promise.all([
      supabase.from("leggers").select("*").eq("company_id", user.company_id),
      supabase.from("orders").select("legger_id,datum").eq("company_id", user.company_id)
        .in("status", ["gepland", "bezig"]).not("datum", "is", null),
    ]).then(([{ data: legData }, { data: ordData }]) => {
      setLeggers((legData as Legger[]) || []);
      setOrders((ordData as { legger_id: string | null; datum: string | null }[]) || []);
      setLoading(false);
    });
  }, [user?.company_id]);

  const isIngepland = (leggerId: string, dayIso: string) =>
    orders.some((o) => o.legger_id === leggerId && o.datum === dayIso);

  const isBeschikbaar = (legger: Legger, dayIso: string) => {
    const avail = Array.isArray(legger.beschikbaarheid) ? (legger.beschikbaarheid as string[]) : [];
    if (avail.length > 0 && !avail.includes(dayIso)) return false;
    return true;
  };

  if (loading) return (
    <DashboardLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Overzicht</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Legger <em style={{ fontStyle: "italic", color: C.goldL }}>Beschikbaarheid</em>
          </h1>
          <p style={{ fontSize: "0.65rem", color: C.dim, marginTop: 6 }}>Komende 14 dagen — ingeplande klussen en beschikbaarheid per legger.</p>
        </div>

        {/* Legenda */}
        <div style={{ display: "flex", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
          {[["rgba(60,184,122,.3)", C.green, "Beschikbaar"], ["rgba(74,158,232,.3)", C.blue, "Ingepland"], ["rgba(255,255,255,.06)", C.dim, "Niet opgegeven"]].map(([bg, col, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: bg, border: `1px solid ${col}` }} />
              <span style={{ fontSize: "0.6rem", color: C.muted }}>{label}</span>
            </div>
          ))}
        </div>

        {leggers.length === 0 ? (
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "48px 0", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>👷</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 300 }}>Geen leggers gevonden</div>
            <div style={{ fontSize: "0.68rem", color: C.muted, marginTop: 6 }}>Registreer leggers via de aanmeldingspagina.</div>
          </div>
        ) : (
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", fontWeight: 600, textAlign: "left", position: "sticky", left: 0, background: C.deep, zIndex: 1, minWidth: 130 }}>Legger</th>
                    {days.map((d) => (
                      <th key={d.iso} style={{ padding: "8px 6px", fontSize: "0.48rem", letterSpacing: 1, color: d.iso === new Date().toISOString().split("T")[0] ? C.gold : C.muted, textTransform: "uppercase", fontWeight: d.iso === new Date().toISOString().split("T")[0] ? 700 : 400, textAlign: "center", minWidth: 48, whiteSpace: "nowrap" }}>
                        {d.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leggers.map((legger) => (
                    <tr key={legger.id} style={{ borderTop: `1px solid rgba(255,255,255,.04)` }}>
                      <td style={{ padding: "10px 14px", fontSize: "0.7rem", color: C.white, fontWeight: 500, position: "sticky", left: 0, background: C.deep, zIndex: 1 }}>
                        <div>{legger.naam}</div>
                        <div style={{ fontSize: "0.58rem", color: C.muted, marginTop: 2 }}>{legger.stad || "—"}</div>
                      </td>
                      {days.map((d) => {
                        const ingepland = isIngepland(legger.id, d.iso);
                        const beschikbaar = isBeschikbaar(legger, d.iso);
                        const isWeekend = d.dayIdx >= 5;
                        return (
                          <td key={d.iso} style={{ padding: "8px 4px", textAlign: "center" }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 6, margin: "0 auto",
                              background: ingepland ? "rgba(74,158,232,.2)" : isWeekend ? "rgba(255,255,255,.02)" : beschikbaar ? "rgba(60,184,122,.12)" : "rgba(255,255,255,.04)",
                              border: `1px solid ${ingepland ? "rgba(74,158,232,.4)" : isWeekend ? "rgba(255,255,255,.04)" : beschikbaar ? "rgba(60,184,122,.25)" : "rgba(255,255,255,.06)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.7rem",
                            }}>
                              {ingepland ? "🔨" : isWeekend ? "" : beschikbaar ? "✓" : ""}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: "0.62rem", color: C.dim, lineHeight: 1.8 }}>
          🔒 Leggers kunnen hun beschikbaarheid beheren via hun eigen portaal onder <em>Instellingen</em>.
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
