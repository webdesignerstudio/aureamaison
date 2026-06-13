"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { C } from "@/lib/landing/colors";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { AuditLog } from "@/types";

function useAuditLogs(companyId?: string | null) {
  return useQuery({
    queryKey: ["audit_logs", companyId],
    queryFn: async () => {
      const supabase = createClient();
      let q = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (companyId) q = q.eq("company_id", companyId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as AuditLog[]) || [];
    },
    enabled: !!companyId,
  });
}

const actiKleur = (a: string) => {
  if (!a) return "#64748b";
  if (a.includes("DELETE") || a.includes("ROLLBACK")) return "#f87171";
  if (a.includes("BETAAL") || a.includes("AFGEROND")) return "#4ade80";
  if (a.includes("CREATE") || a.includes("INSERT") || a.includes("LOGIN")) return "#22d3ee";
  if (a.includes("ASSIGN") || a.includes("LEGGER")) return "#fbbf24";
  if (a.includes("UPDATE") || a.includes("STATUS")) return "#a78bfa";
  return "#64748b";
};

const TYPEN = ["alle", "ORDER", "OFFERTE", "LEGGER", "LOGIN", "DELETE", "UPDATE"];

export default function AuditPage() {
  const { user } = useAuth();
  const { data: logs = [], isLoading } = useAuditLogs(user?.company_id);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("alle");
  const [expanded, setExpanded] = useState<string | null>(null);

  const gefilterd = logs.filter((l) => {
    if (typeFilter !== "alle" && !(l.actie || "").toUpperCase().includes(typeFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![l.actie, l.user_naam, l.entity_type, l.notitie].join(" ").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const rows = [
      ["Event ID", "Tijdstip", "Actie", "Gebruiker", "Rol", "Entity Type", "Notitie"],
      ...gefilterd.map((l) => [
        l.id, new Date(l.created_at).toLocaleString("nl-NL"), l.actie,
        l.user_naam || "", l.user_rol || "", l.entity_type, l.notitie || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv);
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Systeem</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
              Audit <span style={{ color: C.gold, fontStyle: "italic" }}>Log</span>
            </h1>
            <p style={{ fontSize: "0.65rem", color: C.muted, marginTop: 4 }}>Alle handelingen permanent opgeslagen · Logs kunnen niet worden verwijderd</p>
          </div>
          <button onClick={exportCSV}
            style={{ padding: "9px 18px", background: "rgba(198,165,107,.1)", border: `1px solid ${C.bdr}`, color: C.gold, fontSize: "0.58rem", letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 8 }}>
            ↓ Export CSV
          </button>
        </div>

        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10, marginBottom: 20 }}>
          {[
            ["📋", "Totaal events", logs.length, "#94a3b8"],
            ["🗑️", "Deletes", logs.filter((l) => l.actie?.includes("DELETE")).length, "#f87171"],
            ["💰", "Financieel", logs.filter((l) => l.actie?.includes("BETAAL") || l.actie?.includes("FACTUUR")).length, "#4ade80"],
            ["⚙️", "Updates", logs.filter((l) => l.actie?.includes("UPDATE") || l.actie?.includes("STATUS")).length, "#a78bfa"],
          ].map(([ic, lbl, val, k]) => (
            <div key={lbl as string} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{ic}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", color: k as string, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Zoek actie, gebruiker, notitie…"
            style={{ flex: 1, minWidth: 200, padding: "7px 12px", background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.68rem" }} />
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {TYPEN.map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)}
                style={{ fontSize: "0.55rem", padding: "5px 10px", borderRadius: 6, cursor: "pointer", border: `1px solid ${typeFilter === t ? "#22d3ee44" : C.bdr}`, background: typeFilter === t ? "#22d3ee11" : "transparent", color: typeFilter === t ? "#22d3ee" : C.dim }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Log list */}
        {isLoading ? (
          <div style={{ color: C.muted, fontSize: "0.72rem", padding: "20px 0" }}>Laden…</div>
        ) : gefilterd.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.muted }}>
              {logs.length === 0 ? "Geen audit logs beschikbaar" : "Geen resultaten voor deze filter"}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {gefilterd.map((l) => (
              <div key={l.id} onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 9, padding: "12px 16px", cursor: "pointer", transition: "border-color .15s" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = C.bdr}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: actiKleur(l.actie || ""), flexShrink: 0 }} />
                  <span style={{ fontSize: "0.66rem", color: actiKleur(l.actie || ""), fontFamily: "monospace", fontWeight: 700, flexShrink: 0 }}>{l.actie || "—"}</span>
                  <span style={{ fontSize: "0.62rem", color: C.muted, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.notitie || `${l.entity_type} ${l.entity_id ? l.entity_id.slice(0, 8) + "…" : ""}`}</span>
                  <span style={{ fontSize: "0.54rem", color: C.dim, flexShrink: 0 }}>{l.user_naam || "Systeem"}</span>
                  <span style={{ fontSize: "0.52rem", color: C.dim, flexShrink: 0 }}>{new Date(l.created_at).toLocaleString("nl-NL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                {expanded === l.id && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid rgba(255,255,255,.06)`, animation: "slideUp .2s ease" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 6, marginBottom: 8 }}>
                      {[
                        ["Entity Type", l.entity_type],
                        ["Entity ID", l.entity_id ? l.entity_id.slice(0, 16) + "…" : "—"],
                        ["Gebruiker", l.user_naam || "—"],
                        ["Rol", l.user_rol || "—"],
                        ["Notitie", l.notitie || "—"],
                        ["Tijdstip", new Date(l.created_at).toLocaleString("nl-NL")],
                      ].map(([k, v]) => (
                        <div key={k} style={{ padding: "6px 8px", background: "rgba(255,255,255,.02)", borderRadius: 5 }}>
                          <div style={{ fontSize: "0.46rem", letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                          <div style={{ fontSize: "0.62rem", color: C.white }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {(l.oude_data || l.nieuwe_data) && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {l.oude_data && (
                          <div>
                            <div style={{ fontSize: "0.46rem", letterSpacing: 1, color: C.red, textTransform: "uppercase", marginBottom: 4 }}>Oude data</div>
                            <pre style={{ color: C.muted, fontFamily: "monospace", fontSize: "0.54rem", whiteSpace: "pre-wrap", wordBreak: "break-all", padding: "8px 10px", background: "rgba(224,90,90,.04)", border: "1px solid rgba(224,90,90,.15)", borderRadius: 6, margin: 0, maxHeight: 100, overflowY: "auto" }}>
                              {JSON.stringify(l.oude_data, null, 2)}
                            </pre>
                          </div>
                        )}
                        {l.nieuwe_data && (
                          <div>
                            <div style={{ fontSize: "0.46rem", letterSpacing: 1, color: C.green, textTransform: "uppercase", marginBottom: 4 }}>Nieuwe data</div>
                            <pre style={{ color: C.muted, fontFamily: "monospace", fontSize: "0.54rem", whiteSpace: "pre-wrap", wordBreak: "break-all", padding: "8px 10px", background: "rgba(60,184,122,.04)", border: "1px solid rgba(60,184,122,.15)", borderRadius: 6, margin: 0, maxHeight: 100, overflowY: "auto" }}>
                              {JSON.stringify(l.nieuwe_data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:translateY(0) } }`}</style>
    </DashboardLayout>
  );
}
