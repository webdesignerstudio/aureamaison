"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoldButton } from "@/components/ui/gold-button";

export default function LeggerLoginPage() {
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

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError(signInError?.message || "Inloggen mislukt");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role,onboarding_status")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.role !== "legger") {
      setError("Dit account is geen legger account.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (profile?.onboarding_status === "pending") {
      setError("Uw account is nog in afwachting van goedkeuring.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push("/legger");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
            Legger Portaal
          </h1>
          <p className="mt-2 text-sm text-muted">Inloggen voor vloerenleggers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-gold focus:outline-none"
              placeholder="uw@email.nl"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-gold focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <GoldButton type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Bezig..." : "Inloggen"}
          </GoldButton>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Nog geen account?{" "}
          <Link href="/legger/registratie" className="text-gold hover:underline">
            Aanmelden als legger
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-muted/50">
          <Link href="/login" className="hover:text-muted">← Terug naar eigenaar login</Link>
        </div>
      </div>
    </div>
  );
}
