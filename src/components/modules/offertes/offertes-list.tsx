"use client";

import Link from "next/link";
import { useState } from "react";
import { useOffertes } from "@/hooks/use-offertes";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { C } from "@/lib/landing/colors";

interface OffertesListProps {
  companyId?: string | null;
}

export function OffertesList({ companyId }: OffertesListProps) {
  const { data: offertes = [], isLoading, error } = useOffertes(companyId);
  const [search, setSearch] = useState("");

  const filtered = offertes.filter((o) =>
    !search || o.client_name.toLowerCase().includes(search.toLowerCase()) || o.client_email.toLowerCase().includes(search.toLowerCase())
  );

  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "12px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  if (isLoading) return <div style={{ padding: "40px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>;
  if (error) return <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, color: C.red, fontSize: "0.72rem" }}>Fout bij laden van offertes.</div>;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="Zoek op naam of email…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", outline: "none", boxSizing: "border-box" }} />
      </div>
      <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "36px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Geen offertes gevonden.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Klant</th>
                  <th style={th}>Vloer</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: "right" }}>Budget</th>
                  <th style={th}>Datum</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((offerte) => (
                  <tr key={offerte.id}>
                    <td style={td}>
                      <Link href={`/dashboard/offertes/${offerte.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ fontSize: "0.72rem", color: C.white, fontWeight: 600 }}>{offerte.client_name}</div>
                        <div style={{ fontSize: "0.56rem", color: C.dim }}>{offerte.client_email}</div>
                      </Link>
                    </td>
                    <td style={{ ...td, color: C.dim }}>
                      {offerte.vloer_type || "—"}{offerte.oppervlakte ? ` (${offerte.oppervlakte} m²)` : ""}
                    </td>
                    <td style={td}><StatusBadge status={offerte.status} /></td>
                    <td style={{ ...td, textAlign: "right", color: C.gold, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem" }}>
                      {offerte.budget ? `€ ${offerte.budget.toLocaleString("nl-NL")}` : "—"}
                    </td>
                    <td style={{ ...td, color: C.dim }}>{formatDate(offerte.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
