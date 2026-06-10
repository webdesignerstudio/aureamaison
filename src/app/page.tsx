import Link from "next/link";
import { GoldButton } from "@/components/ui/gold-button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero */}
      <section className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="max-w-3xl text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-gold/40" />
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-gold">
              Vloerenleggers Platform
            </span>
            <div className="h-px w-8 bg-gold/40" />
          </div>

          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold leading-tight text-gold md:text-7xl">
            Aurea Maison
            <br />
            <span className="text-foreground">Floors</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Professioneel platform voor vloerenleggers. Offertes, planning,
            facturen en klantbeheer — alles op één plek.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <GoldButton variant="primary" size="lg">
                Inloggen
              </GoldButton>
            </Link>
            <Link href="/login">
              <GoldButton variant="outline" size="lg">
                Account aanmaken
              </GoldButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold/10 py-6 text-center">
        <p className="text-xs text-muted/50">
          Aurea Maison Floors — Zoetermeer
        </p>
      </footer>
    </div>
  );
}
