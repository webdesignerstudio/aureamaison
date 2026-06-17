"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { C } from "@/lib/landing/colors";
import { formatEuro } from "@/lib/utils";

interface Aanbieding {
  id: string;
  order_id: string;
  klus_titel: string;
  klus_locatie?: string;
  aangeboden_prijs?: number;
  deadline?: string;
  status: string;
  created_at: string;
}

interface Reactie {
  id: string;
  aanbieding_id: string;
  legger_naam: string;
  prijs: number;
  bericht?: string;
  status: string;
}

interface Order {
  id: string;
  clientName: string;
  price?: number;
  status: string;
  legger_id?: string;
}

export default function MarktplaatsPage() {
  const supabase = createClient();
  const [companyId, setCompanyId] = useState("");
  const [sub, setSub] = useState<"klussen" | "aanbiedingen">("klussen");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ titel: "", prijs: "", deadline: "" });

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

  // Fetch orders zonder legger
  const { data: orders = [] } = useQuery({
    queryKey: ["orders-no-legger", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("company_id", companyId)
        .is("legger_id", null);
      if (error) throw error;
      return (data || []) as Order[];
    },
    enabled: !!companyId,
  });

  // Fetch aanbiedingen
  const { data: aanbiedingen = [] } = useQuery({
    queryKey: ["aanbiedingen", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("aanbiedingen")
        .select("*")
        .eq("company_id", companyId);
      if (error) throw error;
      return (data || []) as Aanbieding[];
    },
    enabled: !!companyId,
  });

  // Fetch reacties
  const { data: reacties = [] } = useQuery({
    queryKey: ["reacties", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("aanbieding_reacties")
        .select("*");
      if (error) throw error;
      return (data || []) as Reactie[];
    },
    enabled: !!companyId,
  });

  const handlePlaceAanbieding = async () => {
    if (!selectedOrder || !modalData.titel) return;
    const { error } = await supabase.from("aanbiedingen").insert({
      order_id: selectedOrder,
      klus_titel: modalData.titel,
      aangeboden_prijs: modalData.prijs ? parseFloat(modalData.prijs) : null,
      deadline: modalData.deadline || null,
      status: "open",
      company_id: companyId,
    });
    if (!error) {
      setShowModal(false);
      setModalData({ titel: "", prijs: "", deadline: "" });
      setSelectedOrder(null);
      window.location.reload();
    }
  };

  const handleAcceptReactie = async (reactieId: string) => {
    const { error } = await supabase
      .from("aanbieding_reacties")
      .update({ status: "geaccepteerd" })
      .eq("id", reactieId);
    if (!error) window.location.reload();
  };

  const styles = {
    wrap: { padding: "20px", maxWidth: 1200, margin: "0 auto" },
    header: { marginBottom: 24 },
    title: {
      fontFamily: "'Cormorant Garamond',serif",
      fontSize: "2rem",
      fontWeight: 300,
      color: C.white,
      margin: "0 0 8px",
    },
    subtitle: { fontSize: "0.72rem", color: C.muted },
    tabs: {
      display: "flex",
      gap: 12,
      marginBottom: 20,
      borderBottom: `1px solid ${C.bdr}`,
      paddingBottom: 12,
    },
    tab: (active: boolean) => ({
      padding: "8px 16px",
      background: active ? `${C.gold}20` : "transparent",
      border: `1px solid ${active ? C.gold : C.bdr}`,
      borderRadius: 6,
      color: active ? C.gold : C.muted,
      cursor: "pointer",
      fontSize: "0.72rem",
      fontWeight: 600,
    }),
    card: {
      background: C.deep,
      border: `1px solid ${C.bdr}`,
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
    },
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>Marktplaats</h1>
        <p style={styles.subtitle}>Plaats klussen op de markt, ontvang reacties van leggers</p>
      </div>

      <div style={styles.tabs}>
        {(["klussen", "aanbiedingen"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSub(tab)}
            style={styles.tab(sub === tab)}
          >
            {tab === "klussen" && "📋 Openstaande klussen"}
            {tab === "aanbiedingen" && "📨 Aanbiedingen"}
          </button>
        ))}
      </div>

      {/* Klussen Tab */}
      {sub === "klussen" && (
        <div>
          {orders.length === 0 ? (
            <div style={{ ...styles.card, textAlign: "center", color: C.muted }}>
              Geen openstaande klussen zonder legger
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: C.white }}>
                      {order.clientName}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: C.muted }}>
                      Status: {order.status} • Prijs: {formatEuro(order.price || 0)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrder(order.id);
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
                    → Naar markt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Aanbiedingen Tab */}
      {sub === "aanbiedingen" && (
        <div>
          {aanbiedingen.length === 0 ? (
            <div style={{ ...styles.card, textAlign: "center", color: C.muted }}>
              Geen aanbiedingen geplaatst
            </div>
          ) : (
            aanbiedingen.map((aanb) => {
              const aanb_reacties = reacties.filter((r) => r.aanbieding_id === aanb.id);
              return (
                <div key={aanb.id} style={styles.card}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: C.white }}>
                      {aanb.klus_titel}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: C.muted }}>
                      Status: {aanb.status} • Prijs: {formatEuro(aanb.aangeboden_prijs || 0)}
                    </div>
                  </div>

                  {aanb_reacties.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.bdr}` }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: C.gold, marginBottom: 8 }}>
                        {aanb_reacties.length} reactie(s)
                      </div>
                      {aanb_reacties.map((reactie) => (
                        <div
                          key={reactie.id}
                          style={{
                            background: "rgba(255,255,255,.02)",
                            padding: 10,
                            borderRadius: 6,
                            marginBottom: 8,
                            fontSize: "0.65rem",
                          }}
                        >
                          <div style={{ color: C.white, fontWeight: 600 }}>
                            {reactie.legger_naam} — {formatEuro(reactie.prijs)}
                          </div>
                          {reactie.bericht && (
                            <div style={{ color: C.muted, marginTop: 4 }}>{reactie.bericht}</div>
                          )}
                          {reactie.status === "wachtend" && (
                            <button
                              onClick={() => handleAcceptReactie(reactie.id)}
                              style={{
                                marginTop: 8,
                                padding: "4px 10px",
                                background: "rgba(60,184,122,.2)",
                                border: "1px solid rgba(60,184,122,.3)",
                                color: "#3CB87A",
                                borderRadius: 4,
                                fontSize: "0.6rem",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              ✓ Gunnen
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
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
              Klus naar markt
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Klusbeschrijving"
                value={modalData.titel}
                onChange={(e) => setModalData({ ...modalData, titel: e.target.value })}
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.04)",
                  border: `1px solid ${C.bdr}`,
                  borderRadius: 6,
                  color: C.white,
                  fontSize: "0.72rem",
                }}
              />
              <input
                type="number"
                placeholder="Aangeboden prijs (€)"
                value={modalData.prijs}
                onChange={(e) => setModalData({ ...modalData, prijs: e.target.value })}
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.04)",
                  border: `1px solid ${C.bdr}`,
                  borderRadius: 6,
                  color: C.white,
                  fontSize: "0.72rem",
                }}
              />
              <input
                type="date"
                value={modalData.deadline}
                onChange={(e) => setModalData({ ...modalData, deadline: e.target.value })}
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.04)",
                  border: `1px solid ${C.bdr}`,
                  borderRadius: 6,
                  color: C.white,
                  fontSize: "0.72rem",
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
                  onClick={handlePlaceAanbieding}
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
                  Plaatsen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
