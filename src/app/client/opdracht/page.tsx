"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientLayout } from "@/components/layout/client-layout";
import { useAuth } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToastContext } from "@/components/toast-provider";
import { GoldButton } from "@/components/ui/gold-button";
import { C } from "@/lib/landing/colors";

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

  const inp = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", outline: "none", boxSizing: "border-box" as const };
  const lbl = { display: "block", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, marginBottom: 5, fontWeight: 600 };

  return (
    <ClientLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Nieuwe Opdracht</h1>
        </div>
        <form onSubmit={handleSubmit} style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            {fields.map((f) => (
              <div key={f.key}>
                <label style={lbl}>{f.label}{f.required && <span style={{ color: C.red }}> *</span>}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => handleChange(f.key, e.target.value)} required={f.required} style={inp} />
              </div>
            ))}
          </div>
          <div>
            <label style={lbl}>Opmerking</label>
            <textarea value={form.opmerking} onChange={(e) => handleChange("opmerking", e.target.value)} rows={3} placeholder="Eventuele bijzonderheden…" style={{ ...inp, resize: "vertical" }} />
          </div>
          <div>
            <GoldButton type="submit" variant="primary" disabled={createOrder.isPending}>
              {createOrder.isPending ? "Bezig…" : "Opdracht indienen"}
            </GoldButton>
          </div>
        </form>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </ClientLayout>
  );
}
