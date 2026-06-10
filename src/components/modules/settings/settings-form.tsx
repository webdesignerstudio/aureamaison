"use client";

import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { GoldButton } from "@/components/ui/gold-button";
import { Spinner } from "@/components/ui/spinner";
import type { Settings } from "@/types";

interface SettingsFormProps {
  companyId: string;
}

export function SettingsForm({ companyId }: SettingsFormProps) {
  const { data: settings, isLoading } = useSettings(companyId);
  const updateSettings = useUpdateSettings();
  const [form, setForm] = useState<Partial<Settings>>({});

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof Settings, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings?.id) return;
    await updateSettings.mutateAsync({
      id: settings.id,
      ...form,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const fields = [
    { label: "Bedrijfsnaam", field: "bedrijf_naam" as const, type: "text" },
    { label: "E-mail", field: "bedrijf_email" as const, type: "email" },
    { label: "Telefoon", field: "bedrijf_tel" as const, type: "text" },
    { label: "Adres", field: "bedrijf_adres" as const, type: "text" },
    { label: "Postcode", field: "bedrijf_postcode" as const, type: "text" },
    { label: "Plaats", field: "bedrijf_plaats" as const, type: "text" },
    { label: "KvK", field: "kvk" as const, type: "text" },
    { label: "BTW-nummer", field: "btw" as const, type: "text" },
    { label: "IBAN", field: "iban" as const, type: "text" },
  ];

  const numericFields = [
    { label: "BTW percentage", field: "factuur_btw_pct" as const },
    { label: "Betaaltermijn (dagen)", field: "factuur_betaal_termijn" as const },
    { label: "Offerte geldigheid (dagen)", field: "offerte_geldigheid" as const },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ label, field, type }) => (
          <div key={field}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gold">
              {label}
            </label>
            <input
              type={type}
              value={(form[field] as string) || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20"
            />
          </div>
        ))}
        {numericFields.map(({ label, field }) => (
          <div key={field}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gold">
              {label}
            </label>
            <input
              type="number"
              value={(form[field] as number) || ""}
              onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gold">
          Factuur voetnoot
        </label>
        <textarea
          value={(form.factuur_voetnoot as string) || ""}
          onChange={(e) => handleChange("factuur_voetnoot", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gold/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20"
        />
      </div>

      <GoldButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={updateSettings.isPending}
      >
        {updateSettings.isPending ? <Spinner size="sm" /> : "Instellingen opslaan"}
      </GoldButton>
    </form>
  );
}
