"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { AuditLog } from "@/types";

interface AuditTimelineProps {
  entityId: string;
  entityType: string;
}

export function AuditTimeline({ entityId, entityType }: AuditTimelineProps) {
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

  if (loading) {
    return <div className="py-4 text-sm text-muted">Activiteiten laden…</div>;
  }

  if (events.length === 0) {
    return <div className="py-4 text-sm text-muted">Nog geen activiteiten geregistreerd.</div>;
  }

  const actieKleur = (actie: string) => {
    if (actie.includes("CREATED") || actie.includes("AANGEMAAKT")) return "text-green-400";
    if (actie.includes("STATUS")) return "text-gold";
    if (actie.includes("BETAALD")) return "text-green-400";
    if (actie.includes("TOEGEWEZEN")) return "text-blue-400";
    return "text-muted";
  };

  return (
    <div className="mt-6 rounded-xl border border-gold/10 bg-deep p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
        Activiteitentijdlijn
      </h2>
      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.id} className="flex gap-3 border-b border-gold/5 pb-3 last:border-0">
            <span className={`mt-0.5 text-xs ${actieKleur(e.actie)}`}>●</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">{e.actie.replace(/_/g, " ")}</div>
              <div className="text-xs text-muted">
                {e.user_naam || e.user_rol || "Systeem"} · {formatDate(e.created_at)}
              </div>
              {e.notitie && <div className="mt-1 text-xs italic text-muted/70">"{e.notitie}"</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
