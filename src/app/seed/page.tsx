"use client";

import { useState } from "react";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const runSeed = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/seed?key=seed2025", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seed failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-6">
      <div className="w-full max-w-lg rounded-xl border border-[#C6A56B]/20 bg-[#0a0a0a] p-8">
        <h1 className="mb-2 text-center font-[family-name:var(--font-cormorant)] text-2xl text-[#C6A56B]">
          Database Seeding
        </h1>
        <p className="mb-6 text-center text-sm text-neutral-400">
          Vul de productie database met demo data uit MODULES.tsx
        </p>

        <button
          onClick={runSeed}
          disabled={loading}
          className="w-full rounded-lg bg-[#C6A56B] px-6 py-3 font-semibold text-[#050505] transition hover:bg-[#b8955a] disabled:opacity-50"
        >
          {loading ? "Bezig met seeden…" : "🌱 Start Seed"}
        </button>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-lg border border-[#C6A56B]/20 bg-[#C6A56B]/5 p-4 text-sm">
            <p className="mb-2 font-semibold text-[#C6A56B]">✅ Seed gelukt!</p>
            <pre className="overflow-x-auto text-xs text-neutral-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
