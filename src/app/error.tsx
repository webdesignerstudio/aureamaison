"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-gold">
          Oeps!
        </h1>
        <p className="mt-4 text-muted">
          Er is iets misgegaan. Probeer de pagina te vernieuwen of ga terug naar het dashboard.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Opnieuw proberen
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gold/20 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:border-gold/50"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
