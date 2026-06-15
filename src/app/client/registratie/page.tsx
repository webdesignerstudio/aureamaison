"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoldButton } from "@/components/ui/gold-button";
import { C } from "@/lib/landing/colors";

export default function ClientRegistratiePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [naam, setNaam] = useState("");
  const [type, setType] = useState<"particulier" | "zakelijk">("particulier");
  const [bedrijf, setBedrijf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: naam,
          role: "client",
          company_id: "11111111-1111-1111-1111-111111111111",
        },
      },
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Registratie mislukt");
      setLoading(false);
      return;
    }

    // Insert profile so login can verify role
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email!,
      name: naam || email.split("@")[0],
      role: "client",
      company_id: "11111111-1111-1111-1111-111111111111",
      onboarding_status: "approved",
      onboarding_data: {},
    });

    if (profileError) {
      console.error("[ClientRegistratie] Profile insert error:", profileError);
      // Don't fail registration if profile insert fails — auth user exists
    }

    router.push("/client/login");
    setLoading(false);
  };

  const inp = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 8, color: C.white, fontSize: "0.78rem", outline: "none", boxSizing: "border-box" as const };
  const lbl = { display: "block", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, marginBottom: 6, fontWeight: 600 };

  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, padding: "0 20px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: C.white, margin: 0 }}>Registreren</h1>
          <p style={{ marginTop: 6, fontSize: "0.68rem", color: C.dim }}>Maak een klantaccount aan</p>
        </div>
        {error && <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, color: C.red, fontSize: "0.72rem" }}>{error}</div>}
        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 14, padding: "26px 24px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={lbl}>Account type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["particulier", "zakelijk"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    style={{ flex: 1, padding: "8px", borderRadius: 7, fontSize: "0.58rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", border: `1px solid ${type === t ? C.gold + "88" : C.bdr}`, background: type === t ? "rgba(198,165,107,.1)" : "transparent", color: type === t ? C.gold : C.muted }}>
                    {t === "particulier" ? "Particulier" : "Zakelijk"}
                  </button>
                ))}
              </div>
            </div>
            <div><label style={lbl}>Naam</label>
              <input value={naam} onChange={(e) => setNaam(e.target.value)} required placeholder="Uw naam" style={inp} /></div>
            {type === "zakelijk" && (
              <div><label style={lbl}>Bedrijfsnaam</label>
                <input value={bedrijf} onChange={(e) => setBedrijf(e.target.value)} placeholder="Bedrijfsnaam" style={inp} /></div>
            )}
            <div><label style={lbl}>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="uw@email.nl" style={inp} /></div>
            <div><label style={lbl}>Wachtwoord</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Minimaal 6 tekens" style={inp} /></div>
            <div style={{ marginTop: 4 }}>
              <GoldButton type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
                {loading ? "Bezig…" : "Registreren"}
              </GoldButton>
            </div>
          </form>
        </div>
        <div style={{ marginTop: 18, textAlign: "center", fontSize: "0.68rem", color: C.muted }}>
          Al een account? <Link href="/client/login" style={{ color: C.gold, textDecoration: "none" }}>Inloggen</Link>
        </div>
      </div>
    </div>
  );
}
