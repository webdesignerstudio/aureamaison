"use client";

import { useState, useEffect } from "react";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateLegger } from "@/hooks/use-leggers";
import { useToastContext } from "@/components/toast-provider";
import { GoldButton } from "@/components/ui/gold-button";
import { Spinner } from "@/components/ui/spinner";
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

  if (loading) {
    return (
      <LeggerLayout>
        <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
      </LeggerLayout>
    );
  }

  return (
    <LeggerLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Mijn Profiel
        </h1>
        <p className="mt-2 text-muted">Beheer uw gegevens en tarieven.</p>

        <div className="mt-6 rounded-xl border border-gold/10 bg-deep p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-gold">Persoonsgegevens</h2>
            {!editMode && (
              <button onClick={() => setEditMode(true)} className="text-xs text-gold hover:underline">
                Bewerken
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
                <label className="mb-1 block text-xs text-muted">{field.label}</label>
                {editMode ? (
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full rounded-lg border border-gold/10 bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                ) : (
                  <div className="text-sm text-foreground">{form[field.key] || "—"}</div>
                )}
              </div>
            ))}
          </div>

          {editMode && (
            <div className="mt-6 flex gap-3">
              <GoldButton variant="outline" onClick={() => setEditMode(false)}>Annuleren</GoldButton>
              <GoldButton variant="primary" onClick={handleSave} disabled={updateLegger.isPending}>
                {updateLegger.isPending ? "Bezig..." : "Opslaan"}
              </GoldButton>
            </div>
          )}
        </div>
      </div>
    </LeggerLayout>
  );
}
