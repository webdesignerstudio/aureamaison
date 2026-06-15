"use client";

import { ClientLayout } from "@/components/layout/client-layout";
import { useAuth } from "@/hooks/use-auth";
import { C } from "@/lib/landing/colors";

export default function ClientProfielPage() {
  const { user } = useAuth();
  const row = { display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid rgba(255,255,255,.04)`, fontSize: "0.72rem" };

  return (
    <ClientLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Mijn Profiel</h1>
        </div>
        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "20px 22px" }}>
          <div style={row}><span style={{ color: C.muted, minWidth: 80 }}>Naam</span><span style={{ color: C.white }}>{user?.name || "—"}</span></div>
          <div style={row}><span style={{ color: C.muted, minWidth: 80 }}>E-mail</span><span style={{ color: C.white }}>{user?.email}</span></div>
          <div style={{ ...row, borderBottom: "none" }}><span style={{ color: C.muted, minWidth: 80 }}>Rol</span><span style={{ color: C.white, textTransform: "capitalize" }}>{user?.role}</span></div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </ClientLayout>
  );
}
