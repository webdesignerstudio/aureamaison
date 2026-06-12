#!/usr/bin/env tsx
/**
 * Aurea Maison Floors — Seed Script (Phase 1)
 * Migrates all mock data from MODULES.tsx to Supabase production database
 *
 * Usage:
 *   tsx scripts/seed-modules-data.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=... (NOT the anon key — needs admin privileges)
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/* ═══════════════════════════════════════════════════════════════
   SEED CONSTANTS (from MODULES.tsx)
   ═══════════════════════════════════════════════════════════════ */

const SEED_VOORNAMEN = [
  "Jan","Pieter","Mohamed","Emma","Sophie","Lars","Fatima","Daan","Lisa","Mehmet",
  "Anna","Thomas","Yasmin","Kevin","Nora","Bram","Aisha","Sander","Julia","Marco",
  "Leila","Tim","Roos","Jordi","Samira","Nick","Hanna","Ruben","Ines","Finn",
  "Lotte","Bas","Zara","Arjan","Miriam","Dennis","Eline","Koen","Sara","Jelle",
  "Amber","Wouter","Carmen","Patrick","Eva","Joost","Nadine","Stefan","Anouk","Rob"
];
const SEED_ACHTERNAMEN = [
  "de Vries","Jansen","Bakker","van den Berg","Visser","Smit","Meijer","de Boer",
  "Mulder","de Groot","Bos","Vos","Peters","Hendriks","van Leeuwen","Dekker",
  "Brouwer","de Wit","Dijkstra","Peeters","van Dijk","Vermeer","Willems","Kuipers",
  "van Dam","Lammers","Hoekstra","Maas","Jacobs"
];
const SEED_STEDEN = [
  "Amsterdam","Rotterdam","Den Haag","Utrecht","Eindhoven","Tilburg","Groningen",
  "Almere","Breda","Nijmegen","Enschede","Haarlem","Arnhem","Amersfoort",
  "Apeldoorn","Zwolle","Zoetermeer","Leiden","Maastricht"
];
const SEED_STRATEN = [
  "Hoofdstraat","Kerkstraat","Schoolstraat","Molenweg","Dorpsstraat",
  "Nieuwe Weg","Industrieweg","Parkweg","Alexanderstraat","Beethovenstraat",
  "Rembrandtlaan","Van Goghstraat"
];
const SEED_VLOER = [
  "Visgraat","Laminaat","PVC Vloeren","Massief Parket","Hongaars Punt",
  "Traprenovatie","Egaliseren"
];
const SEED_STATUS = [
  "ingediend","in behandeling","offerte verstuurd","gepland","bezig",
  "afgerond","afgerond","afgerond"
];
const SEED_SPECS = [
  "Laminaat","PVC / Vinyl","Parket","Hout","Visgraat","Traprenovatie",
  "Egaliseren","Parket schuren"
];
const SEED_PATRONEN = ["recht","diagonaal","visgraat","hongaars punt"];
const SEED_TIMING = [
  "Zo snel mogelijk","Binnen 2 weken","Binnen een maand","Flexibel"
];
const SEED_PRIJZEN: Record<string, number> = {
  Visgraat: 38, Laminaat: 22, "PVC Vloeren": 28, "Massief Parket": 89,
  "Hongaars Punt": 79, Traprenovatie: 89, Egaliseren: 12,
};

const sr = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const sri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const srf = (a: number, b: number) => parseFloat((Math.random() * (b - a) + a).toFixed(2));
const sda = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/* ═══════════════════════════════════════════════════════════════
   DATA GENERATION
   ═══════════════════════════════════════════════════════════════ */

interface SeedLegger {
  name: string; email: string; tel: string; bedrijf: string;
  kvk: string; btw: string; iban: string; stad: string; postcode: string;
  straal: number; specialisaties: string[]; tariefPerM2: number;
  uurtarief: number; minimumKlus: number; status: string;
  beschrijving: string; beoordelingen: number; gemSterren: number;
  aangemeldAt: string; onboardingStatus: string;
}

