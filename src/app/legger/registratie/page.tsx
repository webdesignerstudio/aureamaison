"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoldButton } from "@/components/ui/gold-button";
import { C } from "@/lib/landing/colors";

export default function LeggerRegistratiePage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [naam, setNaam] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [adres, setAdres] = useState("");
  const [stad, setStad] = useState("");
  const [kvk, setKvk] = useState("");
  const [btw, setBtw] = useState("");
  const [iban, setIban] = useState("");
  const [tarief, setTarief] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: naam,
          role: "legger",
          company_id: "11111111-1111-1111-1111-111111111111",
          onboarding_status: "pending",
        },
      },
    });

    if (signUpError || !authData.user) {
      setError(signUpError?.message || "Registratie mislukt");
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    const { error: leggerError } = await supabase.from("leggers").insert({
      profiel_id: userId,
      naam,
      email,
      telefoon: telefoon || null,
      adres: adres || null,
      stad: stad || null,
      kvk: kvk || null,
      btw: btw || null,
      iban: iban || null,
      tarief: tarief ? parseFloat(tarief) : null,
      company_id: "11111111-1111-1111-1111-111111111111",
    });

    if (leggerError) {
      console.error("Legger insert error:", leggerError);
    }

    // Automatisch trial-abonnement aanmaken (30 dagen Tier 3)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);
    const trialEndStr = trialEndDate.toISOString().split("T")[0];

    const { error: aboError } = await supabase.from("abonnementen").insert({
      type: "legger",
      entity_id: userId,
      naam,
      email,
      tier: 3,
      gekozen_tier: 3,
      plan: "tier-3",
      status: "proefperiode",
      betaal_methode: "handmatig",
      volgende_factuur: trialEndStr,
      company_id: "11111111-1111-1111-1111-111111111111",
      notities: "Automatisch aangemaakt bij aanmelding — 30 dagen proefperiode",
    });

    if (aboError) {
      console.error("Abonnement insert error:", aboError);
    }

    setDone(true);
    setLoading(false);
  };

  const inp = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 8, color: C.white, fontSize: "0.78rem", outline: "none", boxSizing: "border-box" as const };
  const lbl = { display: "block", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, marginBottom: 6, fontWeight: 600 };
  const wrap = { display: "flex", minHeight: "100vh", flexDirection: "column" as const, alignItems: "center" as const, justifyContent: "center" as const, background: C.bg, padding: "0 20px" };

  if (done) return (
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: 16 }}>✓</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", fontWeight: 300, color: C.gold, margin: "0 0 14px" }}>Aanvraag ingediend</h1>
        <p style={{ fontSize: "0.72rem", color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
          Bedankt voor uw aanmelding. Uw account is in afwachting van goedkeuring door de eigenaar.
          U ontvangt een e-mail zodra u toegang heeft.
        </p>
        <Link href="/legger/login" style={{ fontSize: "0.68rem", color: C.gold, textDecoration: "none" }}>← Terug naar login</Link>
      </div>
    </div>
  );

  return (
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 430 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: C.white, margin: 0 }}>Aanmelden als Legger</h1>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 6 }}>
            {[1,2,3].map((s) => (
              <div key={s} style={{ width: 28, height: 3, borderRadius: 99, background: s <= step ? C.gold : "rgba(255,255,255,.1)", transition: "background .3s" }} />
            ))}
          </div>
          <p style={{ marginTop: 6, fontSize: "0.62rem", color: C.dim }}>Stap {step} van 3</p>
        </div>

        {error && <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, color: C.red, fontSize: "0.72rem" }}>{error}</div>}

        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 14, padding: "26px 24px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {step === 1 && (<>
              <div><label style={lbl}>Naam</label><input value={naam} onChange={(e) => setNaam(e.target.value)} required placeholder="Uw naam" style={inp} /></div>
              <div><label style={lbl}>E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="uw@email.nl" style={inp} /></div>
              <div><label style={lbl}>Wachtwoord</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Minimaal 6 tekens" style={inp} /></div>
              <div style={{ marginTop: 4 }}><GoldButton type="button" variant="primary" size="md" className="w-full" onClick={() => setStep(2)}>Volgende →</GoldButton></div>
            </>)}

            {step === 2 && (<>
              <div><label style={lbl}>Adres</label><input value={adres} onChange={(e) => setAdres(e.target.value)} placeholder="Straat + huisnummer" style={inp} /></div>
              <div><label style={lbl}>Stad</label><input value={stad} onChange={(e) => setStad(e.target.value)} placeholder="Plaats" style={inp} /></div>
              <div><label style={lbl}>Telefoon</label><input value={telefoon} onChange={(e) => setTelefoon(e.target.value)} placeholder="06 12345678" style={inp} /></div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <GoldButton type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>← Terug</GoldButton>
                <GoldButton type="button" variant="primary" className="flex-1" onClick={() => setStep(3)}>Volgende →</GoldButton>
              </div>
            </>)}

            {step === 3 && (<>
              <div><label style={lbl}>KvK-nummer</label><input value={kvk} onChange={(e) => setKvk(e.target.value)} placeholder="12345678" style={inp} /></div>
              <div><label style={lbl}>BTW-nummer</label><input value={btw} onChange={(e) => setBtw(e.target.value)} placeholder="NL123456789B01" style={inp} /></div>
              <div><label style={lbl}>IBAN</label><input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="NL00 BANK 0000 0000 00" style={inp} /></div>
              <div><label style={lbl}>Tarief per m² (€)</label><input type="number" value={tarief} onChange={(e) => setTarief(e.target.value)} placeholder="25.00" style={inp} /></div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <GoldButton type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>← Terug</GoldButton>
                <GoldButton type="submit" variant="primary" className="flex-1" disabled={loading}>
                  {loading ? "Bezig…" : "Aanmelding indienen"}
                </GoldButton>
              </div>
            </>)}
          </form>
        </div>
        <div style={{ marginTop: 18, textAlign: "center", fontSize: "0.68rem", color: C.muted }}>
          <Link href="/legger/login" style={{ color: C.gold, textDecoration: "none" }}>← Terug naar login</Link>
        </div>
      </div>
    </div>
  );
}
