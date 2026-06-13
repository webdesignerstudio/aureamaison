"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { C } from "@/lib/landing/colors";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

function usePendingLeggers(companyId?: string | null) {
  return useQuery({
    queryKey: ["pending_leggers", companyId],
    queryFn: async () => {
      const supabase = createClient();
      let q = supabase
        .from("profiles")
        .select("*")
        .eq("role", "legger")
        .order("created_at", { ascending: false });
      if (companyId) q = q.eq("company_id", companyId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as Profile[]) || [];
    },
    enabled: !!companyId,
  });
}

function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Profile>) => {
      const supabase = createClient();
      const { data, error } = await supabase.from("profiles").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pending_leggers"] }); },
  });
}

export default function AanmeldingenPage() {
  const { user } = useAuth();
  const { data: leggers = [], isLoading } = usePendingLeggers(user?.company_id);
  const updateProfile = useUpdateProfile();
  const [expanded, setExpanded] = useState<string | null>(null);

  const pending = leggers.filter((l) => l.onboarding_status === "pending");
  const approved = leggers.filter((l) => l.onboarding_status === "approved");
  const rejected = leggers.filter((l) => l.onboarding_status === "rejected");

  const beoordeel = (id: string, besluit: "approved" | "rejected") => {
    updateProfile.mutate({ id, onboarding_status: besluit });
  };

  const statusKleur = (s: string) => ({ pending: C.orange, approved: C.green, rejected: C.red }[s] || C.dim);
  const statusLabel = (s: string) => ({ pending: "WACHT", approved: "GOEDGEKEURD", rejected: "AFGEWEZEN" }[s] || s.toUpperCase());

  const LeggerCard = ({ l, showActions }: { l: Profile; showActions?: boolean }) => (
    <div style={{ background: C.deep, border: `1px solid ${l.onboarding_status === "pending" ? "rgba(232,145,58,.3)" : C.bdr}`, borderRadius: 12, padding: "16px 18px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: "0.84rem", fontWeight: 600, color: C.white, marginBottom: 3 }}>{l.name || l.email}</div>
          <div style={{ fontSize: "0.62rem", color: C.muted }}>{l.email}</div>
          <div style={{ fontSize: "0.56rem", color: C.dim, marginTop: 3 }}>Aangemeld: {new Date(l.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ padding: "2px 10px", borderRadius: 99, background: statusKleur(l.onboarding_status || "") + "22", border: `1px solid ${statusKleur(l.onboarding_status || "")}44`, color: statusKleur(l.onboarding_status || ""), fontSize: "0.54rem", fontWeight: 700 }}>
            {statusLabel(l.onboarding_status || "")}
          </span>
          <button onClick={() => setExpanded(expanded === l.id ? null : l.id)}
            style={{ padding: "6px 12px", background: "rgba(198,165,107,.08)", border: `1px solid ${C.bdr}`, color: C.gold, fontSize: "0.58rem", fontWeight: 700, letterSpacing: 1, cursor: "pointer", borderRadius: 7 }}>
            {expanded === l.id ? "▲" : "▼ Details"}
          </button>
        </div>
      </div>

      {expanded === l.id && (
        <div style={{ paddingTop: 14, borderTop: `1px solid rgba(255,255,255,.06)`, animation: "slideUp .2s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
            {[
              ["Naam", l.name || "—"],
              ["E-mail", l.email],
              ["Rol", l.role],
              ["Status", statusLabel(l.onboarding_status || "")],
            ].map(([label, val]) => (
              <div key={label} style={{ padding: "8px 10px", background: "rgba(255,255,255,.02)", borderRadius: 6 }}>
                <div style={{ fontSize: "0.48rem", letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "0.68rem", color: C.white }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            <a href={`mailto:${l.email}`} style={{ padding: "5px 12px", background: "rgba(74,158,232,.08)", border: "1px solid rgba(74,158,232,.25)", borderRadius: 6, fontSize: "0.54rem", color: C.blue, textDecoration: "none" }}>✉ E-mail sturen</a>
          </div>

          {/* Onboarding data */}
          {l.onboarding_data && Object.keys(l.onboarding_data).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>Aanmelding gegevens</div>
              <pre style={{ color: C.muted, fontFamily: "monospace", fontSize: "0.58rem", whiteSpace: "pre-wrap", wordBreak: "break-all", padding: "10px 12px", background: "rgba(255,255,255,.02)", border: `1px solid ${C.bdr}`, borderRadius: 7, margin: 0, maxHeight: 100, overflowY: "auto" }}>
                {JSON.stringify(l.onboarding_data, null, 2)}
              </pre>
            </div>
          )}

          {showActions && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => beoordeel(l.id, "rejected")}
                style={{ flex: 1, padding: "9px", background: "rgba(224,90,90,.08)", border: "1px solid rgba(224,90,90,.3)", color: C.red, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 8 }}>
                ✗ Afwijzen
              </button>
              <button onClick={() => beoordeel(l.id, "approved")}
                style={{ flex: 2, padding: "9px", background: "rgba(60,184,122,.08)", border: "1px solid rgba(60,184,122,.3)", color: C.green, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 8 }}>
                ✓ Goedkeuren
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Beheer</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Legger <em style={{ fontStyle: "italic", color: C.goldL }}>Aanmeldingen</em>
          </h1>
        </div>

        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 10, marginBottom: 24 }}>
          {[
            ["⏳", "Wachtend", pending.length, C.orange],
            ["✅", "Goedgekeurd", approved.length, C.green],
            ["❌", "Afgewezen", rejected.length, C.red],
            ["👷", "Totaal", leggers.length, C.white],
          ].map(([ic, lbl, val, col]) => (
            <div key={lbl as string} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{ic}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", color: col as string, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: "0.44rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ color: C.muted, fontSize: "0.72rem", padding: "20px 0" }}>Laden…</div>
        ) : (
          <>
            {/* Wachtend */}
            {pending.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: "0.56rem", letterSpacing: 2.5, color: C.orange, textTransform: "uppercase", marginBottom: 10 }}>
                  Wacht op beoordeling ({pending.length})
                </div>
                {pending.map((l) => <LeggerCard key={l.id} l={l} showActions />)}
              </div>
            )}

            {/* Approved */}
            {approved.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: "0.56rem", letterSpacing: 2.5, color: C.green, textTransform: "uppercase", marginBottom: 10 }}>
                  Goedgekeurd ({approved.length})
                </div>
                {approved.map((l) => <LeggerCard key={l.id} l={l} />)}
              </div>
            )}

            {/* Rejected */}
            {rejected.length > 0 && (
              <div>
                <div style={{ fontSize: "0.56rem", letterSpacing: 2.5, color: C.red, textTransform: "uppercase", marginBottom: 10 }}>
                  Afgewezen ({rejected.length})
                </div>
                {rejected.map((l) => <LeggerCard key={l.id} l={l} />)}
              </div>
            )}

            {leggers.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>👷</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.muted }}>Geen legger aanmeldingen gevonden</div>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes slideUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:translateY(0) } }`}</style>
    </DashboardLayout>
  );
}
