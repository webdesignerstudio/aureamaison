"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { SettingsForm } from "@/components/modules/settings/settings-form";
import { C } from "@/lib/landing/colors";

export default function SettingsPage() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Beheer</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Instellingen</h1>
        </div>
        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "22px 24px" }}>
          <SettingsForm companyId={companyId || ""} user={user || undefined} />
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
