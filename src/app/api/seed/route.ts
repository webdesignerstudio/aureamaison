import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

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
const sfmt = (iso: string) => new Date(iso).toLocaleDateString("nl-NL");

/* ═══════════════════════════════════════════════════════════════
   DATA GENERATION
   ═══════════════════════════════════════════════════════════════ */
function generateData() {
  const leggers: any[] = [];
  const clients: any[] = [];

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

  const orders: any[] = [];
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
        hist.push({ status: "afgerond", date: sda(sri(1, Math.max(2, da - 5))), door: "Opleverformulier" });

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
            ? sr(["Vloerverwarming aanwezig.","Meerdere kamers.","Graag snel starten.","Bestaande vloer verwijderen."])
            : "",
        status,
        statusHistory: hist,
        createdAt: cr,
        price: exBTW,
        totaalExBTW: exBTW,
        btw,
        totaalInclBTW: incl,
        toegewezenLeggerId: null,
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
          status: ["gepland", "bezig", "afgerond"].includes(status) ? "geaccepteerd" : "verstuurd",
          geldigheid: 30,
          aangemaakt: cr,
          verstuurd: sda(da - 1),
          geaccepteerd: ["gepland", "bezig", "afgerond"].includes(status) ? sda(da - 3) : null,
        });
      }
    }
  });

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

  return { leggers, clients, orders, offertes, showroom };
}

/* ═══════════════════════════════════════════════════════════════
   SEED API HANDLER
   ═══════════════════════════════════════════════════════════════ */
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json().catch(() => ({}));

    // Simple protection — require ?key=seed2025 or body.key
    const url = new URL(req.url);
    const key = url.searchParams.get("key") || body.key;
    if (key !== "seed2025") {
      return NextResponse.json({ error: "Unauthorized. Use ?key=seed2025" }, { status: 401 });
    }

    const COMPANY_ID = "11111111-1111-1111-1111-111111111111";

    // ── CLEAR EXISTING DATA ──
    const tables = ["reviews", "showroom_aanvragen", "offertes", "orders", "leggers", "profiles"];
    for (const t of tables) {
      await supabase.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    const data = generateData();

    // ── CREATE AUTH USERS ──
    const ownerId = (await supabase.auth.admin.createUser({
      email: "eigenaar@aurea.nl", password: "aurea2025", email_confirm: true,
      user_metadata: { name: "Aurea Eigenaar", role: "owner", company_id: COMPANY_ID },
    })).data.user!.id;

    const adminId = (await supabase.auth.admin.createUser({
      email: "admin@aurea.nl", password: "admin2025", email_confirm: true,
      user_metadata: { name: "Super Admin", role: "superadmin", company_id: COMPANY_ID },
    })).data.user!.id;

    const leggerIds: string[] = [];
    for (const leg of data.leggers) {
      const uid = (await supabase.auth.admin.createUser({
        email: leg.email, password: "legger123", email_confirm: true,
        user_metadata: { name: leg.name, role: "legger", company_id: COMPANY_ID },
      })).data.user!.id;
      leggerIds.push(uid);
    }

    const clientIds: string[] = [];
    for (const client of data.clients) {
      const uid = (await supabase.auth.admin.createUser({
        email: client.email, password: "klant123", email_confirm: true,
        user_metadata: { name: client.name, role: "client", company_id: COMPANY_ID },
      })).data.user!.id;
      clientIds.push(uid);
    }

    // Link profiles to company
    await supabase.from("profiles").update({ company_id: COMPANY_ID })
      .in("id", [ownerId, adminId, ...leggerIds, ...clientIds]);

    // ── INSERT LEGGERS ──
    for (let i = 0; i < data.leggers.length; i++) {
      const leg = data.leggers[i];
      await supabase.from("leggers").insert({
        id: leggerIds[i],
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
        status: leg.status,
        company_id: COMPANY_ID,
      });
    }

    // ── INSERT ORDERS ──
    let orderCount = 0;
    for (const o of data.orders) {
      let leggerId: string | null = null;
      if (o.leggerNaam) {
        const idx = data.leggers.findIndex((l: any) => l.name === o.leggerNaam);
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
        budget: o.totaalInclBTW,
        timing: o.timing,
        status: o.status,
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
      if (!error) orderCount++;
    }

    // ── INSERT OFFERTES ──
    let offCount = 0;
    for (const o of data.offertes) {
      const { error } = await supabase.from("offertes").insert({
        client_name: o.clientName,
        client_email: o.clientEmail,
        vloer_type: o.vloerType,
        oppervlakte: o.oppervlakte,
        budget: o.totaal,
        status: o.status,
        verstuurd_at: o.verstuurd,
        geaccepteerd_at: o.geaccepteerd,
        company_id: COMPANY_ID,
        created_at: o.aangemaakt,
      });
      if (!error) offCount++;
    }

    // ── INSERT SHOWROOM ──
    for (const s of data.showroom) {
      await supabase.from("showroom_aanvragen").insert({
        naam: s.naam,
        email: s.email,
        telefoon: s.tel,
        adres: s.adres,
        datum_voorkeur: new Date(s.datum).toISOString().split("T")[0],
        opmerking: s.dienst,
        status: s.status,
        company_id: COMPANY_ID,
        created_at: s.aangemeldAt,
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        users: 50,
        leggers: data.leggers.length,
        clients: data.clients.length,
        orders: orderCount,
        offertes: offCount,
        showroom: data.showroom.length,
      },
      logins: {
        owner: "eigenaar@aurea.nl / aurea2025",
        admin: "admin@aurea.nl / admin2025",
        legger: "legger1@aurea.nl / legger123",
        client: "klant1@mail.nl / klant123",
      },
    });
  } catch (err: any) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: err.message || "Seed failed" }, { status: 500 });
  }
}
