"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoldButton } from "@/components/ui/gold-button";
import { Spinner } from "@/components/ui/spinner";

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
    const userEmail = signInData.user?.email;
    if (userId && userEmail) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, company_id, name, email")
        .eq("id", userId)
        .maybeSingle();

      if (!profile) {
        console.warn("[Login] Profile missing, creating directly for:", userEmail);
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          email: userEmail,
          name: userEmail.split("@")[0],
          role: "owner",
          company_id: "11111111-1111-1111-1111-111111111111",
        });
        if (insertError) {
          // 409 = duplicate key = profile already exists (created by API or trigger)
          if (insertError.code === "23505") {
            console.log("[Login] Profile already exists, proceeding to dashboard");
          } else {
            console.error("[Login] Profile insert failed:", insertError);
            setError("Account activatie mislukt. Probeer opnieuw.");
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
        } else {
          console.log("[Login] Profile created directly");
        }
      } else {
        console.log("[Login] Profile found — role:", profile.role);
      }
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1
            className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold"
          >
            Aurea Maison Floors
          </h1>
          <p className="mt-2 text-sm text-muted">
            Log in om toegang te krijgen tot het platform
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gold/10 bg-deep p-6 shadow-lg"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-muted">
              E-mailadres
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20"
              placeholder="eigenaar@aurea.nl"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-muted">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20"
              placeholder="••••••••"
            />
          </div>

          <GoldButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "Inloggen"}
          </GoldButton>
        </form>

        <p className="mt-6 text-center text-xs text-muted/60">
          Problemen met inloggen? Neem contact op met de beheerder.
        </p>
      </div>
    </div>
  );
}
