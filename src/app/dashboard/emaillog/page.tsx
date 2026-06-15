"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { C } from "@/lib/landing/colors";
import type { Order } from "@/types";

type EmailEvent = {
  id: string;
  type: string;
  label: string;
  color: string;
  aan: string;
  onderwerp: string;
  datum: string;
};

function deriveEvents(orders: Order[]): EmailEvent[] {
  const events: EmailEvent[] = [];
  for (const o of orders) {
    if (o.invoice_nr) {
      events.push({
        id: `${o.id}-factuur`,
        type: "factuur_aangemaakt",
        label: "Factuur aangemaakt",
        color: C.gold,
        aan: o.client_email || o.client_name || "—",
        onderwerp: `Factuur ${o.invoice_nr} — ${o.client_name}`,
        datum: o.updated_at || o.created_at,
      });
    }
    if (o.mollie_checkout_url) {
      events.push({
        id: `${o.id}-betaallink`,
        type: "betaallink",
        label: "Betaallink (iDEAL)",
        color: C.blue,
        aan: o.client_email || o.client_name || "—",
        onderwerp: `Betaallink verstuurd — ${o.invoice_nr || o.client_name}`,
        datum: o.updated_at || o.created_at,
      });
    }
    if (o.invoice_paid) {
      events.push({
        id: `${o.id}-betaald`,
        type: "betaling_ontvangen",
        label: "Betaling ontvangen",
        color: C.green,
        aan: o.client_email || o.client_name || "—",
        onderwerp: `Betaling ontvangen — ${o.invoice_nr || o.client_name}`,
        datum: o.updated_at || o.created_at,
      });
    }
  }
  return events.sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());
}

const TYPE_LABELS: Record<string, string> = {
  factuur_aangemaakt: "Factuur",
  betaallink: "Betaallink",
  betaling_ontvangen: "Betaald",
};

export default function EmailLogPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("alles");

  useEffect(() => {
    if (!user?.company_id) return;
    const supabase = createClient();
    supabase.from("orders").select("*").eq("company_id", user.company_id)
      .order("updated_at", { ascending: false })
      .then((res: { data: unknown }) => { setOrders((res.data as Order[]) || []); setLoading(false); });
  }, [user?.company_id]);

  const events = deriveEvents(orders);
  const filtered = filter === "alles" ? events : events.filter((e) => e.type === filter);

  const types = ["alles", "factuur_aangemaakt", "betaallink", "betaling_ontvangen"];
  const typeColor = (t: string) => ({ factuur_aangemaakt: C.gold, betaallink: C.blue, betaling_ontvangen: C.green }[t] || C.muted);

  if (loading) return (
    <DashboardLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Communicatie</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            E-mail <em style={{ fontStyle: "italic", color: C.goldL }}>Log</em>
          </h1>
        </div>

        <div style={{ padding: "12px 16px", background: "rgba(198,165,107,.06)", border: `1px solid ${C.bdr}`, borderRadius: 8, marginBottom: 18, fontSize: "0.68rem", color: C.muted, lineHeight: 1.8 }}>
          📧 E-mails worden verstuurd via <strong style={{ color: C.white }}>Resend</strong> vanuit de API routes. Hieronder staan de e-mail-events afgeleid uit de orderdata.
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {types.map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ padding: "6px 14px", borderRadius: 99, border: `1px solid ${filter === t ? typeColor(t) : C.bdr}`, background: filter === t ? typeColor(t) + "18" : "transparent", color: filter === t ? typeColor(t) : C.muted, fontSize: "0.58rem", fontWeight: filter === t ? 700 : 400, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}>
              {t === "alles" ? "Alles" : TYPE_LABELS[t] || t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "48px 0", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📭</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 300 }}>Nog geen e-mail events</div>
            <div style={{ fontSize: "0.68rem", color: C.muted, marginTop: 6 }}>Events verschijnen zodra facturen worden aangemaakt en betalingen worden ontvangen.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((e) => (
              <div key={e.id} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: "0.54rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: e.color + "18", border: `1px solid ${e.color}44`, color: e.color }}>
                        {e.label}
                      </span>
                      <span style={{ fontSize: "0.58rem", color: C.green }}>● verzonden</span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: C.white, fontWeight: 500 }}>{e.onderwerp}</div>
                    <div style={{ fontSize: "0.62rem", color: C.muted, marginTop: 3 }}>→ {e.aan}</div>
                  </div>
                  <div style={{ fontSize: "0.6rem", color: C.dim, textAlign: "right", flexShrink: 0 }}>
                    {e.datum ? new Date(e.datum).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
