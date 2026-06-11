"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoldButton } from "@/components/ui/gold-button";

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

    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
            Aanvraag ingediend
          </h1>
          <p className="mt-4 text-sm text-muted leading-relaxed">
            Bedankt voor uw aanmelding. Uw account is in afwachting van goedkeuring door de eigenaar.
            U ontvangt een e-mail zodra u toegang heeft.
          </p>
          <div className="mt-6">
            <Link href="/legger/login" className="text-sm text-gold hover:underline">
              ← Terug naar login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
            Aanmelden als Legger
          </h1>
          <p className="mt-2 text-sm text-muted">Stap {step} van 3</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Naam</label>
                <input value={naam} onChange={(e) => setNaam(e.target.value)} required className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="Uw naam" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="uw@email.nl" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Wachtwoord</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="Minimaal 6 tekens" />
              </div>
              <GoldButton type="button" variant="primary" className="w-full" onClick={() => setStep(2)}>
                Volgende
              </GoldButton>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Adres</label>
                <input value={adres} onChange={(e) => setAdres(e.target.value)} className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="Straat + huisnummer" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Stad</label>
                <input value={stad} onChange={(e) => setStad(e.target.value)} className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="Plaats" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Telefoon</label>
                <input value={telefoon} onChange={(e) => setTelefoon(e.target.value)} className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="06 12345678" />
              </div>
              <div className="flex gap-3">
                <GoldButton type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>← Terug</GoldButton>
                <GoldButton type="button" variant="primary" className="flex-1" onClick={() => setStep(3)}>Volgende →</GoldButton>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">KvK-nummer</label>
                <input value={kvk} onChange={(e) => setKvk(e.target.value)} className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="12345678" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">BTW-nummer</label>
                <input value={btw} onChange={(e) => setBtw(e.target.value)} className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="NL123456789B01" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">IBAN</label>
                <input value={iban} onChange={(e) => setIban(e.target.value)} className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="NL00 BANK 0000 0000 00" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Tarief per m² (€)</label>
                <input type="number" value={tarief} onChange={(e) => setTarief(e.target.value)} className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="25.00" />
              </div>
              <div className="flex gap-3">
                <GoldButton type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>← Terug</GoldButton>
                <GoldButton type="submit" variant="primary" className="flex-1" disabled={loading}>
                  {loading ? "Bezig..." : "Aanmelding indienen"}
                </GoldButton>
              </div>
            </>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          <Link href="/legger/login" className="text-gold hover:underline">← Terug naar login</Link>
        </div>
      </div>
    </div>
  );
}
