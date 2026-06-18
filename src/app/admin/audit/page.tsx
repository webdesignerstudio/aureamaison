"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function AdminAuditPage() {
  const supabase = createClient();
  const [filterType, setFilterType] = useState("");

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = filterType ? auditLogs.filter((log: any) => log.action_type === filterType) : auditLogs;

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "#f1f5f9", margin: "0 0 16px" }}>
        Audit Log
      </h1>

      <div style={{ marginBottom: 16 }}>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "rgba(255,255,255,.04)",
            border: "1px solid #0f172a",
            borderRadius: 6,
            color: "#f1f5f9",
            fontSize: "0.72rem",
          }}
        >
          <option value="">Alle types</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>

      <div style={{ background: "#080e1a", border: "1px solid #0f172a", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: 12 }}>
          {filtered.length} entries
        </div>
        <div style={{ fontSize: "0.65rem", color: "#475569", maxHeight: "600px", overflowY: "auto" }}>
          {filtered.map((log: any) => (
            <div key={log.id} style={{ padding: "12px 0", borderBottom: "1px solid #0f172a" }}>
              <div style={{ color: "#f1f5f9", fontWeight: 600 }}>{log.action}</div>
              <div style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: 4 }}>
                {log.user_email} • {new Date(log.created_at).toLocaleString("nl-NL")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
