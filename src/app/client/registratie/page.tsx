"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoldButton } from "@/components/ui/gold-button";

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">Registreren</h1>
          <p className="mt-2 text-sm text-muted">Maak een klantaccount aan</p>
        </div>
        {error && <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Account type</label>
            <div className="flex gap-3">
              {(["particulier", "zakelijk"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    type === t ? "border-gold bg-gold/10 text-gold" : "border-gold/10 text-muted hover:text-foreground"
                  }`}>
                  {t === "particulier" ? "Particulier" : "Zakelijk"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Naam</label>
            <input value={naam} onChange={(e) => setNaam(e.target.value)} required
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="Uw naam" />
          </div>
          {type === "zakelijk" && (
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Bedrijfsnaam</label>
              <input value={bedrijf} onChange={(e) => setBedrijf(e.target.value)}
                className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="Bedrijfsnaam" />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="uw@email.nl" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Wachtwoord</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="Minimaal 6 tekens" />
          </div>
          <GoldButton type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Bezig..." : "Registreren"}
          </GoldButton>
        </form>
        <div className="mt-6 text-center text-sm text-muted">
          Al een account? <Link href="/client/login" className="text-gold hover:underline">Inloggen</Link>
        </div>
      </div>
    </div>
  );
}
