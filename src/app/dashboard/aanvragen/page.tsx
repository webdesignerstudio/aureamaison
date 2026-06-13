"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useShowroomAanvragen, useUpdateShowroom } from "@/hooks/use-showroom";
import { C } from "@/lib/landing/colors";

const statusKleur: Record<string, string> = {
  open: "rgba(74,158,232,.15)",
  afgerond: "rgba(60,184,122,.15)",
  geannuleerd: "rgba(100,100,100,.15)",
};
const statusTekst: Record<string, string> = {
  open: C.blue,
  afgerond: C.green,
  geannuleerd: C.dim,
};

export default function AanvragenPage() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(user?.company_id);
  const { data: showroom = [], isLoading } = useShowroomAanvragen(user?.company_id);
  const updateShowroom = useUpdateShowroom();

  const [sub, setSub] = useState<"offertes" | "showroom">("offertes");
  const [search, setSearch] = useState("");

  // Orders ingediend via website (status=ingediend of bron aanwezig)
  const offertesAanvragen = orders.filter((o) => (o.status || "").toLowerCase() === "ingediend");
  const filteredOffertes = offertesAanvragen.filter((o) =>
    !search || [o.client_name, o.vloer_type, o.postcode, o.status].join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const filteredShowroom = showroom.filter((s) =>
    !search || [s.naam, s.adres, s.postcode, s.status].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const inp = {
    width: "100%", padding: "9px 14px", background: C.deep, border: `1px solid ${C.bdr}`,
    borderRadius: 7, color: C.white, fontSize: "0.72rem", boxSizing: "border-box" as const,
  };

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Dashboard</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Website <em style={{ fontStyle: "italic", color: C.goldL }}>Aanvragen</em>
          </h1>
          <p style={{ fontSize: "0.65rem", color: C.dim, marginTop: 6, lineHeight: 1.6 }}>
            Alle offerte- en showroom aanvragen binnengekomen via de website.
          </p>
        </div>

        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 24 }}>
          {[
            ["📋", "Offerte aanvragen", offertesAanvragen.length, C.blue],
            ["🏠", "Showroom aanvragen", showroom.length, C.gold],
            ["🆕", "Open (showroom)", showroom.filter((s) => s.status === "open").length, C.green],
          ].map(([ic, lbl, count, kleur]) => (
            <div key={lbl as string} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{ic}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", color: kleur as string, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: "0.44rem", letterSpacing: 1.5, color: C.dim, textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Sub-tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.bdr}`, marginBottom: 18 }}>
          {([["offertes", "📋 Offertes", offertesAanvragen.length], ["showroom", "🏠 Showroom", showroom.length]] as [string, string, number][]).map(([id, lbl, count]) => (
            <button key={id} onClick={() => { setSub(id as "offertes" | "showroom"); setSearch(""); }}
              style={{ flex: 1, padding: "11px 8px", fontSize: "0.6rem", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: sub === id ? C.white : C.muted, background: "none", border: "none", cursor: "pointer", borderBottom: sub === id ? `2px solid ${C.gold}` : "2px solid transparent", marginBottom: -1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {lbl}
              <span style={{ background: sub === id ? "rgba(198,165,107,.2)" : "rgba(255,255,255,.05)", padding: "1px 7px", borderRadius: 99, fontSize: "0.55rem", color: sub === id ? C.gold : C.dim }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={sub === "offertes" ? "🔍 Zoek op naam, vloertype, postcode…" : "🔍 Zoek op naam, adres, postcode…"}
          style={{ ...inp, marginBottom: 16 }} />

        {/* ── OFFERTE AANVRAGEN ── */}
        {sub === "offertes" && (
          <div>
            {filteredOffertes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.muted }}>Geen offerte aanvragen {search ? "gevonden" : "ingediend"}</div>
              </div>
            ) : filteredOffertes.map((o) => (
              <div key={o.id} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "16px 18px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.white, marginBottom: 4 }}>{o.client_name || "Onbekend"}</div>
                    <div style={{ fontSize: "0.62rem", color: C.muted, marginBottom: 3 }}>{o.client_email}</div>
                    <div style={{ fontSize: "0.62rem", color: C.dim }}>
                      {o.vloer_type && <span style={{ marginRight: 10 }}>🪵 {o.vloer_type}</span>}
                      {o.oppervlakte && <span style={{ marginRight: 10 }}>📐 {o.oppervlakte} m²</span>}
                      {o.postcode && <span>📍 {o.postcode}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.56rem", padding: "3px 10px", borderRadius: 99, background: "rgba(74,158,232,.12)", color: C.blue, fontWeight: 700 }}>INGEDIEND</span>
                    {o.price && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem", color: C.gold, marginTop: 6 }}>€ {Number(o.price).toLocaleString("nl-NL")}</div>}
                    <div style={{ fontSize: "0.52rem", color: C.dim, marginTop: 4 }}>{o.created_at ? new Date(o.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SHOWROOM AANVRAGEN ── */}
        {sub === "showroom" && (
          <div>
            {isLoading ? (
              <div style={{ color: C.muted, fontSize: "0.72rem", padding: "20px 0" }}>Laden…</div>
            ) : filteredShowroom.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🏠</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.muted }}>Geen showroom aanvragen {search ? "gevonden" : "ontvangen"}</div>
              </div>
            ) : filteredShowroom.map((s) => (
              <div key={s.id} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "16px 18px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.white, marginBottom: 3 }}>{s.naam}</div>
                    <div style={{ fontSize: "0.62rem", color: C.muted, marginBottom: 2 }}>{s.email}{s.telefoon && ` · ${s.telefoon}`}</div>
                    {s.adres && <div style={{ fontSize: "0.62rem", color: C.dim }}>📍 {s.adres}{s.postcode && ` · ${s.postcode}`}</div>}
                    {s.datum_voorkeur && <div style={{ fontSize: "0.6rem", color: C.muted, marginTop: 3 }}>📅 {new Date(s.datum_voorkeur).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</div>}
                    {s.opmerking && <div style={{ fontSize: "0.6rem", color: C.dim, marginTop: 4, fontStyle: "italic" }}>{s.opmerking}</div>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.56rem", padding: "3px 10px", borderRadius: 99, background: statusKleur[s.status] || "rgba(255,255,255,.05)", color: statusTekst[s.status] || C.muted, fontWeight: 700, textTransform: "uppercase" }}>{s.status}</span>
                    <div style={{ fontSize: "0.52rem", color: C.dim, marginTop: 4 }}>{new Date(s.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 8, justifyContent: "flex-end" }}>
                      {s.status === "open" && (
                        <button onClick={() => updateShowroom.mutate({ id: s.id, status: "afgerond" })}
                          style={{ fontSize: "0.54rem", padding: "4px 10px", background: "rgba(60,184,122,.08)", border: "1px solid rgba(60,184,122,.25)", color: C.green, borderRadius: 6, cursor: "pointer" }}>
                          ✓ Afgerond
                        </button>
                      )}
                      {s.status !== "geannuleerd" && (
                        <button onClick={() => updateShowroom.mutate({ id: s.id, status: "geannuleerd" })}
                          style={{ fontSize: "0.54rem", padding: "4px 10px", background: "rgba(224,90,90,.06)", border: "1px solid rgba(224,90,90,.2)", color: C.red, borderRadius: 6, cursor: "pointer" }}>
                          ✗
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:translateY(0) } }`}</style>
    </DashboardLayout>
  );
}
