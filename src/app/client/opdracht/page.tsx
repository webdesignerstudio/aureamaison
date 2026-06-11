"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientLayout } from "@/components/layout/client-layout";
import { useAuth } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToastContext } from "@/components/toast-provider";
import { GoldButton } from "@/components/ui/gold-button";

export default function ClientOpdrachtPage() {
  const { user } = useAuth();
  const toast = useToastContext();
  const router = useRouter();
  const createOrder = useCreateOrder();

  const [form, setForm] = useState({
    client_name: user?.name || "",
    client_email: user?.email || "",
    vloer_type: "",
    oppervlakte: "",
    straat: "",
    postcode: "",
    plaats: "",
    ondergrond: "",
    timing: "",
    opmerking: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrder.mutateAsync({
        ...form,
        oppervlakte: form.oppervlakte ? parseInt(form.oppervlakte) : null,
        status: "ingediend",
        company_id: "11111111-1111-1111-1111-111111111111",
      });
      toast.success("Opdracht ingediend!");
      router.push("/client");
    } catch {
      toast.error("Indienen mislukt");
    }
  };

  const fields = [
    { label: "Naam", key: "client_name", type: "text", required: true },
    { label: "E-mail", key: "client_email", type: "email", required: true },
    { label: "Vloertype", key: "vloer_type", type: "text" },
    { label: "Oppervlakte (m²)", key: "oppervlakte", type: "number" },
    { label: "Straat + huisnummer", key: "straat", type: "text" },
    { label: "Postcode", key: "postcode", type: "text" },
    { label: "Plaats", key: "plaats", type: "text" },
    { label: "Ondergrond", key: "ondergrond", type: "text" },
    { label: "Gewenste timing", key: "timing", type: "text" },
  ];

  return (
    <ClientLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Nieuwe Opdracht
        </h1>
        <p className="mt-2 text-muted">Geef de details van uw project op.</p>

        <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
                  {f.label}{f.required && <span className="text-red-400"> *</span>}
                </label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  required={f.required}
                  className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Opmerking</label>
            <textarea
              value={form.opmerking}
              onChange={(e) => handleChange("opmerking", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none"
              placeholder="Eventuele bijzonderheden..."
            />
          </div>

          <GoldButton type="submit" variant="primary" disabled={createOrder.isPending}>
            {createOrder.isPending ? "Bezig..." : "Opdracht indienen"}
          </GoldButton>
        </form>
      </div>
    </ClientLayout>
  );
}