interface SeedClient {
  name: string; email: string; tel: string;
  straat: string; postcode: string; plaats: string; aangemeldAt: string;
}

interface SeedOrder {
  clientName: string; clientEmail: string; tel: string;
  straat: string; postcode: string; plaats: string;
  vloerType: string; oppervlakte: number; patroon: string; timing: string;
  opmerkingen: string; status: string; statusHistory: any[];
  createdAt: string; price: number; totaalExBTW: number; btw: number; totaalInclBTW: number;
  toegewezenLeggerId: string | null; leggerNaam: string | null;
  leggerPrijs: number | null; leggerVisible: boolean;
  invoiceNr: string | null; invoicePaid: boolean; invoiceDate: string | null;
  bron: string; prioriteit: string;
}

function generateData() {
  const leggers: SeedLegger[] = [];
  const clients: SeedClient[] = [];

  // 8 leggers
  for (let i = 0; i < 8; i++) {
    const naam = `${SEED_VOORNAMEN[i]} ${sr(SEED_ACHTERNAMEN)}`;
    const specs = SEED_SPECS.filter(() => Math.random() > 0.45);
    leggers.push({
      name: naam,
      email: `legger${i + 1}@aurea.nl`,
      tel: `06${sri(10000000, 99999999)}`,
      bedrijf: `${SEED_VOORNAMEN[i]} Vloerwerken`,
      kvk: String(sri(10000000, 99999999)),
      btw: `NL${sri(100000000, 999999999)}B01`,
      iban: `NL${sri(10, 99)} KNAB ${sri(1000, 9999)} ${sri(1000, 9999)} ${sri(10, 99)}`,
      stad: sr(SEED_STEDEN),
      postcode: `${sri(1000, 9999)} AB`,
      straal: sri(20, 80),
      specialisaties: specs.length ? specs : ["Laminaat", "PVC / Vinyl"],
      tariefPerM2: srf(14, 26),
      uurtarief: srf(38, 60),
      minimumKlus: sri(200, 600),
      status: i < 6 ? "actief" : "inactief",
      beschrijving: `Vakkundige vloerlegger met ${sri(3, 18)} jaar ervaring.`,
      beoordelingen: sri(4, 47),
      gemSterren: srf(3.9, 5.0),
      aangemeldAt: sda(sri(30, 365)),
      onboardingStatus: "goedgekeurd",
    });
  }

  // 42 clients
  for (let i = 0; i < 42; i++) {
    const naam = `${SEED_VOORNAMEN[i + 8] || SEED_VOORNAMEN[i % 50]} ${sr(SEED_ACHTERNAMEN)}`;
    clients.push({
      name: naam,
      email: `klant${i + 1}@mail.nl`,
      tel: `06${sri(10000000, 99999999)}`,
      straat: `${sr(SEED_STRATEN)} ${sri(1, 200)}`,
      postcode: `${sri(1000, 9999)} ${sr(["AB", "BC", "CD", "DE", "EF"])}`,
      plaats: sr(SEED_STEDEN),
      aangemeldAt: sda(sri(1, 400)),
    });
  }

  // Orders & offertes
  const orders: SeedOrder[] = [];
  const offertes: any[] = [];

  clients.forEach((kl, ki) => {
    const n = sri(1, 3);
    for (let oi = 0; oi < n; oi++) {
      const da = sri(2, 300);
      const status = sr(SEED_STATUS);
      const vloer = sr(SEED_VLOER);
      const opp = sri(15, 160);
      const isToe = ["gepland", "bezig", "afgerond"].includes(status);
      const legger = isToe ? leggers[sri(0, 7)] : null;
      const mat = SEED_PRIJZEN[vloer] || 30;
      const exBTW = parseFloat((opp * mat * srf(1.1, 1.3)).toFixed(2));
      const btw = parseFloat((exBTW * 0.21).toFixed(2));
      const incl = parseFloat((exBTW + btw).toFixed(2));
      const legPrijs = legger
        ? parseFloat((legger.tariefPerM2 * opp * srf(0.95, 1.05)).toFixed(2))
        : null;
      const cr = sda(da);
      const hasInv = ["afgerond", "bezig"].includes(status) && Math.random() > 0.25;
      const invPaid = hasInv && Math.random() > 0.4;
      const hist = [{ status: "ingediend", date: cr, door: "Klant" }];
      if (status !== "ingediend")
        hist.push({ status: "in behandeling", date: sda(da - 1), door: "Eigenaar" });
      if (isToe)
        hist.push({ status, date: sda(da - sri(2, 5)), door: "Eigenaar" });
      if (status === "afgerond")
        hist.push({
          status: "afgerond",
          date: sda(sri(1, Math.max(2, da - 5))),
          door: "Opleverformulier",
        });

      orders.push({
        clientName: kl.name,
        clientEmail: kl.email,
        tel: kl.tel,
        straat: kl.straat,
        postcode: kl.postcode,
        plaats: kl.plaats,
        vloerType: vloer,
        oppervlakte: opp,
        patroon: sr(SEED_PATRONEN),
        timing: sr(SEED_TIMING),
        opmerkingen:
          Math.random() > 0.6
            ? sr([
                "Vloerverwarming aanwezig.",
                "Meerdere kamers.",
                "Graag snel starten.",
                "Bestaande vloer verwijderen.",
              ])
            : "",
        status,
        statusHistory: hist,
        createdAt: cr,
        price: exBTW,
        totaalExBTW: exBTW,
        btw,
        totaalInclBTW: incl,
        toegewezenLeggerId: null, // filled after user creation
        leggerNaam: legger?.name || null,
        leggerPrijs: legPrijs,
        leggerVisible: !!legger,
        invoiceNr: hasInv
          ? `FACT-${new Date(cr).getFullYear()}-${String(ki * 3 + oi + 1).padStart(4, "0")}`
          : null,
        invoicePaid: invPaid,
        invoiceDate: hasInv ? sfmt(sda(sri(1, da))) : null,
        bron: Math.random() > 0.55 ? "website_offerte" : "direct",
        prioriteit: Math.random() > 0.88 ? "Spoed" : "Normaal",
      });

      if (["offerte verstuurd", "gepland", "bezig", "afgerond"].includes(status)) {
        offertes.push({
          clientName: kl.name,
          clientEmail: kl.email,
          vloerType: vloer,
          oppervlakte: opp,
          bedragExBTW: exBTW,
          btw,
          totaal: incl,
          status: ["gepland", "bezig", "afgerond"].includes(status)
            ? "geaccepteerd"
            : "verstuurd",
          geldigheid: 30,
          aangemaakt: cr,
          verstuurd: sda(da - 1),
          geaccepteerd: ["gepland", "bezig", "afgerond"].includes(status)
            ? sda(da - 3)
            : null,
        });
      }
    }
  });

  // Showroom
  const showroom = clients.slice(0, 12).map((k) => ({
    naam: k.name,
    email: k.email,
    tel: k.tel,
    adres: `${k.straat}, ${k.postcode} ${k.plaats}`,
    datum: sfmt(sda(sri(1, 25))),
    tijd: sr(["Ochtend (9-12)", "Middag (12-17)", "Avond (17-20)"]),
    dienst: sr(SEED_VLOER),
    status: sr(["open", "open", "afgerond", "geannuleerd"]),
    bron: "website",
    aangemeldAt: sda(sri(1, 50)),
  }));

  // Reviews
  const reviews = orders
    .filter((o) => o.status === "afgerond" && o.leggerNaam)
    .slice(0, 20)
    .map((o) => ({
      clientName: o.clientName,
      sterren: sri(3, 5),
      tekst: sr([
        "Uitstekend werk!",
        "Nette afwerking.",
        "Prima service.",
        "Goede communicatie.",
        "Vloer ziet er prachtig uit!",
        "Snel en netjes gewerkt.",
      ]),
      createdAt: sda(sri(1, 50)),
    }));

  return { leggers, clients, orders, offertes, showroom, reviews };
}

