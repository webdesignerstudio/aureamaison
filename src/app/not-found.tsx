import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="font-[family-name:var(--font-cormorant)] text-6xl font-semibold text-gold">
          404
        </h1>
        <p className="mt-4 text-muted">
          Deze pagina bestaat niet.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Naar dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
