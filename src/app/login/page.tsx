"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoldButton } from "@/components/ui/gold-button";
import { C } from "@/lib/landing/colors";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Ongeldige inloggegevens. Probeer opnieuw.");
      setLoading(false);
      return;
    }

    const userId = signInData.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      const allowedRoles = ["owner", "superadmin", "keyuser", "office"];
      if (!profile || !allowedRoles.includes(profile.role)) {
        setError("Geen toegang. Dit dashboard is alleen voor eigenaren.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push("/dashboard");
  };

  const inp = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 8, color: C.white, fontSize: "0.78rem", outline: "none", boxSizing: "border-box" as const };
  const lbl = { display: "block", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, marginBottom: 6, fontWeight: 600 };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: C.bg, padding: "0 20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 5, color: C.gold, textTransform: "uppercase", marginBottom: 8 }}>Dashboard Toegang</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2.4rem", fontWeight: 300, letterSpacing: -1, color: C.white, margin: 0 }}>Aurea Maison</h1>
          <p style={{ marginTop: 8, fontSize: "0.68rem", color: C.dim }}>Log in om toegang te krijgen tot het platform</p>
        </div>
        <form onSubmit={handleSubmit} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 14, padding: "28px 26px", display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, color: C.red, fontSize: "0.72rem" }}>{error}</div>}
          <div><label htmlFor="email" style={lbl}>E-mailadres</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="eigenaar@aurea.nl" style={inp} /></div>
          <div><label htmlFor="password" style={lbl}>Wachtwoord</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={inp} /></div>
          <div style={{ marginTop: 4 }}>
            <GoldButton type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Bezig…" : "Inloggen"}
            </GoldButton>
          </div>
        </form>
        <p style={{ marginTop: 20, textAlign: "center", fontSize: "0.58rem", color: C.dim }}>
          Problemen met inloggen? Neem contact op met de beheerder.
        </p>
      </div>
    </div>
  );
}
