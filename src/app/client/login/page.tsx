"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoldButton } from "@/components/ui/gold-button";
import { C } from "@/lib/landing/colors";

export default function ClientLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError(signInError?.message || "Inloggen mislukt");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.role !== "client") {
      setError("Dit account is geen klant account.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push("/client");
  };

  const inp = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 8, color: C.white, fontSize: "0.78rem", outline: "none", boxSizing: "border-box" as const };
  const lbl = { display: "block", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, marginBottom: 6, fontWeight: 600 };

  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, padding: "0 20px" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: C.white, margin: 0 }}>Klant Portaal</h1>
          <p style={{ marginTop: 6, fontSize: "0.68rem", color: C.dim }}>Inloggen voor klanten</p>
        </div>
        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 14, padding: "28px 26px" }}>
          {error && <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, color: C.red, fontSize: "0.72rem" }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={lbl}>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="uw@email.nl" style={inp} /></div>
            <div><label style={lbl}>Wachtwoord</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={inp} /></div>
            <div style={{ marginTop: 4 }}>
              <GoldButton type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
                {loading ? "Bezig…" : "Inloggen"}
              </GoldButton>
            </div>
          </form>
        </div>
        <div style={{ marginTop: 18, textAlign: "center", fontSize: "0.68rem", color: C.muted }}>
          Nog geen account?{" "}
          <Link href="/client/registratie" style={{ color: C.gold, textDecoration: "none" }}>Registreren</Link>
        </div>
        <div style={{ marginTop: 10, textAlign: "center", fontSize: "0.58rem", color: C.dim }}>
          <Link href="/portaal" style={{ color: C.dim, textDecoration: "none" }}>← Terug naar portaalkeuze</Link>
        </div>
      </div>
    </div>
  );
}
