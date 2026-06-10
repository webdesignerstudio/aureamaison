"use client";

import { useState } from "react";
import { useCreateOrder } from "@/hooks/use-orders";
import { GoldButton } from "@/components/ui/gold-button";
import { Spinner } from "@/components/ui/spinner";
import { generateUAID } from "@/lib/utils";

interface OrderFormProps {
  onSuccess?: () => void;
  companyId: string;
}

export function OrderForm({ onSuccess, companyId }: OrderFormProps) {
  const createOrder = useCreateOrder();
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    straat: "",
    postcode: "",
    plaats: "",
    vloer_type: "",
    oppervlakte: "",
    ondergrond: "",
    budget: "",
    timing: "",
    opmerking: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createOrder.mutateAsync({
      uaid: generateUAID(),
      client_name: form.client_name,
      client_email: form.client_email,
      straat: form.straat || null,
      postcode: form.postcode || null,
      plaats: form.plaats || null,
      vloer_type: form.vloer_type || null,
      oppervlakte: form.oppervlakte ? parseInt(form.oppervlakte) : null,
      ondergrond: form.ondergrond || null,
      budget: form.budget ? parseFloat(form.budget) : null,
      timing: form.timing || null,
      opmerking: form.opmerking || null,
      status: "ingediend",
      company_id: companyId,
    });

    onSuccess?.();
  };

  const fields = [
    { label: "Klantnaam", field: "client_name", required: true },
    { label: "E-mail", field: "client_email", type: "email", required: true },
    { label: "Straat", field: "straat" },
    { label: "Postcode", field: "postcode" },
    { label: "Plaats", field: "plaats" },
    { label: "Vloertype", field: "vloer_type" },
    { label: "Oppervlakte (m²)", field: "oppervlakte", type: "number" },
    { label: "Ondergrond", field: "ondergrond" },
    { label: "Budget (€)", field: "budget", type: "number" },
    { label: "Gewenste timing", field: "timing" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ label, field, type = "text", required }) => (
          <div key={field}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gold">
              {label}
              {required && <span className="text-red-400"> *</span>}
            </label>
            <input
              type={type}
              value={form[field as keyof typeof form]}
              onChange={(e) => handleChange(field, e.target.value)}
              required={required}
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gold">
          Opmerking
        </label>
        <textarea
          value={form.opmerking}
          onChange={(e) => handleChange("opmerking", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gold/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20"
        />
      </div>

      <GoldButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={createOrder.isPending}
      >
        {createOrder.isPending ? <Spinner size="sm" /> : "Order aanmaken"}
      </GoldButton>
    </form>
  );
}
