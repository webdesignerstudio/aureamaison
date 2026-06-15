"use client";

import { ClientLayout } from "@/components/layout/client-layout";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatEuro } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Offerte } from "@/types";

export default function ClientOffertesPage() {
  const { user } = useAuth();
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    const supabase = createClient();
    supabase.from("offertes").select("*").eq("client_email", user.email).order("created_at", { ascending: false })
      .then((res: { data: unknown }) => { setOffertes((res.data as Offerte[]) || []); setLoading(false); });
  }, [user?.email]);

  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "11px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  if (loading) return (
    <ClientLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </ClientLayout>
  );

  return (
    <ClientLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Mijn <em style={{ fontStyle: "italic", color: C.goldL }}>Offertes</em></h1>
        </div>

        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
          {offertes.length === 0 ? (
            <div style={{ padding: "48px 32px", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📄</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontWeight: 300, color: C.white, marginBottom: 6 }}>Nog geen offertes</div>
              <div style={{ fontSize: "0.68rem", color: C.muted }}>Wij sturen u een offerte zodra uw opdracht is beoordeeld.</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Status</th>
                  <th style={th}>Vloer</th>
                  <th style={th}>Oppervlakte</th>
                  <th style={th}>Budget</th>
                  <th style={th}>Geldig</th>
                  <th style={th}>Datum</th>
                </tr></thead>
                <tbody>
                  {offertes.map((offerte) => (
                    <tr key={offerte.id}>
                      <td style={td}><StatusBadge status={offerte.status} /></td>
                      <td style={{ ...td, color: C.dim }}>{offerte.vloer_type || "—"}</td>
                      <td style={{ ...td, color: C.dim }}>{offerte.oppervlakte ? `${offerte.oppervlakte} m²` : "—"}</td>
                      <td style={{ ...td, color: C.dim }}>{offerte.budget ? `€ ${formatEuro(offerte.budget)}` : "—"}</td>
                      <td style={{ ...td, color: C.dim }}>{offerte.geldigheid_dagen ? `${offerte.geldigheid_dagen} dagen` : "—"}</td>
                      <td style={{ ...td, color: C.dim }}>{formatDate(offerte.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </ClientLayout>
  );
}
