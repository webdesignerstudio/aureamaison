"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { calcMRR, calcTotalOmzet, calcOpenFacturen } from "@/lib/admin-stats";
import { formatEuro } from "@/lib/utils";

export default function AdminOverviewPage() {
  const supabase = createClient();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(window.innerWidth < 768);
    const handleResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch abonnementen
  const { data: abonnementen = [] } = useQuery({
    queryKey: ["admin-abonnementen"],
    queryFn: async () => {
      const { data, error } = await supabase.from("abonnementen").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch leggers
  const { data: leggers = [] } = useQuery({
    queryKey: ["admin-leggers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leggers").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const totalOmzet = calcTotalOmzet(orders);
  const mrr = calcMRR(abonnementen);
  const openFacturen = calcOpenFacturen(orders);
  const activeLeggers = leggers.filter((l: any) => l.status === "actief").length;
  const lopendStatuses = ["in behandeling", "gepland", "bezig", "ter goedkeuring"];
  const lopendOrders = orders.filter((o: any) => lopendStatuses.includes((o.status || "").toLowerCase())).length;

  const styles = {
    wrap: { maxWidth: 1400, margin: "0 auto" },
    header: { marginBottom: 24 },
    title: {
      fontFamily: "'Cormorant Garamond',serif",
      fontSize: "2rem",
      fontWeight: 300,
      color: "#f1f5f9",
      margin: "0 0 8px",
    },
    subtitle: { fontSize: "0.72rem", color: "#94a3b8" },
    kpiGrid: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(5, 1fr)",
      gap: 12,
      marginBottom: 20,
    },
    kpiCard: {
      background: "#080e1a",
      border: "1px solid #0f172a",
      borderRadius: 10,
      padding: 16,
      textAlign: "center" as const,
    },
    kpiValue: { fontSize: "1.6rem", fontWeight: 600, color: "#22d3ee", margin: "0 0 4px" },
    kpiLabel: { fontSize: "0.6rem", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: 1 },
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: "#22d3ee", textTransform: "uppercase", marginBottom: 4 }}>
          CONTROL CENTER / OVERVIEW
        </div>
        <h1 style={styles.title}>Platform Overzicht</h1>
        <p style={styles.subtitle}>Live data uit Aurea Maison Floors</p>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiValue}>{activeLeggers}</div>
          <div style={styles.kpiLabel}>Actieve leggers</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiValue}>{lopendOrders}</div>
          <div style={styles.kpiLabel}>Lopende orders</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiValue}>{formatEuro(mrr)}</div>
          <div style={styles.kpiLabel}>Platform MRR</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiValue}>{openFacturen.count}</div>
          <div style={styles.kpiLabel}>Open facturen</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiValue}>{formatEuro(totalOmzet)}</div>
          <div style={styles.kpiLabel}>Totale omzet</div>
        </div>
      </div>

      {/* Orders per status */}
      <div style={{ background: "#080e1a", border: "1px solid #0f172a", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: 1, color: "#94a3b8", textTransform: "uppercase", marginBottom: 14 }}>
          Orders per status
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)", gap: 10 }}>
          {[
            ["Ingediend", "#fbbf24"],
            ["In behandeling", "#a78bfa"],
            ["Offerte verstuurd", "#22d3ee"],
            ["Gepland", "#a78bfa"],
            ["Lopend", "#4ade80"],
            ["Afgerond", "#4ade80"],
          ].map(([status, color]) => {
            const count = orders.filter((o: any) => o.status === status).length;
            return (
              <div
                key={status}
                style={{
                  background: `${color}15`,
                  border: `1px solid ${color}40`,
                  borderRadius: 8,
                  padding: 12,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.4rem", fontWeight: 600, color }}>{count}</div>
                <div style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: 4 }}>{status}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
