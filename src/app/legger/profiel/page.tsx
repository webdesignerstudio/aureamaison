"use client";

import { useState, useEffect } from "react";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateLegger } from "@/hooks/use-leggers";
import { useToastContext } from "@/components/toast-provider";
import { GoldButton } from "@/components/ui/gold-button";
import { C } from "@/lib/landing/colors";
import { createClient } from "@/lib/supabase/client";
import type { Legger } from "@/types";

export default function LeggerProfielPage() {
  const { user } = useAuth();
  const toast = useToastContext();
  const updateLegger = useUpdateLegger();
  const [legger, setLegger] = useState<Legger | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    naam: "",
    telefoon: "",
    adres: "",
    stad: "",
    kvk: "",
    btw: "",
    iban: "",
    tarief: "",
  });

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    supabase
      .from("leggers")
      .select("*")
      .eq("profiel_id", user.id)
      .single()
      .then(({ data, error }: { data: Legger | null; error: { message: string } | null }) => {
        if (!error && data) {
          const l = data;
          setLegger(l);
          setForm({
            naam: l.naam,
            telefoon: l.telefoon || "",
            adres: l.adres || "",
            stad: l.stad || "",
            kvk: l.kvk || "",
            btw: l.btw || "",
            iban: l.iban || "",
            tarief: l.tarief?.toString() || "",
          });
        }
        setLoading(false);
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!legger) return;
    try {
      await updateLegger.mutateAsync({
        id: legger.id,
        naam: form.naam,
        telefoon: form.telefoon || null,
        adres: form.adres || null,
        stad: form.stad || null,
        kvk: form.kvk || null,
        btw: form.btw || null,
        iban: form.iban || null,
        tarief: form.tarief ? parseFloat(form.tarief) : null,
      });
      toast.success("Profiel bijgewerkt");
      setEditMode(false);
    } catch {
      toast.error("Bijwerken mislukt");
    }
  };

  const inp = { width: "100%", padding: "8px 11px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", outline: "none", boxSizing: "border-box" as const };
  const lbl = { display: "block", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, marginBottom: 4, fontWeight: 600 };

  if (loading) return (
    <LeggerLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </LeggerLayout>
  );

  return (
    <LeggerLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Mijn Profiel</h1>
        </div>

        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase" }}>Persoonsgegevens</div>
            {!editMode && (
              <button onClick={() => setEditMode(true)} style={{ background: "none", border: "none", color: C.gold, fontSize: "0.6rem", cursor: "pointer", padding: 0 }}>Bewerken</button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            {[
              { label: "Naam", key: "naam" as const, type: "text" },
              { label: "Telefoon", key: "telefoon" as const, type: "text" },
              { label: "Adres", key: "adres" as const, type: "text" },
              { label: "Stad", key: "stad" as const, type: "text" },
              { label: "KvK", key: "kvk" as const, type: "text" },
              { label: "BTW", key: "btw" as const, type: "text" },
              { label: "IBAN", key: "iban" as const, type: "text" },
              { label: "Tarief per m² (€)", key: "tarief" as const, type: "number" },
            ].map((field) => (
              <div key={field.key}>
                <label style={lbl}>{field.label}</label>
                {editMode ? (
                  <input type={field.type} value={form[field.key]} onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))} style={inp} />
                ) : (
                  <div style={{ fontSize: "0.72rem", color: form[field.key] ? C.white : C.dim }}>{form[field.key] || "—"}</div>
                )}
              </div>
            ))}
          </div>

          {editMode && (
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <GoldButton variant="outline" onClick={() => setEditMode(false)}>Annuleren</GoldButton>
              <GoldButton variant="primary" onClick={handleSave} disabled={updateLegger.isPending}>
                {updateLegger.isPending ? "Bezig…" : "Opslaan"}
              </GoldButton>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </LeggerLayout>
  );
}
