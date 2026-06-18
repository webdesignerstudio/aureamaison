"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { formatEuro } from "@/lib/utils";

export default function AdminOrdersPage() {
  const supabase = createClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders-page"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "#f1f5f9", margin: "0 0 16px" }}>
        Orders
      </h1>

      <div style={{ background: "#080e1a", border: "1px solid #0f172a", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #0f172a" }}>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>
                  Klant
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>
                  Status
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>
                  Prijs
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} style={{ borderBottom: "1px solid #0f172a" }}>
                  <td style={{ padding: "12px", fontSize: "0.65rem", color: "#f1f5f9" }}>
                    {o.clientName}
                  </td>
                  <td style={{ padding: "12px", fontSize: "0.65rem", color: "#94a3b8" }}>
                    {o.status}
                  </td>
                  <td style={{ padding: "12px", fontSize: "0.65rem", color: "#f1f5f9" }}>
                    {formatEuro(o.price || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
