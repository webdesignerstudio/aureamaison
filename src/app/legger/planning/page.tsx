"use client";

import { useState, useEffect, useMemo } from "react";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

export default function LeggerPlanningPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    supabase.from("orders")
      .select("*")
      .eq("legger_id", user.id)
      .in("status", ["gepland", "bezig", "ter goedkeuring"])
      .order("datum", { ascending: true })
      .then((res: { data: unknown }) => { setOrders((res.data as Order[]) || []); setLoading(false); });
  }, [user?.id]);

  const grouped = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of orders) {
      const key = o.datum
        ? new Date(o.datum).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })
        : "Geen datum";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return map;
  }, [orders]);

  const today = new Date().toISOString().split("T")[0];

  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "11px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  if (loading) return (
    <LeggerLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </LeggerLayout>
  );

  return (
    <LeggerLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Mijn <em style={{ fontStyle: "italic", color: C.goldL }}>Planning</em>
          </h1>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Gepland", val: orders.filter((o) => o.status === "gepland").length, color: C.gold },
            { label: "Bezig", val: orders.filter((o) => o.status === "bezig").length, color: C.blue },
            { label: "Ter goedkeuring", val: orders.filter((o) => o.status === "ter goedkeuring").length, color: C.orange },
          ].map((k) => (
            <div key={k.label} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.48rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.7rem", color: k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "48px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🗓</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontWeight: 300, marginBottom: 6 }}>Geen geplande klussen</div>
            <div style={{ fontSize: "0.68rem", color: C.muted }}>Geaccepteerde opdrachten met een datum verschijnen hier.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {Array.from(grouped.entries()).map(([month, items]) => (
              <div key={month}>
                <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>{month}</div>
                <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr>
                        <th style={th}>Datum</th>
                        <th style={th}>Adres</th>
                        <th style={th}>Vloer</th>
                        <th style={th}>Status</th>
                      </tr></thead>
                      <tbody>
                        {items.map((order) => {
                          const isVandaag = order.datum === today;
                          return (
                            <tr key={order.id} style={{ background: isVandaag ? "rgba(198,165,107,.04)" : undefined }}>
                              <td style={{ ...td, color: isVandaag ? C.gold : C.dim, fontWeight: isVandaag ? 700 : 400 }}>
                                {order.datum ? formatDate(order.datum) : "—"}
                                {isVandaag && <span style={{ marginLeft: 6, fontSize: "0.55rem", color: C.gold }}>Vandaag</span>}
                              </td>
                              <td style={{ ...td, color: C.dim }}>{order.straat ? `${order.straat}, ${order.plaats}` : order.plaats || "—"}</td>
                              <td style={{ ...td, color: C.dim }}>{order.vloer_type || "—"}{order.oppervlakte ? ` (${order.oppervlakte} m²)` : ""}</td>
                              <td style={td}><StatusBadge status={order.status} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </LeggerLayout>
  );
}
