"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { C } from "@/lib/landing/colors";

interface Taak {
  id: string;
  titel: string;
  type: string;
  prioriteit: string;
  status: string;
  due_date?: string;
  toegewezen_naam?: string;
  notities?: string;
  created_at: string;
}

export default function TakenPage() {
  const supabase = createClient();
  const [companyId, setCompanyId] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titel: "",
    type: "taak",
    prioriteit: "Medium",
    due_date: "",
  });

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

  const { data: taken = [] } = useQuery({
    queryKey: ["taken", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("taken")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Taak[];
    },
    enabled: !!companyId,
  });

  const handleCreateTask = async () => {
    if (!formData.titel) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("taken").insert({
      titel: formData.titel,
      type: formData.type,
      prioriteit: formData.prioriteit,
      due_date: formData.due_date || null,
      status: "Pending",
      company_id: companyId,
      aangemaakt_door: user?.id,
    });
    if (!error) {
      setShowModal(false);
      setFormData({ titel: "", type: "taak", prioriteit: "Medium", due_date: "" });
      window.location.reload();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("taken")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) window.location.reload();
  };

  const filteredTaken = taken
    .filter((t) => !filterPriority || t.prioriteit === filterPriority)
    .filter((t) => !filterStatus || t.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return (priorityOrder[a.prioriteit as keyof typeof priorityOrder] || 99) -
               (priorityOrder[b.prioriteit as keyof typeof priorityOrder] || 99);
      }
      if (sortBy === "deadline") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return 0;
    });

  const priorityColors: Record<string, string> = {
    Critical: "#f87171",
    High: "#fbbf24",
    Medium: "#4ade80",
    Low: "#94a3b8",
  };

  const statusColors: Record<string, string> = {
    Pending: "#94a3b8",
    "In Progress": "#22d3ee",
    Escalated: "#f87171",
    Overdue: "#f87171",
    Waiting: "#fbbf24",
    Completed: "#4ade80",
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
          <div>
            <h1 style={styles.title}>Taken</h1>
            <p style={styles.subtitle}>Task & Reminder Management</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
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
            + Nieuwe Taak
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "rgba(255,255,255,.04)",
            border: `1px solid ${C.bdr}`,
            borderRadius: 6,
            color: C.white,
            fontSize: "0.72rem",
          }}
        >
          <option value="">Alle prioriteiten</option>
          <option value="Critical">Kritiek</option>
          <option value="High">Hoog</option>
          <option value="Medium">Gemiddeld</option>
          <option value="Low">Laag</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "rgba(255,255,255,.04)",
            border: `1px solid ${C.bdr}`,
            borderRadius: 6,
            color: C.white,
            fontSize: "0.72rem",
          }}
        >
          <option value="">Alle statussen</option>
          <option value="Pending">Lopend</option>
          <option value="In Progress">In uitvoering</option>
          <option value="Escalated">Geëscaleerd</option>
          <option value="Overdue">Te laat</option>
          <option value="Waiting">Wachtend</option>
          <option value="Completed">Voltooid</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "rgba(255,255,255,.04)",
            border: `1px solid ${C.bdr}`,
            borderRadius: 6,
            color: C.white,
            fontSize: "0.72rem",
            marginLeft: "auto",
          }}
        >
          <option value="priority">Sorteren: Prioriteit</option>
          <option value="deadline">Sorteren: Deadline</option>
        </select>
      </div>

      {/* Tasks */}
      {filteredTaken.length === 0 ? (
        <div style={{ ...styles.card, textAlign: "center", color: C.muted }}>
          Geen taken gevonden
        </div>
      ) : (
        filteredTaken.map((taak) => (
          <div key={taak.id} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: C.white }}>
                  {taak.titel}
                </div>
                <div style={{ fontSize: "0.65rem", color: C.muted, marginTop: 4 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      background: `${priorityColors[taak.prioriteit]}20`,
                      color: priorityColors[taak.prioriteit],
                      borderRadius: 3,
                      marginRight: 8,
                      fontSize: "0.6rem",
                      fontWeight: 600,
                    }}
                  >
                    {taak.prioriteit}
                  </span>
                  {taak.due_date && (
                    <span style={{ marginRight: 8 }}>
                      📅 {new Date(taak.due_date).toLocaleDateString("nl-NL")}
                    </span>
                  )}
                  {taak.toegewezen_naam && (
                    <span>👤 {taak.toegewezen_naam}</span>
                  )}
                </div>
              </div>
              <select
                value={taak.status}
                onChange={(e) => handleStatusChange(taak.id, e.target.value)}
                style={{
                  padding: "6px 10px",
                  background: `${statusColors[taak.status]}20`,
                  border: `1px solid ${statusColors[taak.status]}`,
                  color: statusColors[taak.status],
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                }}
              >
                <option value="Pending">Lopend</option>
                <option value="In Progress">In uitvoering</option>
                <option value="Escalated">Geëscaleerd</option>
                <option value="Overdue">Te laat</option>
                <option value="Waiting">Wachtend</option>
                <option value="Completed">Voltooid</option>
              </select>
            </div>
            {taak.notities && (
              <div style={{ fontSize: "0.65rem", color: C.muted, paddingTop: 8, borderTop: `1px solid ${C.bdr}` }}>
                {taak.notities}
              </div>
            )}
          </div>
        ))
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
              Nieuwe Taak
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Taaktitel"
                value={formData.titel}
                onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.04)",
                  border: `1px solid ${C.bdr}`,
                  borderRadius: 6,
                  color: C.white,
                  fontSize: "0.72rem",
                }}
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.04)",
                  border: `1px solid ${C.bdr}`,
                  borderRadius: 6,
                  color: C.white,
                  fontSize: "0.72rem",
                }}
              >
                <option value="taak">Taak</option>
                <option value="reminder">Herinnering</option>
                <option value="follow-up">Vervolgactie</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={formData.prioriteit}
                onChange={(e) => setFormData({ ...formData, prioriteit: e.target.value })}
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.04)",
                  border: `1px solid ${C.bdr}`,
                  borderRadius: 6,
                  color: C.white,
                  fontSize: "0.72rem",
                }}
              >
                <option value="Low">Laag</option>
                <option value="Medium">Gemiddeld</option>
                <option value="High">Hoog</option>
                <option value="Critical">Kritiek</option>
              </select>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                  onClick={handleCreateTask}
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
                  Aanmaken
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
