"use client";

import { ClientLayout } from "@/components/layout/client-layout";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatEuro } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Offerte } from "@/types";

function fmtDatum(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function isVerlopen(offerte: Offerte) {
  if (offerte.geldig_tot) return new Date(offerte.geldig_tot) < new Date();
  if (offerte.verstuurd_at && offerte.geldigheid_dagen) {
    const exp = new Date(offerte.verstuurd_at);
    exp.setDate(exp.getDate() + offerte.geldigheid_dagen);
    return exp < new Date();
  }
  return false;
}

function statusColor(offerte: Offerte) {
  if (offerte.status === "geaccepteerd") return C.green;
  if (offerte.status === "afgewezen") return C.red;
  if (offerte.status === "verstuurd" && isVerlopen(offerte)) return C.dim;
  if (offerte.status === "verstuurd") return C.gold;
  return C.muted;
}

function statusLabel(offerte: Offerte) {
  if (offerte.status === "verstuurd" && isVerlopen(offerte)) return "Verlopen";
  return offerte.status;
}

export default function ClientOffertesPage() {
  const { user } = useAuth();
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  const reload = () => {
    if (!user?.email) return;
    const supabase = createClient();
    supabase.from("offertes").select("*").eq("client_email", user.email).order("created_at", { ascending: false })
      .then((res: { data: unknown }) => { setOffertes((res.data as Offerte[]) || []); setLoading(false); });
  };

  useEffect(() => { reload(); }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const respond = async (offerte: Offerte, nieuwStatus: "geaccepteerd" | "afgewezen") => {
    setResponding(offerte.id);
    const supabase = createClient();
    await supabase.from("offertes").update({
      status: nieuwStatus,
      geaccepteerd_at: nieuwStatus === "geaccepteerd" ? new Date().toISOString() : null,
    }).eq("id", offerte.id);
    setResponding(null);
    reload();
  };

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

        {offertes.length === 0 ? (
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "48px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📄</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontWeight: 300, color: C.white, marginBottom: 6 }}>Nog geen offertes</div>
            <div style={{ fontSize: "0.68rem", color: C.muted }}>Wij sturen u een offerte zodra uw opdracht is beoordeeld.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {offertes.map((offerte) => {
              const verlopen = isVerlopen(offerte);
              const col = statusColor(offerte);
              const kanReageren = offerte.status === "verstuurd" && !verlopen;
              const isReacting = responding === offerte.id;
              return (
                <div key={offerte.id} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: kanReageren ? 14 : 0 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        {offerte.nr && <div style={{ fontSize: "0.78rem", fontWeight: 600, color: C.white }}>{offerte.nr}</div>}
                        <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: "0.54rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", background: col + "18", border: `1px solid ${col}44`, color: col }}>
                          {statusLabel(offerte)}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.62rem", color: C.muted, lineHeight: 1.8 }}>
                        {offerte.vloer_type && <span>{offerte.vloer_type} · </span>}
                        {offerte.oppervlakte && <span>{offerte.oppervlakte} m² · </span>}
                        Ingediend: {fmtDatum(offerte.created_at)}
                        {offerte.verstuurd_at && <span> · Verstuurd: {fmtDatum(offerte.verstuurd_at)}</span>}
                        {(offerte.geldig_tot || (offerte.verstuurd_at && offerte.geldigheid_dagen)) && (
                          <span> · Geldig t/m: {offerte.geldig_tot ? fmtDatum(offerte.geldig_tot) : (() => {
                            const d = new Date(offerte.verstuurd_at!);
                            d.setDate(d.getDate() + offerte.geldigheid_dagen!);
                            return fmtDatum(d.toISOString());
                          })()}</span>
                        )}
                      </div>
                      {offerte.notities && (
                        <div style={{ marginTop: 6, fontSize: "0.65rem", color: C.dim, background: "rgba(255,255,255,.03)", border: `1px solid ${C.bdr}`, borderRadius: 6, padding: "8px 12px", lineHeight: 1.6 }}>
                          {offerte.notities}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {(offerte.prijs || offerte.budget) && (
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: C.gold }}>
                          € {formatEuro(offerte.prijs || offerte.budget || 0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {kanReageren && (
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button onClick={() => respond(offerte, "geaccepteerd")} disabled={isReacting}
                        style={{ flex: 1, padding: "11px", background: "rgba(60,184,122,.1)", border: "1px solid rgba(60,184,122,.4)", color: C.green, fontSize: "0.62rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: isReacting ? "not-allowed" : "pointer", borderRadius: 7, opacity: isReacting ? 0.5 : 1 }}>
                        ✓ Accepteren
                      </button>
                      <button onClick={() => respond(offerte, "afgewezen")} disabled={isReacting}
                        style={{ flex: 1, padding: "11px", background: "rgba(224,90,90,.08)", border: "1px solid rgba(224,90,90,.3)", color: C.red, fontSize: "0.62rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: isReacting ? "not-allowed" : "pointer", borderRadius: 7, opacity: isReacting ? 0.5 : 1 }}>
                        ✕ Afwijzen
                      </button>
                    </div>
                  )}

                  {offerte.status === "geaccepteerd" && (
                    <div style={{ fontSize: "0.66rem", color: C.green, marginTop: 10 }}>✓ U heeft deze offerte geaccepteerd op {fmtDatum(offerte.geaccepteerd_at)}</div>
                  )}
                  {offerte.status === "afgewezen" && (
                    <div style={{ fontSize: "0.66rem", color: C.red, marginTop: 10 }}>✕ U heeft deze offerte afgewezen op {fmtDatum(offerte.geaccepteerd_at)}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </ClientLayout>
  );
}
