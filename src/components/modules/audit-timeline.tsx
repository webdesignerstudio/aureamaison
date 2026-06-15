"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { C } from "@/lib/landing/colors";
import type { AuditLog } from "@/types";

interface AuditTimelineProps {
  entityId: string;
  entityType: string;
  compact?: boolean;
}

function actieKleur(actie: string): string {
  if (actie.includes("AANGEMAAKT") || actie.includes("CREATED")) return C.green;
  if (actie.includes("ROLLBACK") || actie.includes("HERSTELD")) return C.red;
  if (actie.includes("BETAALD") || actie.includes("BETALING")) return C.green;
  if (actie.includes("TOEGEWEZEN")) return C.blue;
  if (actie.includes("STATUS")) return C.gold;
  if (actie.includes("VERSTUURD")) return C.blue;
  return C.muted;
}

function fmtTs(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "short" }) + " " +
    d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

export function AuditTimeline({ entityId, entityType, compact = false }: AuditTimelineProps) {
  const [events, setEvents] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;
    const supabase = createClient();
    supabase
      .from("audit_logs")
      .select("*")
      .eq("entity_id", entityId)
      .eq("entity_type", entityType)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: AuditLog[] | null }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, [entityId, entityType]);

  if (loading) return (
    <div style={{ color: C.dim, fontSize: "0.65rem", padding: "10px 0" }}>Tijdlijn laden…</div>
  );

  if (events.length === 0) return null;

  if (compact) return (
    <div style={{ fontSize: "0.58rem", color: C.dim, marginTop: 8 }}>
      {events.slice(0, 3).map((e, i) => (
        <div key={i} style={{ display: "flex", gap: 8, padding: "3px 0", borderBottom: `1px solid rgba(255,255,255,.04)` }}>
          <span style={{ color: actieKleur(e.actie), flexShrink: 0 }}>●</span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.actie.replace(/_/g, " ")}</span>
          <span style={{ flexShrink: 0 }}>{fmtTs(e.created_at)}</span>
        </div>
      ))}
      {events.length > 3 && <div style={{ color: C.dim, paddingTop: 4 }}>+{events.length - 3} meer in audit log</div>}
    </div>
  );

  return (
    <div style={{ marginTop: 20, background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: "0.48rem", letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>
        Activiteitentijdlijn ({events.length} events)
      </div>
      <div style={{ position: "relative", paddingLeft: 20 }}>
        <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 1, background: `linear-gradient(180deg,${C.gold}44,transparent)` }} />
        {events.map((e, i) => (
          <div key={e.id} style={{ position: "relative", marginBottom: 14, paddingBottom: 14, borderBottom: i < events.length - 1 ? `1px solid rgba(255,255,255,.04)` : "none" }}>
            <div style={{ position: "absolute", left: -17, top: 3, width: 8, height: 8, borderRadius: "50%", background: actieKleur(e.actie), border: `2px solid ${C.bg}` }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.68rem", color: C.white, fontWeight: 500, marginBottom: 3 }}>
                  {e.actie.replace(/_/g, " ")}
                </div>
                <div style={{ fontSize: "0.58rem", color: C.muted, marginBottom: e.notitie ? 4 : 0 }}>
                  {e.user_naam || e.user_rol || "Systeem"}
                </div>
                {e.notitie && (
                  <div style={{ fontSize: "0.58rem", color: C.dim, fontStyle: "italic" }}>"{e.notitie}"</div>
                )}
                {(e.oude_data || e.nieuwe_data) && (
                  <div style={{ display: "flex", gap: 8, marginTop: 6, fontSize: "0.54rem", flexWrap: "wrap" }}>
                    {e.oude_data && (
                      <div style={{ padding: "3px 8px", background: "rgba(224,90,90,.06)", borderRadius: 5, color: C.red, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        Voor: {JSON.stringify(e.oude_data).slice(0, 60)}
                      </div>
                    )}
                    {e.nieuwe_data && (
                      <div style={{ padding: "3px 8px", background: "rgba(60,184,122,.06)", borderRadius: 5, color: C.green, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        Na: {JSON.stringify(e.nieuwe_data).slice(0, 60)}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div style={{ fontSize: "0.54rem", color: C.dim, flexShrink: 0 }}>{fmtTs(e.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
