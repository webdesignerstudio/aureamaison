"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { calcMRR, calcTotalOmzet, calcOpenFacturen } from "@/lib/admin-stats";
import { formatEuro } from "@/lib/utils";

export default function AdminFinancePage() {
  const supabase = createClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-finance-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: abonnementen = [] } = useQuery({
    queryKey: ["admin-finance-abo"],
    queryFn: async () => {
      const { data, error } = await supabase.from("abonnementen").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const mrr = calcMRR(abonnementen);
  const totalOmzet = calcTotalOmzet(orders);
  const openFacturen = calcOpenFacturen(orders);

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "#f1f5f9", margin: "0 0 16px" }}>
        Finance
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#080e1a", border: "1px solid #0f172a", borderRadius: 10, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 600, color: "#4ade80", marginBottom: 4 }}>
            {formatEuro(mrr)}
          </div>
          <div style={{ fontSize: "0.6rem", color: "#94a3b8", textTransform: "uppercase" }}>
            MRR
          </div>
        </div>

        <div style={{ background: "#080e1a", border: "1px solid #0f172a", borderRadius: 10, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 600, color: "#4ade80", marginBottom: 4 }}>
            {formatEuro(totalOmzet)}
          </div>
          <div style={{ fontSize: "0.6rem", color: "#94a3b8", textTransform: "uppercase" }}>
            Totale omzet
          </div>
        </div>

        <div style={{ background: "#080e1a", border: "1px solid #0f172a", borderRadius: 10, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 600, color: "#fbbf24", marginBottom: 4 }}>
            {formatEuro(openFacturen.total)}
          </div>
          <div style={{ fontSize: "0.6rem", color: "#94a3b8", textTransform: "uppercase" }}>
            Open facturen
          </div>
        </div>
      </div>
    </div>
  );
}
