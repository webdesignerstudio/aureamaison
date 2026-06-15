"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useLeggers } from "@/hooks/use-leggers";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatEuro } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import Link from "next/link";
import { useState, useMemo } from "react";

export default function PlanningPage() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data: orders, isLoading: ordersLoading } = useOrders(companyId);
  const { data: leggers } = useLeggers(companyId);

  const [filterStatus, setFilterStatus] = useState<string>("Alles");
  const [filterLegger, setFilterLegger] = useState<string>("Alles");
  const [search, setSearch] = useState("");

  const loading = ordersLoading;

  // Orders die een datum hebben = planningsitems
  const planOrders = useMemo(() => {
    if (!orders) return [];
    return orders
      .filter((o) => o.datum || o.legger_id)
      .sort((a, b) => {
        const da = a.datum ? new Date(a.datum).getTime() : 0;
        const db = b.datum ? new Date(b.datum).getTime() : 0;
        return da - db;
      });
  }, [orders]);

  // Groepeer per maand
  const grouped = useMemo(() => {
    const map = new Map<string, typeof planOrders>();
    for (const o of planOrders) {
      const key = o.datum
        ? new Date(o.datum).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })
        : "Geen datum";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return map;
  }, [planOrders]);

  // Filters toepassen
  const filteredOrders = useMemo(() => {
    return planOrders.filter((o) => {
      const statusMatch = filterStatus === "Alles" || o.status === filterStatus;
      const leggerMatch = filterLegger === "Alles" || o.legger_id === filterLegger;
      const searchMatch =
        !search.trim() ||
        o.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.straat?.toLowerCase().includes(search.toLowerCase()) ||
        o.plaats?.toLowerCase().includes(search.toLowerCase());
      return statusMatch && leggerMatch && searchMatch;
    });
  }, [planOrders, filterStatus, filterLegger, search]);

  const filteredGrouped = useMemo(() => {
    const map = new Map<string, typeof filteredOrders>();
    for (const o of filteredOrders) {
      const key = o.datum
        ? new Date(o.datum).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })
        : "Geen datum";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return map;
  }, [filteredOrders]);

  const statuses = ["Alles", "gepland", "bezig", "ter goedkeuring", "afgerond"];

  const sel = { padding: "8px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.68rem", outline: "none" };
  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "11px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: C.muted, fontSize: "0.8rem" }}>Laden…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Overzicht</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Planning</h1>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op klant of adres…"
            style={{ ...sel, flex: "1 1 200px" }} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={sel}>
            {statuses.map((s) => <option key={s} value={s}>{s === "Alles" ? "Alle statussen" : s}</option>)}
          </select>
          <select value={filterLegger} onChange={(e) => setFilterLegger(e.target.value)} style={sel}>
            <option value="Alles">Alle leggers</option>
            {leggers?.map((l) => <option key={l.id} value={l.id}>{l.naam}</option>)}
          </select>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 22 }}>
          {[
            { label: "Gepland", val: planOrders.filter((o) => o.status === "gepland").length, color: C.gold },
            { label: "Bezig", val: planOrders.filter((o) => o.status === "bezig").length, color: C.blue },
            { label: "Afgerond", val: planOrders.filter((o) => o.status === "afgerond").length, color: C.green },
          ].map((k) => (
            <div key={k.label} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>{k.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.7rem", color: k.color, lineHeight: 1.1, marginTop: 6 }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Planning per maand */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {Array.from(filteredGrouped.entries()).map(([month, items]) => (
            <div key={month}>
              <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>{month}</div>
              <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={th}>Datum</th>
                        <th style={th}>Klant</th>
                        <th style={th}>Adres</th>
                        <th style={th}>Vloer</th>
                        <th style={th}>Legger</th>
                        <th style={th}>Status</th>
                        <th style={{ ...th, textAlign: "right" }}>Prijs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((order) => (
                        <tr key={order.id}>
                          <td style={{ ...td, color: C.dim }}>{order.datum ? formatDate(order.datum) : "—"}</td>
                          <td style={td}>
                            <Link href={`/dashboard/orders/${order.id}`} style={{ color: C.white, textDecoration: "none" }}>{order.client_name}</Link>
                          </td>
                          <td style={{ ...td, color: C.dim }}>{order.straat}, {order.plaats}</td>
                          <td style={{ ...td, color: C.dim }}>{order.vloer_type || "—"}{order.oppervlakte ? ` (${order.oppervlakte} m²)` : ""}</td>
                          <td style={td}>
                            {order.legger_naam || <span style={{ color: C.red, fontSize: "0.58rem", opacity: 0.7 }}>Niet toegewezen</span>}
                          </td>
                          <td style={td}><StatusBadge status={order.status} /></td>
                          <td style={{ ...td, textAlign: "right", color: C.gold, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.88rem" }}>
                            {order.price ? `€ ${formatEuro(order.price)}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "36px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>
              Geen geplande klussen gevonden.
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
