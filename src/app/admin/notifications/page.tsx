"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export default function AdminNotificationsPage() {
  const supabase = createClient();

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "#f1f5f9", margin: "0 0 16px" }}>
        Notifications
      </h1>
      <div style={{ background: "#080e1a", border: "1px solid #0f172a", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: 12 }}>
          {auditLogs.length} recente activiteiten
        </div>
        <div style={{ fontSize: "0.65rem", color: "#475569" }}>
          {auditLogs.map((log: any) => (
            <div key={log.id} style={{ padding: "10px 0", borderBottom: "1px solid #0f172a" }}>
              <div style={{ color: "#f1f5f9" }}>{log.action}</div>
              <div style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: 2 }}>
                {new Date(log.created_at).toLocaleString("nl-NL")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
