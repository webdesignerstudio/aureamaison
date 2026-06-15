"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { OrdersList } from "@/components/modules/orders/orders-list";
import { OrderForm } from "@/components/modules/orders/order-form";
import { GoldButton } from "@/components/ui/gold-button";
import { C } from "@/lib/landing/colors";

export default function OrdersPage() {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const companyId = user?.company_id;

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, gap: 12 }}>
          <div>
            <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Overzicht</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Opdrachten</h1>
          </div>
          <GoldButton onClick={() => setShowForm(true)} size="sm">+ Nieuw</GoldButton>
        </div>

        {showForm && (
          <div style={{ marginBottom: 22, background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase" }}>Nieuwe order</div>
              <button onClick={() => setShowForm(false)}
                style={{ fontSize: "0.6rem", color: C.muted, background: "none", border: "none", cursor: "pointer" }}>✕ Annuleren</button>
            </div>
            <OrderForm companyId={companyId || ""} onSuccess={() => setShowForm(false)} />
          </div>
        )}

        <OrdersList companyId={companyId} />
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
