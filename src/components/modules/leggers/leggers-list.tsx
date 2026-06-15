"use client";

import Link from "next/link";
import { useState } from "react";
import { useLeggers } from "@/hooks/use-leggers";
import { StatusBadge } from "@/components/ui/status-badge";
import { C } from "@/lib/landing/colors";

interface LeggersListProps {
  companyId?: string | null;
}

export function LeggersList({ companyId }: LeggersListProps) {
  const { data: leggers = [], isLoading, error } = useLeggers(companyId);
  const [search, setSearch] = useState("");

  const filtered = leggers.filter((l) =>
    !search || l.naam.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase())
  );

  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "12px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  if (isLoading) return <div style={{ padding: "40px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>;
  if (error) return <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, color: C.red, fontSize: "0.72rem" }}>Fout bij laden van leggers.</div>;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="Zoek op naam of email…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", outline: "none", boxSizing: "border-box" }} />
      </div>
      <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "36px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Geen leggers gevonden.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Naam</th>
                  <th style={th}>Contact</th>
                  <th style={th}>Status</th>
                  <th style={th}>Tier</th>
                  <th style={{ ...th, textAlign: "right" }}>Tarief</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((legger) => (
                  <tr key={legger.id}>
                    <td style={td}>
                      <Link href={`/dashboard/leggers/${legger.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ fontSize: "0.72rem", color: C.white, fontWeight: 600 }}>{legger.naam}</div>
                      </Link>
                    </td>
                    <td style={{ ...td, color: C.dim }}>
                      <div>{legger.email}</div>
                      {legger.telefoon && <div style={{ fontSize: "0.56rem" }}>{legger.telefoon}</div>}
                    </td>
                    <td style={td}><StatusBadge status={legger.status} /></td>
                    <td style={{ ...td, color: C.dim }}>{legger.tier}</td>
                    <td style={{ ...td, textAlign: "right", color: C.gold, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem" }}>
                      {legger.tarief ? `€ ${legger.tarief.toLocaleString("nl-NL")}/m²` : "—"}
                    </td>
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
