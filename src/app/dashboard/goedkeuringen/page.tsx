"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { C } from "@/lib/landing/colors";

interface Goedkeuring {
  id: string;
  type: string;
  omschrijving: string;
  aangevraagd_door_naam: string;
  status: "open" | "goedgekeurd" | "afgewezen";
  created_at: string;
}

export default function GoedkeuringenPage() {
  const supabase = createClient();
  const [companyId, setCompanyId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reden, setReden] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();
        if (profile?.company_id) {
          setCompanyId(profile.company_id);
        }
      }
    })();
  }, [supabase]);

  const { data: goedkeuringen = [] } = useQuery({
    queryKey: ["goedkeuringen", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("goedkeuringen")
        .select("*")
        .eq("company_id", companyId)
        .eq("status", "open");
      if (error) throw error;
      return (data || []) as Goedkeuring[];
    },
    enabled: !!companyId,
  });

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("goedkeuringen")
      .update({ status: "goedgekeurd" })
      .eq("id", id);
    if (!error) window.location.reload();
  };

  const handleReject = async (id: string) => {
    if (!reden) return;
    const { error } = await supabase
      .from("goedkeuringen")
      .update({ status: "afgewezen", reden })
      .eq("id", id);
    if (!error) {
      setSelectedId(null);
      setReden("");
      window.location.reload();
    }
  };

  const styles = {
    wrap: { padding: "20px", maxWidth: 1000, margin: "0 auto" },
    header: { marginBottom: 24 },
    title: {
      fontFamily: "'Cormorant Garamond',serif",
      fontSize: "2rem",
      fontWeight: 300,
      color: C.white,
      margin: "0 0 8px",
    },
    subtitle: { fontSize: "0.72rem", color: C.muted },
    card: {
      background: C.deep,
      border: `1px solid ${C.bdr}`,
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
    },
  };

  return (
    <DashboardLayout>
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>Goedkeuringen</h1>
        <p style={styles.subtitle}>High-risk acties vereisen goedkeuring</p>
      </div>

      {goedkeuringen.length === 0 ? (
        <div style={{ ...styles.card, textAlign: "center", color: C.muted }}>
          Geen openstaande goedkeuringen
        </div>
      ) : (
        goedkeuringen.map((g) => (
          <div key={g.id} style={styles.card}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: C.white }}>
                {g.type}
              </div>
              <div style={{ fontSize: "0.65rem", color: C.muted, marginTop: 4 }}>
                {g.omschrijving}
              </div>
              <div style={{ fontSize: "0.65rem", color: C.muted, marginTop: 4 }}>
                Aangevraagd door: {g.aangevraagd_door_naam}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleApprove(g.id)}
                style={{
                  padding: "8px 16px",
                  background: "rgba(60,184,122,.2)",
                  border: "1px solid rgba(60,184,122,.3)",
                  color: "#3CB87A",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                ✓ Goedkeuren
              </button>
              <button
                onClick={() => setSelectedId(g.id)}
                style={{
                  padding: "8px 16px",
                  background: "rgba(224,90,90,.2)",
                  border: "1px solid rgba(224,90,90,.3)",
                  color: "#E05A5A",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                ✕ Afwijzen
              </button>
            </div>
          </div>
        ))
      )}

      {/* Reject Modal */}
      {selectedId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setSelectedId(null)}
        >
          <div
            style={{
              background: C.deep,
              border: `1px solid ${C.bdr}`,
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: C.white, margin: "0 0 16px" }}>
              Reden voor afwijzing
            </h2>
            <textarea
              value={reden}
              onChange={(e) => setReden(e.target.value)}
              placeholder="Vul een reden in..."
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255,255,255,.04)",
                border: `1px solid ${C.bdr}`,
                borderRadius: 6,
                color: C.white,
                fontSize: "0.72rem",
                minHeight: 80,
                fontFamily: "inherit",
                marginBottom: 12,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "transparent",
                  border: `1px solid ${C.bdr}`,
                  color: C.muted,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                Annuleren
              </button>
              <button
                onClick={() => handleReject(selectedId)}
                disabled={!reden}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: reden ? "rgba(224,90,90,.2)" : "rgba(224,90,90,.05)",
                  border: `1px solid ${reden ? "rgba(224,90,90,.3)" : "rgba(224,90,90,.1)"}`,
                  color: reden ? "#E05A5A" : "#94a3b8",
                  borderRadius: 6,
                  cursor: reden ? "pointer" : "not-allowed",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                Afwijzen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
