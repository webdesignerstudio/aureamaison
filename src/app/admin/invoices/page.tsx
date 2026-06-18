"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { formatEuro } from "@/lib/utils";

export default function AdminInvoicesPage() {
  const supabase = createClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").not("invoiceNr", "is", null);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "#f1f5f9", margin: "0 0 16px" }}>
        Invoices
      </h1>
      <div style={{ background: "#080e1a", border: "1px solid #0f172a", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: 12 }}>
          {orders.length} facturen
        </div>
        <div style={{ fontSize: "0.65rem", color: "#475569" }}>
          {orders.map((o: any) => (
            <div key={o.id} style={{ padding: "10px 0", borderBottom: "1px solid #0f172a", display: "flex", justifyContent: "space-between" }}>
              <span>{o.invoiceNr}</span>
              <span>{formatEuro(o.totaalInclBTW || 0)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