const sfmt = (iso: string) => new Date(iso).toLocaleDateString("nl-NL");

/* ═══════════════════════════════════════════════════════════════
   SUPABASE INSERTION
   ═══════════════════════════════════════════════════════════════ */

const COMPANY_ID = "11111111-1111-1111-1111-111111111111";

async function clearExistingData() {
  console.log("🧹 Clearing existing data (keeping company + settings)...");
  const tables = [
    "reviews", "showroom_aanvragen", "offertes",
    "orders", "leggers", "profiles"
  ];
  for (const t of tables) {
    const { error } = await supabase.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) console.warn(`  ⚠️ ${t}: ${error.message}`);
    else console.log(`  ✓ ${t} cleared`);
  }
}

async function createAuthUser(email: string, password: string, name: string, role: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role, company_id: COMPANY_ID },
  });
  if (error) throw new Error(`Auth create failed for ${email}: ${error.message}`);
  return data.user!.id;
}

async function seed() {
  console.log("🌱 Aurea Maison Floors — MODULES Data Migration\n");

  await clearExistingData();

  const data = generateData();
  console.log(`\n📊 Generated:`);
  console.log(`   ${data.leggers.length} leggers`);
  console.log(`   ${data.clients.length} clients`);
  console.log(`   ${data.orders.length} orders`);
  console.log(`   ${data.offertes.length} offertes`);
  console.log(`   ${data.showroom.length} showroom requests`);
  console.log(`   ${data.reviews.length} reviews`);

  // ── CREATE AUTH USERS ──
  console.log("\n👤 Creating auth users...");

  // Owner
  const ownerId = await createAuthUser(
    "eigenaar@aurea.nl", "aurea2025", "Aurea Eigenaar", "owner"
  );
  console.log(`  ✓ Owner: eigenaar@aurea.nl (${ownerId.slice(0, 8)}...)`);

  // Superadmin
  const adminId = await createAuthUser(
    "admin@aurea.nl", "admin2025", "Super Admin", "superadmin"
  );
  console.log(`  ✓ Superadmin: admin@aurea.nl (${adminId.slice(0, 8)}...)`);

  // Leggers
  const leggerIds: string[] = [];
  for (const leg of data.leggers) {
    const uid = await createAuthUser(leg.email, "legger123", leg.name, "legger");
    leggerIds.push(uid);
    console.log(`  ✓ Legger: ${leg.email} (${uid.slice(0, 8)}...)`);
  }

  // Clients
  const clientIds: string[] = [];
  for (const client of data.clients) {
    const uid = await createAuthUser(client.email, "klant123", client.name, "client");
    clientIds.push(uid);
    if (clientIds.length <= 3 || clientIds.length % 10 === 0) {
      console.log(`  ✓ Client: ${client.email} (${uid.slice(0, 8)}...)`);
    }
  }
  console.log(`  ... ${data.clients.length} clients total`);

  // Update company_id on profiles (owner + admin need explicit update)
  console.log("\n🏢 Linking profiles to company...");
  const { error: profErr } = await supabase
    .from("profiles")
    .update({ company_id: COMPANY_ID })
    .in("id", [ownerId, adminId, ...leggerIds, ...clientIds]);
  if (profErr) console.warn(`  ⚠️ Profile update: ${profErr.message}`);
  else console.log("  ✓ All profiles linked to company");

  // ── INSERT LEGGERS ──
  console.log("\n🔨 Inserting leggers...");
  for (let i = 0; i < data.leggers.length; i++) {
    const leg = data.leggers[i];
    const { error } = await supabase.from("leggers").insert({
      id: leggerIds[i], // use auth user id as legger id for simplicity
      profiel_id: leggerIds[i],
      naam: leg.name,
      email: leg.email,
      telefoon: leg.tel,
      adres: `${leg.stad}, ${leg.postcode}`,
      kvk: leg.kvk,
      btw: leg.btw,
      iban: leg.iban,
      tarief: leg.tariefPerM2,
      tier: 1,
      stad: leg.stad,
      beschikbaarheid: [],
      status: leg.status as "actief" | "inactief",
      company_id: COMPANY_ID,
    });
    if (error) console.warn(`  ⚠️ Legger ${leg.email}: ${error.message}`);
  }
  console.log(`  ✓ ${data.leggers.length} leggers inserted`);

  // ── INSERT ORDERS ──
  console.log("\n📋 Inserting orders...");
  let orderCount = 0;
  for (const o of data.orders) {
    // Find legger ID by name
    let leggerId: string | null = null;
    if (o.leggerNaam) {
      const idx = data.leggers.findIndex((l) => l.name === o.leggerNaam);
      if (idx >= 0) leggerId = leggerIds[idx];
    }

    const { error } = await supabase.from("orders").insert({
      client_name: o.clientName,
      client_email: o.clientEmail,
      straat: o.straat,
      postcode: o.postcode,
      plaats: o.plaats,
      vloer_type: o.vloerType,
      oppervlakte: o.oppervlakte,
      ondergrond: null,
      budget: o.totaalInclBTW,
      timing: o.timing,
      status: o.status as any,
      price: o.totaalInclBTW,
      invoice_nr: o.invoiceNr,
      invoice_paid: o.invoicePaid,
      invoice_paid_at: o.invoicePaid && o.invoiceDate ? new Date(o.invoiceDate).toISOString() : null,
      legger_id: leggerId,
      legger_naam: o.leggerNaam,
      legger_prijs: o.leggerPrijs,
      legger_geaccepteerd: !!leggerId,
      opmerking: o.opmerkingen,
      notes: o.prioriteit === "Spoed" ? "Spoed" : null,
      company_id: COMPANY_ID,
      created_at: o.createdAt,
      updated_at: o.createdAt,
    });
    if (error) {
      console.warn(`  ⚠️ Order ${o.clientName}: ${error.message}`);
    } else {
      orderCount++;
    }
  }
  console.log(`  ✓ ${orderCount} orders inserted`);

  // ── INSERT OFFERTES ──
  console.log("\n📄 Inserting offertes...");
  let offCount = 0;
  for (const o of data.offertes) {
    const { error } = await supabase.from("offertes").insert({
      client_name: o.clientName,
      client_email: o.clientEmail,
      vloer_type: o.vloerType,
      oppervlakte: o.oppervlakte,
      budget: o.totaal,
      status: o.status as any,
      verstuurd_at: o.verstuurd,
      geaccepteerd_at: o.geaccepteerd,
      company_id: COMPANY_ID,
      created_at: o.aangemaakt,
    });
    if (error) console.warn(`  ⚠️ Offerte ${o.clientName}: ${error.message}`);
    else offCount++;
  }
  console.log(`  ✓ ${offCount} offertes inserted`);

  // ── INSERT SHOWROOM ──
  console.log("\n🏠 Inserting showroom requests...");
  for (const s of data.showroom) {
    const { error } = await supabase.from("showroom_aanvragen").insert({
      naam: s.naam,
      email: s.email,
      telefoon: s.tel,
      adres: s.adres,
      datum_voorkeur: new Date(s.datum).toISOString().split("T")[0],
      opmerking: s.dienst,
      status: s.status as any,
      company_id: COMPANY_ID,
      created_at: s.aangemeldAt,
    });
    if (error) console.warn(`  ⚠️ Showroom ${s.naam}: ${error.message}`);
  }
  console.log(`  ✓ ${data.showroom.length} showroom requests inserted`);

  // ── INSERT REVIEWS ──
  console.log("\n⭐ Inserting reviews...");
  // Need to match reviews to actual order IDs — skip for now (too complex without order IDs)
  console.log(`  ℹ️ Skipped: requires order IDs from DB (Phase 1.2)`);

  console.log("\n✅ PHASE 1 COMPLETE — Data Migration Done!");
  console.log("\nLogin credentials:");
  console.log("  Owner:    eigenaar@aurea.nl  / aurea2025");
  console.log("  Admin:    admin@aurea.nl     / admin2025");
  console.log("  Leggers:  legger1@aurea.nl   / legger123");
  console.log("  Clients:  klant1@mail.nl     / klant123");
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
