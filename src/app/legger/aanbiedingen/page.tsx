"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { C } from "@/lib/landing/colors";
import { formatEuro } from "@/lib/utils";
import { LEGGER_TIERS, effectiefLeggerTier, tierHeeftMarkt, tierMaxKlussen, Abonnement } from "@/lib/tiers";

interface Aanbieding {
  id: string;
  order_id: string;
  klus_titel: string;
  klus_locatie?: string;
  aangeboden_prijs?: number;
  deadline?: string;
  status: string;
}

export default function AanbiedingenPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAanbieding, setSelectedAanbieding] = useState<Aanbieding | null>(null);
  const [reactieData, setReactieData] = useState({ prijs: "", bericht: "" });

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    })();
  }, [supabase]);

  // Fetch abonnement
  const { data: abonnement } = useQuery({
    queryKey: ["abonnement", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("abonnementen")
        .select("*")
        .eq("entity_id", userId)
        .eq("type", "legger")
        .single();
      return (data || null) as Abonnement | null;
    },
    enabled: !!userId,
  });

  const effectiveTier = effectiefLeggerTier(abonnement || null);
  const hasMarkt = tierHeeftMarkt(effectiveTier);

  // Fetch aanbiedingen
  const { data: aanbiedingen = [] } = useQuery({
    queryKey: ["aanbiedingen-legger"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aanbiedingen")
        .select("*")
        .eq("status", "open");
      if (error) throw error;
      return (data || []) as Aanbieding[];
    },
  });

  const handleReageer = async () => {
    if (!selectedAanbieding || !reactieData.prijs || !userId) return;

    const { data: legger } = await supabase
      .from("leggers")
      .select("naam")
      .eq("profiel_id", userId)
      .single();

    const { error } = await supabase.from("aanbieding_reacties").insert({
      aanbieding_id: selectedAanbieding.id,
      legger_id: userId,
      legger_naam: legger?.naam || "Onbekend",
      prijs: parseFloat(reactieData.prijs),
      bericht: reactieData.bericht || null,
      status: "wachtend",
    });

    if (!error) {
      setShowModal(false);
      setReactieData({ prijs: "", bericht: "" });
      setSelectedAanbieding(null);
      window.location.reload();
    }
  };

  const styles = {
    wrap: { padding: "20px" },
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
    upgradeBox: {
      background: "rgba(198,165,107,.1)",
      border: `1px solid ${C.gold}`,
      borderRadius: 10,
      padding: 20,
      textAlign: "center" as const,
    },
  };

  if (!hasMarkt) {
    return (
      <LeggerLayout>
        <div style={styles.wrap}>
          <div style={styles.header}>
            <h1 style={styles.title}>Aanbiedingen</h1>
            <p style={styles.subtitle}>Reageer op klussen van eigenaren</p>
          </div>

          <div style={styles.upgradeBox}>
            <div style={{ fontSize: "1.2rem", marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: C.gold, marginBottom: 8 }}>
              Upgrade naar Tier 2 of 3
            </div>
            <div style={{ fontSize: "0.7rem", color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
              De marktplaats is beschikbaar voor Tier 2 (€350/mo) en Tier 3 (€450/mo).
              Jij hebt momenteel Tier {effectiveTier}.
            </div>
            <button
              style={{
                padding: "10px 20px",
                background: `${C.gold}20`,
                border: `1px solid ${C.gold}`,
                color: C.gold,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              → Upgrade
            </button>
          </div>
        </div>
      </LeggerLayout>
    );
  }

  return (
    <LeggerLayout>
      <div style={styles.wrap}>
        <div style={styles.header}>
          <h1 style={styles.title}>Aanbiedingen</h1>
          <p style={styles.subtitle}>Reageer op klussen van eigenaren</p>
        </div>

        {aanbiedingen.length === 0 ? (
          <div style={{ ...styles.card, textAlign: "center", color: C.muted }}>
            Geen open aanbiedingen op dit moment
          </div>
        ) : (
          aanbiedingen.map((aanb) => (
            <div key={aanb.id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: C.white }}>
                    {aanb.klus_titel}
                  </div>
                  {aanb.klus_locatie && (
                    <div style={{ fontSize: "0.65rem", color: C.muted, marginTop: 4 }}>
                      📍 {aanb.klus_locatie}
                    </div>
                  )}
                  <div style={{ fontSize: "0.65rem", color: C.muted, marginTop: 4 }}>
                    Aangeboden prijs: {formatEuro(aanb.aangeboden_prijs || 0)}
                    {aanb.deadline && ` • Deadline: ${new Date(aanb.deadline).toLocaleDateString("nl-NL")}`}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedAanbieding(aanb);
                    setShowModal(true);
                  }}
                  style={{
                    padding: "8px 16px",
                    background: `${C.gold}20`,
                    border: `1px solid ${C.gold}`,
                    color: C.gold,
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                  }}
                >
                  → Reageer
                </button>
              </div>
            </div>
          ))
        )}

        {/* Modal */}
        {showModal && selectedAanbieding && (
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
            onClick={() => setShowModal(false)}
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
                Reageer op: {selectedAanbieding.klus_titel}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="number"
                  placeholder="Jouw prijs (€)"
                  value={reactieData.prijs}
                  onChange={(e) => setReactieData({ ...reactieData, prijs: e.target.value })}
                  style={{
                    padding: "10px 14px",
                    background: "rgba(255,255,255,.04)",
                    border: `1px solid ${C.bdr}`,
                    borderRadius: 6,
                    color: C.white,
                    fontSize: "0.72rem",
                  }}
                />
                <textarea
                  placeholder="Bericht (optioneel)"
                  value={reactieData.bericht}
                  onChange={(e) => setReactieData({ ...reactieData, bericht: e.target.value })}
                  style={{
                    padding: "10px 14px",
                    background: "rgba(255,255,255,.04)",
                    border: `1px solid ${C.bdr}`,
                    borderRadius: 6,
                    color: C.white,
                    fontSize: "0.72rem",
                    minHeight: 80,
                    fontFamily: "inherit",
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setShowModal(false)}
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
                    onClick={handleReageer}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: `${C.gold}20`,
                      border: `1px solid ${C.gold}`,
                      color: C.gold,
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    Verzenden
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LeggerLayout>
  );
}
