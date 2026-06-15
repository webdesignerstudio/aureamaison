"use client";

import { useState, useEffect, useMemo } from "react";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { useAuth } from "@/hooks/use-auth";
import { C } from "@/lib/landing/colors";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

const STATUS_FILTERS = ["Alles", "Actief", "Gestart", "Afgerond"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function fmtDatum(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function LeggerPlanningPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Alles");

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    supabase.from("orders")
      .select("*")
      .eq("legger_id", user.id)
      .order("datum", { ascending: true })
      .then((res: { data: unknown }) => { setOrders((res.data as Order[]) || []); setLoading(false); });
  }, [user?.id]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus =
        statusFilter === "Alles" ? true :
        statusFilter === "Gestart" ? o.status === "bezig" :
        statusFilter === "Afgerond" ? o.status === "afgerond" :
        statusFilter === "Actief" ? !["afgerond"].includes(o.status) : true;
      const q = search.toLowerCase();
      const matchSearch = !q || [o.straat, o.plaats, o.vloer_type].some((v) => v?.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [orders, search, statusFilter]);

  const gepland = orders.filter((o) => o.status === "gepland").length;
  const bezig = orders.filter((o) => o.status === "bezig").length;
  const afgerond = orders.filter((o) => o.status === "afgerond").length;

  const inp = { padding: "10px 14px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", outline: "none" };

  if (loading) return (
    <LeggerLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </LeggerLayout>
  );

  return (
    <LeggerLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.56rem", letterSpacing: 4, color: C.blue, textTransform: "uppercase", marginBottom: 4 }}>Overzicht</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Mijn <em style={{ fontStyle: "italic", color: C.goldL }}>Planning</em>
          </h1>
        </div>

        {/* 4 Stat cards — matches MODULES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Totaal klussen", val: orders.length, color: C.gold },
            { label: "Gepland", val: gepland, color: C.blue },
            { label: "Bezig", val: bezig, color: C.orange },
            { label: "Afgerond", val: afgerond, color: C.green },
          ].map((k) => (
            <div key={k.label} style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.52rem", letterSpacing: 1.5, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", color: k.color, fontWeight: 300 }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Zoek adres, vloertype…"
            style={{ ...inp, flex: 1, minWidth: 140 }} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            style={{ ...inp, width: "auto", cursor: "pointer" }}>
            {STATUS_FILTERS.map((f) => <option key={f} value={f}>{f === "Alles" ? "Alle statussen" : f === "Actief" ? "Nog niet gestart" : f}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: C.muted, fontSize: "0.76rem" }}>
            {orders.length === 0 ? "Geen klussen gevonden." : "Geen klussen voor dit filter."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((o) => {
              const isGestart = o.status === "bezig";
              const isAfgerond = o.status === "afgerond";
              const statusCol = isAfgerond ? C.green : isGestart ? C.blue : C.gold;
              const statusLbl = isAfgerond ? "Afgerond" : isGestart ? "Gestart" : "Gepland";
              return (
                <div key={o.id} style={{
                  background: isAfgerond ? "rgba(255,255,255,.02)" : isGestart ? "rgba(74,158,232,.04)" : C.deep,
                  border: `1px solid ${isAfgerond ? "rgba(255,255,255,.08)" : isGestart ? "rgba(74,158,232,.2)" : "rgba(139,110,232,.2)"}`,
                  borderRadius: 12, padding: "18px 20px", opacity: isAfgerond ? 0.65 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.05rem", color: C.gold, marginBottom: 4 }}>{fmtDatum(o.datum)}</div>
                      <div style={{ fontSize: "0.72rem", color: C.white, marginBottom: 2 }}>📍 {o.straat ? `${o.straat}, ${o.plaats}` : o.plaats || "—"}</div>
                      {o.vloer_type && (
                        <div style={{ fontSize: "0.72rem", color: C.white, marginTop: 4 }}>
                          🪵 {o.vloer_type}{o.oppervlakte ? ` — ${o.oppervlakte} m²` : ""}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", background: statusCol + "20", border: `1px solid ${statusCol}44`, color: statusCol }}>
                        {statusLbl}
                      </span>
                      {o.legger_prijs && (
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", color: isAfgerond ? C.green : C.gold }}>
                          € {parseFloat(String(o.legger_prijs)).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  </div>
                  {isAfgerond && o.legger_afgerond_at && (
                    <div style={{ marginTop: 8, fontSize: "0.62rem", color: C.green }}>
                      ✓ Afgerond {new Date(o.legger_afgerond_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}. Factuur volgt.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </LeggerLayout>
  );
}
