"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { OffertesList } from "@/components/modules/offertes/offertes-list";
import { C } from "@/lib/landing/colors";

export default function OffertesPage() {
  const { user } = useAuth();
  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Overzicht</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Offertes</h1>
        </div>
        <OffertesList companyId={user?.company_id} />
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
