"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { GoldButton } from "@/components/ui/gold-button";
import { formatEuro, formatDate, generateUAID } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { useUpdateOfferte } from "@/hooks/use-offertes";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToastContext } from "@/components/toast-provider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Offerte } from "@/types";

export default function OfferteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const toast = useToastContext();
  const router = useRouter();
  const updateOfferte = useUpdateOfferte();
  const createOrder = useCreateOrder();

  const [offerte, setOfferte] = useState<Offerte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    supabase
      .from("offertes")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error: fetchError }: { data: Offerte | null; error: { message: string } | null }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setOfferte(data);
        }
        setLoading(false);
      });
  }, [id]);

  const handleStatus = async (newStatus: Offerte["status"]) => {
    if (!offerte) return;
    try {
      await updateOfferte.mutateAsync({ id: offerte.id, status: newStatus });
      setOfferte((prev) => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Status: ${newStatus}`);
    } catch {
      toast.error("Status wijzigen mislukt");
    }
  };

  const handleConvertToOrder = async () => {
    if (!offerte) return;
    try {
      const newOrder = await createOrder.mutateAsync({
        uaid: generateUAID(),
        client_name: offerte.client_name,
        client_email: offerte.client_email,
        vloer_type: offerte.vloer_type,
        oppervlakte: offerte.oppervlakte,
        budget: offerte.budget,
        status: "ingediend",
        company_id: offerte.company_id,
      });
      toast.success("Offerte omgezet naar order");
      router.push(`/dashboard/orders/${newOrder.id}`);
    } catch {
      toast.error("Omzetten mislukt");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: C.muted, fontSize: "0.8rem" }}>Laden…</div>
      </DashboardLayout>
    );
  }

  if (error || !offerte) {
    return (
      <DashboardLayout>
        <div style={{ padding: "14px 16px", borderRadius: 8, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, color: C.red, fontSize: "0.72rem" }}>
          {error || "Offerte niet gevonden."}
        </div>
      </DashboardLayout>
    );
  }

  const statusActions: Record<string, Offerte["status"][]> = {
    ingediend: ["verstuurd"],
    verstuurd: ["geaccepteerd", "afgewezen"],
  };
  const nextStatuses = statusActions[offerte.status] || [];
  const card = { background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "18px 20px" };
  const lbl = { fontSize: "0.58rem", color: C.dim, marginBottom: 2 };
  const val = { fontSize: "0.72rem", color: C.white };

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
          <div>
            <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Offerte</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
              {offerte.client_name}
            </h1>
            <div style={{ marginTop: 8 }}><StatusBadge status={offerte.status} /></div>
          </div>
          {offerte.status === "geaccepteerd" && (
            <GoldButton onClick={handleConvertToOrder} size="sm">Omzetten naar order →</GoldButton>
          )}
        </div>

        {nextStatuses.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {nextStatuses.map((s) => (
              <button key={s} onClick={() => handleStatus(s)} disabled={updateOfferte.isPending}
                style={{ padding: "7px 14px", borderRadius: 7, background: C.goldD, border: `1px solid ${C.bdr}`, color: C.gold, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", opacity: updateOfferte.isPending ? 0.5 : 1 }}>
                → {s}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Klant</div>
            {[["Naam", offerte.client_name], ["Email", offerte.client_email]].map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}><div style={lbl}>{k}</div><div style={val}>{v}</div></div>
            ))}
          </div>

          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Project</div>
            {[
              ["Vloertype", offerte.vloer_type || "—"],
              ["Oppervlakte", offerte.oppervlakte ? `${offerte.oppervlakte} m²` : "—"],
              ["Budget", offerte.budget ? `€ ${formatEuro(offerte.budget)}` : "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}><div style={lbl}>{k}</div><div style={val}>{v}</div></div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: "0.56rem", color: C.dim }}>
          Aangemaakt: {formatDate(offerte.created_at)}
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
