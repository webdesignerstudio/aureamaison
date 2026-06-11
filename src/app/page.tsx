"use client";

import { useState } from "react";
import Link from "next/link";
import { GoldButton } from "@/components/ui/gold-button";

const faqItems = [
  ["Hoe lang duurt het leggen van een vloer?", "De meeste projecten worden afgerond in 1 tot 3 dagen. Bij grotere projecten bespreken wij de planning vooraf."],
  ["Komt u ook bij mij thuis langs voor advies?", "Ja, wij bieden een gratis showroom aan huis. Wij brengen onze collectie bij u thuis zodat u kunt kiezen in uw eigen interieur."],
  ["Hoe werkt het opdrachtgeversportaal?", "U maakt een gratis account aan, geeft uw projectgegevens op en volgt vervolgens de status in real-time. Facturen ontvangt u digitaal via het portaal."],
  ["Zijn uw vloeren geschikt voor vloerverwarming?", "Ja, wij installeren vloeren die geschikt zijn voor vloerverwarming. Dit bespreken wij altijd vooraf."],
  ["Wat kost een nieuwe vloer gemiddeld?", "De prijs hangt af van het vloertype en de oppervlakte. Vraag een vrijblijvende offerte aan voor een nauwkeurige prijs op maat."],
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* USP Bar */}
      <div className="bg-gold py-2">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 text-[0.6rem] font-semibold uppercase tracking-wider text-background">
          <span>Gratis Showroom aan Huis</span>
          <span className="hidden sm:inline">Reactie binnen 24 uur</span>
          <span className="hidden sm:inline">Heel Nederland</span>
          <span className="hidden md:inline">4.9 ★ op Google</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gold/10 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-[family-name:var(--font-cormorant)] text-xl font-medium tracking-wider text-gold">
            AUREA MAISON
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {["diensten", "portaal", "werkwijze", "faq", "contact"].map((id) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="text-xs font-medium uppercase tracking-wider text-muted transition hover:text-gold">
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <Link href="/login">
              <GoldButton variant="primary" size="sm">Inloggen</GoldButton>
            </Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gold">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <><path d="M18 6L6 18M6 6l12 12"/></>
              ) : (
                <><path d="M4 6h16M4 12h16M4 18h16"/></>
              )}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-gold/10 bg-background px-4 py-4 md:hidden">
            {["diensten", "portaal", "werkwijze", "faq", "contact"].map((id) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="block w-full py-3 text-left text-sm font-medium uppercase tracking-wider text-muted">
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <Link href="/login" className="mt-2 inline-block"><GoldButton variant="primary" size="sm">Inloggen</GoldButton></Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-20 md:grid-cols-2 md:py-32">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-8 bg-gold/40" />
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Ultra Premium Flooring</span>
            </div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light leading-tight text-foreground md:text-6xl">
              Exclusieve <em className="text-gold">Vloerprojecten</em> voor Luxe Interieurs
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
              Wij verzorgen de levering en installatie van hoogwaardige vloeren voor particuliere en zakelijke projecten door heel Nederland.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/offerte">
                <GoldButton variant="primary" size="lg">Offerte aanvragen</GoldButton>
              </Link>
              <button onClick={() => scrollTo("diensten")}>
                <GoldButton variant="outline" size="lg">Onze diensten</GoldButton>
              </button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-gold/20 via-gold/5 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="font-[family-name:var(--font-cormorant)] text-6xl font-light text-gold/20">Aurea</div>
                <div className="text-xs uppercase tracking-[0.5em] text-gold/30">Maison Floors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diensten */}
      <section id="diensten" className="border-t border-gold/10 bg-deep py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Diensten</span>
            <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-3xl font-light text-foreground">Wat wij doen</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Vloeradvies", desc: "Persoonlijk advies voor het juiste vloertype, rekening houdend met uw interieur, budget en leefstijl." },
              { title: "Levering & Installatie", desc: "Professionele legging door ervaren vakmensen. Inclusief egaliseren, ondervloer en afwerking." },
              { title: "Showroom aan Huis", desc: "Wij komen bij u thuis met onze collectie, zodat u kunt kiezen in uw eigen omgeving." },
            ].map((d, i) => (
              <div key={i} className="rounded-xl border border-gold/10 bg-background p-6 transition hover:border-gold/20">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-gold">{d.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portaal CTA */}
      <section id="portaal" className="border-t border-gold/10 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Portaal</span>
            <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-3xl font-light text-foreground">Kies uw portaal</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Link href="/login" className="group rounded-xl border border-gold/10 bg-deep p-8 text-center transition hover:border-gold/30">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">👤</div>
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-gold">Eigenaar</h3>
              <p className="text-xs text-muted">Dashboard, orders, leggers en instellingen</p>
            </Link>
            <Link href="/client/login" className="group rounded-xl border border-gold/10 bg-deep p-8 text-center transition hover:border-gold/30">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">🏠</div>
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-gold">Klant</h3>
              <p className="text-xs text-muted">Orders volgen, offertes aanvragen en facturen</p>
            </Link>
            <Link href="/legger/login" className="group rounded-xl border border-gold/10 bg-deep p-8 text-center transition hover:border-gold/30">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">🔧</div>
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-gold">Legger</h3>
              <p className="text-xs text-muted">Klussen beheren, agenda en profiel</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Werkwijze */}
      <section id="werkwijze" className="border-t border-gold/10 bg-deep py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Werkwijze</span>
            <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-3xl font-light text-foreground">Zo werkt het</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Aanvraag", desc: "Vul het offerteformulier in of neem contact met ons op." },
              { step: "02", title: "Advies", desc: "Wij bezoeken u voor een gratis adviesgesprek en meting." },
              { step: "03", title: "Offerte", desc: "Ontvang binnen 24 uur een vrijblijvende offerte op maat." },
              { step: "04", title: "Installatie", desc: "Na akkoord plannen wij de levering en professionele installatie." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mb-4 font-[family-name:var(--font-cormorant)] text-4xl font-light text-gold/30">{s.step}</div>
                <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-gold">{s.title}</h3>
                <p className="text-sm text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-gold/10 py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-gold">FAQ</span>
            <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-3xl font-light text-foreground">Veelgestelde vragen</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map(([q, a], i) => (
              <div key={i} className="rounded-xl border border-gold/10 bg-deep">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left">
                  <span className="text-sm font-medium text-foreground">{q}</span>
                  <span className="text-gold">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm leading-relaxed text-muted">{a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-gold/10 bg-deep py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Contact</span>
            <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-3xl font-light text-foreground">Neem contact op</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6 text-sm">
              <div>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gold">Adres</h3>
                <p className="text-muted">Zuidwijkstraat 28<br/>2729 KD Zoetermeer</p>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gold">Contact</h3>
                <p className="text-muted">Tel: 06 28 27 35 70<br/>Email: Aureamaisonfloors@gmail.com</p>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gold">KvK / BTW</h3>
                <p className="text-muted">KvK: 42032896<br/>BTW: NL00544489B03</p>
              </div>
            </div>
            <div className="rounded-xl border border-gold/10 bg-background p-6">
              <p className="mb-4 text-sm text-muted">Heeft u een vraag? Stuur ons een bericht en wij reageren binnen 24 uur.</p>
              <Link href="/offerte">
                <GoldButton variant="primary" className="w-full">Direct offerte aanvragen</GoldButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold/10 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="font-[family-name:var(--font-cormorant)] text-sm tracking-wider text-gold">AUREA MAISON FLOORS</div>
            <div className="text-xs text-muted/50">
              Zoetermeer · KvK 42032896 · BTW NL00544489B03
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
