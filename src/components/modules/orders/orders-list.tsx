"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { useSettings } from "@/hooks/use-settings";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatEuro, formatDate } from "@/lib/utils";
import { printInvoice } from "@/lib/invoice";
import { C } from "@/lib/landing/colors";
import type { Order, Settings } from "@/types";

const VLOER_EMOJI: Record<string, string> = {
  "Laminaat": "🪵",
  "PVC / Vinyl": "⬜",
  "Parket": "🌳",
  "Hout": "🏕",
  "Visgraat": "🔷",
  "Traprenovatie": "🪜",
  "Egaliseren": "📐",
  "Tegelwerk": "🟫",
};

const ALL_STATUSES = ["ingediend", "in behandeling", "gepland", "bezig", "ter goedkeuring", "afgerond", "afgewezen"];
const ALL_VLOER = ["Laminaat", "PVC / Vinyl", "Parket", "Hout", "Visgraat", "Traprenovatie", "Egaliseren", "Tegelwerk"];

const sel: React.CSSProperties = { padding: "8px 10px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.68rem", outline: "none", cursor: "pointer" };

interface OrdersListProps {
  companyId?: string | null;
}

export function OrdersList({ companyId }: OrdersListProps) {
  const { data: orders = [], isLoading, error, refetch } = useOrders(companyId) as { data: Order[]; isLoading: boolean; error: unknown; refetch?: () => void };
  const { data: settings } = useSettings(companyId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [vloerFilter, setVloerFilter] = useState("");
  const [sortBy, setSortBy] = useState("nieuwste");

  const handlePrintInvoice = (order: Order) => {
    if (!order.price) return;
    const s: Partial<Settings> = settings || {};
    printInvoice(order, {
      bedrijf_naam: s.bedrijf_naam || "Aurea Maison Floors",
      bedrijf_adres: s.bedrijf_adres || "Zuidwijkstraat 28",
      bedrijf_postcode: s.bedrijf_postcode || "2729 KD",
      bedrijf_plaats: s.bedrijf_plaats || "Zoetermeer",
      bedrijf_tel: s.bedrijf_tel || "06 28 27 35 70",
      bedrijf_email: s.bedrijf_email || "info@aureamaisonfloors.nl",
      kvk: s.kvk || "42032896",
      btw: s.btw || "NL00544489B03",
      iban: s.iban || "NL66 KNAB 0800 1498 74",
      factuur_btw_pct: s.factuur_btw_pct ?? 21,
      factuur_betaal_termijn: 14,
      factuur_voetnoot: s.factuur_voetnoot || "",
    });
  };

  const filtered = orders
    .filter((o) => {
      if (search && !o.client_name.toLowerCase().includes(search.toLowerCase()) && !(o.vloer_type || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && (o.status || "").toLowerCase() !== statusFilter) return false;
      if (vloerFilter && (o.vloer_type || "") !== vloerFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "nieuwste") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oudste") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "prijs-hoog") return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === "prijs-laag") return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === "naam") return a.client_name.localeCompare(b.client_name);
      return 0;
    });

  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "12px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  if (isLoading) return <div style={{ padding: "40px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>;

  if (error) return (
    <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, color: C.red, fontSize: "0.72rem" }}>
      Fout bij laden van orders.
    </div>
  );

  return (
    <div>
      {/* Filterbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input placeholder="Zoek op naam of vloertype…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1 1 180px", padding: "8px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", outline: "none", minWidth: 140 }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={sel}>
          <option value="">Alle statussen</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={vloerFilter} onChange={(e) => setVloerFilter(e.target.value)} style={sel}>
          <option value="">Alle vloertypes</option>
          {ALL_VLOER.map((v) => <option key={v} value={v}>{VLOER_EMOJI[v] || ""} {v}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={sel}>
          <option value="nieuwste">Nieuwste eerst</option>
          <option value="oudste">Oudste eerst</option>
          <option value="prijs-hoog">Prijs ↓</option>
          <option value="prijs-laag">Prijs ↑</option>
          <option value="naam">Naam A–Z</option>
        </select>
        <button onClick={() => refetch && refetch()}
          title="Vernieuwen"
          style={{ padding: "8px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.muted, fontSize: "0.9rem", cursor: "pointer", lineHeight: 1 }}>
          ↻
        </button>
      </div>

      <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "36px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Geen orders gevonden.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Klant</th>
                  <th style={th}>Vloer</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: "right" }}>Prijs</th>
                  <th style={th}>Datum</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const emoji = VLOER_EMOJI[order.vloer_type || ""] || "📋";
                  const leggerNaam = order.legger_naam ?? undefined;
                  const bron = (order as unknown as Record<string, unknown>).bron as string | undefined;
                  return (
                    <tr key={order.id}>
                      <td style={td}>
                        <Link href={`/dashboard/orders/${order.id}`} style={{ textDecoration: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <div style={{ fontSize: "0.72rem", color: C.white, fontWeight: 600 }}>{order.client_name}</div>
                            {bron === "website" && (
                              <span style={{ fontSize: "0.44rem", padding: "2px 7px", borderRadius: 99, background: "rgba(74,158,232,.12)", border: "1px solid rgba(74,158,232,.3)", color: C.blue, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>WEBSITE</span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.56rem", color: C.dim }}>{order.straat}, {order.plaats}</div>
                          {leggerNaam && (
                            <div style={{ marginTop: 3 }}>
                              <span style={{ fontSize: "0.46rem", padding: "2px 7px", borderRadius: 99, background: "rgba(60,184,122,.1)", border: "1px solid rgba(60,184,122,.25)", color: C.green, fontWeight: 700, letterSpacing: 0.5 }}>
                                👷 {leggerNaam}
                              </span>
                            </div>
                          )}
                        </Link>
                      </td>
                      <td style={{ ...td, color: C.dim }}>
                        <span style={{ marginRight: 5 }}>{emoji}</span>
                        {order.vloer_type || "—"}{order.oppervlakte ? ` · ${order.oppervlakte} m²` : ""}
                      </td>
                      <td style={td}><StatusBadge status={order.status} /></td>
                      <td style={{ ...td, textAlign: "right", color: C.gold, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem" }}>
                        {order.price ? `€ ${formatEuro(order.price)}` : "—"}
                      </td>
                      <td style={{ ...td, color: C.dim }}>{formatDate(order.created_at)}</td>
                      <td style={{ ...td, textAlign: "right" }}>
                        {order.price && (
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePrintInvoice(order); }}
                            style={{ padding: "4px 10px", borderRadius: 6, background: C.goldD, border: `1px solid ${C.bdr}`, color: C.gold, fontSize: "0.56rem", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>
                            🖨 Factuur
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
