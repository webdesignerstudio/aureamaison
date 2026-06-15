"use client";

import { useParams, useRouter } from "next/navigation";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { useUpdateOrder } from "@/hooks/use-orders";
import { useToastContext } from "@/components/toast-provider";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

export default function LeggerKlusPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const toast = useToastContext();
  const updateOrder = useUpdateOrder();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [opleverOpmerking, setOpleverOpmerking] = useState("");
  const [showOplever, setShowOplever] = useState(false);

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }: { data: Order | null; error: { message: string } | null }) => {
        if (error) { console.error(error); }
        else { setOrder(data); }
        setLoading(false);
      });
  }, [id]);

  const handleStart = async () => {
    if (!order) return;
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        status: "bezig",
        legger_gestart_at: new Date().toISOString(),
      });
      setOrder((prev) => prev ? { ...prev, status: "bezig", legger_gestart_at: new Date().toISOString() } : null);
      toast.success("Klus gestart");
    } catch {
      toast.error("Starten mislukt");
    }
  };

  const handleFinish = async () => {
    if (!order) return;
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        status: "ter goedkeuring",
        legger_afgerond_at: new Date().toISOString(),
        opmerking: opleverOpmerking || order.opmerking,
      });
      setOrder((prev) => prev ? { ...prev, status: "ter goedkeuring", legger_afgerond_at: new Date().toISOString() } : null);
      setShowOplever(false);
      toast.success("Klus afgerond, wacht op goedkeuring");
    } catch {
      toast.error("Afronden mislukt");
    }
  };

  const card = { background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "18px 20px" };
  const rowStyle = { display: "flex", gap: 10, padding: "7px 0", borderBottom: `1px solid rgba(255,255,255,.04)`, fontSize: "0.7rem" };

  if (loading) return (
    <LeggerLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </LeggerLayout>
  );

  if (!order) return (
    <LeggerLayout>
      <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, color: C.red, fontSize: "0.72rem" }}>Klus niet gevonden.</div>
    </LeggerLayout>
  );

  return (
    <LeggerLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <button onClick={() => router.push("/legger")}
          style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "0.62rem", marginBottom: 16, padding: 0 }}>
          ← Terug naar overzicht
        </button>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Klus</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: "0 0 8px" }}>
              {order.uaid || order.id.slice(0, 8)}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {order.status === "gepland" && (
              <button onClick={handleStart} disabled={updateOrder.isPending}
                style={{ padding: "8px 16px", background: "rgba(74,158,232,.1)", border: "1px solid rgba(74,158,232,.25)", color: C.blue, borderRadius: 8, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                ▶ Starten
              </button>
            )}
            {order.status === "bezig" && (
              <button onClick={() => setShowOplever(true)} disabled={updateOrder.isPending}
                style={{ padding: "8px 16px", background: "rgba(60,184,122,.1)", border: "1px solid rgba(60,184,122,.25)", color: C.green, borderRadius: 8, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                ✓ Afronden
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Klant</div>
            <div style={rowStyle}><span style={{ color: C.muted, minWidth: 70 }}>Naam</span><span>{order.client_name}</span></div>
            <div style={rowStyle}><span style={{ color: C.muted, minWidth: 70 }}>Email</span><span style={{ color: C.dim }}>{order.client_email}</span></div>
            <div style={{ ...rowStyle, borderBottom: "none" }}><span style={{ color: C.muted, minWidth: 70 }}>Adres</span><span style={{ color: C.dim }}>{order.straat}, {order.postcode} {order.plaats}</span></div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Project</div>
            <div style={rowStyle}><span style={{ color: C.muted, minWidth: 90 }}>Vloertype</span><span style={{ color: C.dim }}>{order.vloer_type || "—"}</span></div>
            <div style={rowStyle}><span style={{ color: C.muted, minWidth: 90 }}>Oppervlakte</span><span style={{ color: C.dim }}>{order.oppervlakte ? `${order.oppervlakte} m²` : "—"}</span></div>
            <div style={{ ...rowStyle, borderBottom: order.datum ? undefined : "none" }}><span style={{ color: C.muted, minWidth: 90 }}>Ondergrond</span><span style={{ color: C.dim }}>{order.ondergrond || "—"}</span></div>
            {order.datum && <div style={{ ...rowStyle, borderBottom: "none" }}><span style={{ color: C.muted, minWidth: 90 }}>Datum</span><span style={{ color: C.dim }}>{formatDate(order.datum)}</span></div>}
          </div>

          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Financieel</div>
            <div style={rowStyle}><span style={{ color: C.muted, minWidth: 80 }}>Uw prijs</span><span style={{ color: C.gold }}>{order.legger_prijs ? `€ ${order.legger_prijs}` : "—"}</span></div>
            <div style={rowStyle}><span style={{ color: C.muted, minWidth: 80 }}>Gestart</span><span style={{ color: C.dim }}>{order.legger_gestart_at ? formatDate(order.legger_gestart_at) : "—"}</span></div>
            <div style={{ ...rowStyle, borderBottom: "none" }}><span style={{ color: C.muted, minWidth: 80 }}>Afgerond</span><span style={{ color: C.dim }}>{order.legger_afgerond_at ? formatDate(order.legger_afgerond_at) : "—"}</span></div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Opmerking</div>
            <p style={{ fontSize: "0.7rem", color: C.dim, margin: 0, lineHeight: 1.6 }}>{order.opmerking || "Geen opmerkingen."}</p>
          </div>
        </div>
      </div>

      {showOplever && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.8)", padding: 20 }}
          onClick={() => setShowOplever(false)}>
          <div style={{ background: C.deep, border: `1px solid ${C.green}44`, borderRadius: 14, padding: 24, maxWidth: 440, width: "100%" }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.green, margin: "0 0 10px" }}>Klus afronden</h3>
            <p style={{ fontSize: "0.68rem", color: C.muted, marginBottom: 14 }}>Bevestig dat de klus volledig is afgerond.</p>
            <textarea value={opleverOpmerking} onChange={(e) => setOpleverOpmerking(e.target.value)} placeholder="Opmerkingen over de klus…" rows={3}
              style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", boxSizing: "border-box", resize: "vertical" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={() => setShowOplever(false)} style={{ flex: 1, padding: "10px", background: "none", border: `1px solid ${C.bdr}`, color: C.muted, borderRadius: 8, fontSize: "0.6rem", cursor: "pointer" }}>Annuleren</button>
              <button onClick={handleFinish} disabled={updateOrder.isPending} style={{ flex: 1, padding: "10px", background: "rgba(60,184,122,.1)", border: "1px solid rgba(60,184,122,.25)", color: C.green, borderRadius: 8, fontSize: "0.6rem", cursor: "pointer" }}>
                {updateOrder.isPending ? "Bezig…" : "Bevestig afronding"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </LeggerLayout>
  );
}
