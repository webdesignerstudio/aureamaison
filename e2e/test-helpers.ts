import type { Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

export const CREDENTIALS = { email: "test@test.nl", password: "test123" };

export const TEST_CLIENT = { email: "klant@test.nl", password: "test123" };
export const TEST_LEGGER = { email: "legger@test.nl", password: "test123" };
export const DEFAULT_COMPANY_ID = "11111111-1111-1111-1111-111111111111";

export function isAdminApiAvailable() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function cleanupTestOrders(prefix = "__E2E_TEST__") {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[cleanupTestOrders] skipped — missing env vars");
    return;
  }
  const sb = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await sb.from("orders").delete().ilike("client_name", `${prefix}%`);
  if (error) {
    console.warn("[cleanupTestOrders] failed:", error.message);
  } else {
    console.log("[cleanupTestOrders] done");
  }
}

export async function login(page: Page) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("eigenaar@aurea.nl").fill(CREDENTIALS.email);
  await page.getByPlaceholder("••••••••").fill(CREDENTIALS.password);
  await page.getByRole("button", { name: /inloggen/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  await page.waitForSelector("h1", { timeout: 10000 });
  await page.waitForLoadState("networkidle");
}

export async function logout(page: Page) {
  const logoutBtn = page.getByRole("button", { name: /uitloggen|logout/i }).first();
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();
    await page.waitForURL(/\/login/, { timeout: 10000 });
  }
}

export async function openOrderForm(page: Page) {
  await page.getByRole("link", { name: "Orders" }).first().click();
  await page.waitForURL(/\/dashboard\/orders/, { timeout: 10000 });
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /nieuwe order/i }).click();
}

export async function fillOrderForm(page: Page, data: {
  client_name: string;
  client_email: string;
  straat?: string;
  postcode?: string;
  plaats?: string;
  vloer_type?: string;
  oppervlakte?: string;
  ondergrond?: string;
  budget?: string;
  timing?: string;
  opmerking?: string;
}) {
  const inputs = page.locator('form input, form textarea');
  await inputs.nth(0).fill(data.client_name);
  await inputs.nth(1).fill(data.client_email);
  if (data.straat) await inputs.nth(2).fill(data.straat);
  if (data.postcode) await inputs.nth(3).fill(data.postcode);
  if (data.plaats) await inputs.nth(4).fill(data.plaats);
  if (data.vloer_type) await inputs.nth(5).fill(data.vloer_type);
  if (data.oppervlakte) await inputs.nth(6).fill(data.oppervlakte);
  if (data.ondergrond) await inputs.nth(7).fill(data.ondergrond);
  if (data.budget) await inputs.nth(8).fill(data.budget);
  if (data.timing) await inputs.nth(9).fill(data.timing);
  if (data.opmerking) await inputs.nth(10).fill(data.opmerking);
}

export async function openOfferteForm(page: Page) {
  await page.getByRole("link", { name: "Offertes" }).first().click();
  await page.waitForURL(/\/dashboard\/offertes/, { timeout: 10000 });
  await page.waitForLoadState("networkidle");
}

export async function navigateTo(page: Page, label: string, pathRegex: RegExp) {
  await page.getByRole("link", { name: label }).first().click();
  await page.waitForURL(pathRegex, { timeout: 10000 });
  await page.waitForLoadState("networkidle");
}

/* ── SUPABASE ADMIN ACCOUNT HELPERS ─────────────────────────── */

export async function createTestUser(
  email: string,
  password: string,
  role: "client" | "legger" | "owner",
  name?: string
) {
  const sb = getAdminSupabase();

  // Delete existing user with same email first
  const { data: existingList } = await sb.auth.admin.listUsers();
  const existing = (existingList?.users as any[] | undefined)?.find((u: any) => u.email === email);
  if (existing) {
    await sb.auth.admin.deleteUser(existing.id);
    // Cascade delete handles profiles/leggers
  }

  const { data, error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: name || email.split("@")[0],
      role,
      company_id: DEFAULT_COMPANY_ID,
      onboarding_status: role === "legger" ? "pending" : "approved",
    },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create test user: ${error?.message || "unknown"}`);
  }

  const userId = data.user.id;

  // For leggers: set onboarding to approved and insert leggers row
  if (role === "legger") {
    await sb.from("profiles")
      .update({ onboarding_status: "approved" })
      .eq("id", userId);

    await sb.from("leggers").insert({
      profiel_id: userId,
      naam: name || email.split("@")[0],
      email,
      company_id: DEFAULT_COMPANY_ID,
      status: "actief",
      tier: 1,
    });
  }

  console.log(`[createTestUser] ${role} ${email} -> ${userId}`);
  return { id: userId, email, role };
}

export async function deleteTestUser(email: string) {
  const sb = getAdminSupabase();
  const { data: list } = await sb.auth.admin.listUsers();
  const user = (list?.users as any[] | undefined)?.find((u: any) => u.email === email);
  if (!user) return;

  await sb.auth.admin.deleteUser(user.id);
  console.log(`[deleteTestUser] ${email} -> ${user.id}`);
}

export async function cleanupAllTestData() {
  const sb = getAdminSupabase();

  const { data: list } = await sb.auth.admin.listUsers();
  const e2eUsers = ((list?.users as any[] | undefined) || []).filter((u: any) => u.email?.startsWith("e2e-"));

  for (const user of e2eUsers) {
    await sb.auth.admin.deleteUser(user.id).catch((e: any) =>
      console.warn(`[cleanup] failed to delete ${user.email}:`, e.message)
    );
  }

  // Also clean up any e2e test orders
  const { error } = await sb.from("orders")
    .delete()
    .ilike("client_email", "e2e-%");
  if (error) console.warn("[cleanup] orders delete failed:", error.message);

  console.log(`[cleanupAllTestData] removed ${e2eUsers.length} users`);
}

export async function seedTestOrder(data: {
  client_name: string;
  client_email: string;
  vloer_type?: string;
  oppervlakte?: number;
  straat?: string;
  postcode?: string;
  plaats?: string;
  status?: string;
  legger_id?: string;
  legger_naam?: string;
  company_id?: string;
}) {
  const sb = getAdminSupabase();

  const { data: order, error } = await sb.from("orders").insert({
    client_name: data.client_name,
    client_email: data.client_email,
    vloer_type: data.vloer_type || "PVC",
    oppervlakte: data.oppervlakte || 50,
    straat: data.straat || "Teststraat 1",
    postcode: data.postcode || "1234 AB",
    plaats: data.plaats || "Amsterdam",
    status: data.status || "gepland",
    legger_id: data.legger_id || null,
    legger_naam: data.legger_naam || null,
    company_id: data.company_id || DEFAULT_COMPANY_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select().single();

  if (error) throw new Error(`seedTestOrder failed: ${error.message}`);
  console.log(`[seedTestOrder] created ${order.id} for ${data.client_email}`);
  return order;
}

/* ── ROLE LOGIN HELPERS ───────────────────────────────────── */

export async function loginAsClient(page: Page, email = TEST_CLIENT.email, password = TEST_CLIENT.password) {
  await page.goto("/client/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("uw@email.nl").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /inloggen/i }).click();

  // Wait a moment for auth to process
  await page.waitForTimeout(2000);
  const body = String(await page.locator("body").textContent().catch(() => ""));

  // If still on login page with error, account doesn't exist or credentials wrong
  if (page.url().includes("/client/login") || page.url().includes("/login")) {
    if (body.includes("Invalid login") || body.includes("inloggen mislukt") || body.includes("rate limit")) {
      throw new Error(
        `Cannot login as ${email}. Account does not exist or Supabase rate limit active. ` +
        `Run "npx playwright test e2e/registratie.spec.ts" first to create test accounts. ` +
        `If rate limit error, wait 1-2 hours and retry.`
      );
    }
  }

  await page.waitForURL(/\/client/, { timeout: 30000 });
  await page.waitForLoadState("networkidle");
}

export async function loginAsLegger(page: Page, email = TEST_LEGGER.email, password = TEST_LEGGER.password) {
  await page.goto("/legger/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("uw@email.nl").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /inloggen/i }).click();

  // Wait a moment for auth to process
  await page.waitForTimeout(2000);
  const body = String(await page.locator("body").textContent().catch(() => ""));

  // If still on login page with error, account doesn't exist or credentials wrong
  if (page.url().includes("/legger/login") || page.url().includes("/login")) {
    if (body.includes("Invalid login") || body.includes("inloggen mislukt") || body.includes("rate limit")) {
      throw new Error(
        `Cannot login as ${email}. Account does not exist or Supabase rate limit active. ` +
        `Run "npx playwright test e2e/registratie.spec.ts" first to create test accounts. ` +
        `If rate limit error, wait 1-2 hours and retry.`
      );
    }
  }

  await page.waitForURL(/\/legger/, { timeout: 30000 });
  await page.waitForLoadState("networkidle");
}

/* ── UI REGISTRATION HELPERS (no Admin API needed) ─────────── */

export async function registerClient(page: Page, email: string, password: string, name: string) {
  // Try login first — if it works, user already exists
  try {
    await loginAsClient(page, email, password);
    console.log(`[registerClient] ${email} already exists, logged in`);
    return;
  } catch { /* user doesn't exist yet — proceed with registration */ }

  await page.goto("/client/registratie", { waitUntil: "networkidle" });

  // Check for rate-limit error already visible on page
  const body = String(await page.locator("body").textContent().catch(() => ""));
  if (body.includes("rate limit") || body.includes("overloaded")) {
    throw new Error(`Supabase rate limit hit for ${email} — cannot register`);
  }

  await page.locator('input[placeholder="Uw naam"]').fill(name);
  await page.locator('input[placeholder="uw@email.nl"]').first().fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /Registreren/i }).click();

  // Wait for either redirect to login OR rate-limit error
  await page.waitForTimeout(2000);
  const url = page.url();
  const bodyAfter = String(await page.locator("body").textContent().catch(() => ""));
  if (bodyAfter.includes("rate limit") || bodyAfter.includes("overloaded")) {
    throw new Error(`Supabase rate limit hit for ${email} — cannot register`);
  }
  if (!url.includes("/client/login")) {
    throw new Error(`Registration did not redirect to login for ${email}. Current URL: ${url}`);
  }
  console.log(`[registerClient] ${email} registered`);
}

export async function registerLegger(page: Page, email: string, password: string, name: string) {
  // Try login first
  try {
    await loginAsLegger(page, email, password);
    console.log(`[registerLegger] ${email} already exists, logged in`);
    return;
  } catch (e: any) {
    // Check if it's a pending approval error (user exists but not approved)
    const body = String(await page.locator("body").textContent().catch(() => ""));
    if (body.includes("afwachting van goedkeuring")) {
      console.log(`[registerLegger] ${email} already exists but pending approval`);
      return;
    }
    // Otherwise proceed with registration
  }

  await page.goto("/legger/registratie", { waitUntil: "networkidle" });

  // Check for rate-limit
  const bodyPre = String(await page.locator("body").textContent().catch(() => ""));
  if (bodyPre.includes("rate limit") || bodyPre.includes("overloaded")) {
    throw new Error(`Supabase rate limit hit for ${email} — cannot register`);
  }

  // Step 1
  await page.locator('input[placeholder="Uw naam"]').fill(name);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /Volgende/i }).click();

  // Step 2
  await page.locator('input[placeholder="Straat + huisnummer"]').fill("Teststraat 5");
  await page.locator('input[placeholder="Plaats"]').fill("Rotterdam");
  await page.locator('input[placeholder="06 12345678"]').fill("0612345678");
  await page.getByRole("button", { name: /Volgende/i }).click();

  // Step 3
  await page.locator('input[placeholder="12345678"]').fill("12345678");
  await page.locator('input[placeholder="NL123456789B01"]').fill("NL123456789B01");
  await page.locator('input[placeholder="NL00 BANK 0000 0000 00"]').fill("NL00TEST1234567890");
  await page.locator('input[placeholder="25.00"]').fill("28.50");
  await page.getByRole("button", { name: /Aanmelding indienen/i }).click();

  // Wait for success screen or rate limit
  await page.waitForTimeout(2000);
  const bodyAfter = String(await page.locator("body").textContent().catch(() => ""));
  if (bodyAfter.includes("rate limit") || bodyAfter.includes("overloaded")) {
    throw new Error(`Supabase rate limit hit for ${email} — cannot register`);
  }
  await page.waitForSelector('h1:has-text("Aanvraag ingediend")', { timeout: 10000 });
  console.log(`[registerLegger] ${email} registered`);
}

/* ── UI ORDER HELPERS (no Admin API needed) ───────────────── */

export async function createOrderViaUI(
  page: Page,
  data: {
    vloer_type: string;
    oppervlakte: string;
    straat?: string;
    postcode?: string;
    plaats?: string;
    ondergrond?: string;
    timing?: string;
    opmerking?: string;
  }
) {
  await page.goto("/client/opdracht", { waitUntil: "networkidle" });
  await page.getByLabel(/Vloertype/i).fill(data.vloer_type);
  await page.getByLabel(/Oppervlakte/i).fill(data.oppervlakte);
  if (data.straat) await page.getByLabel(/Straat/i).fill(data.straat);
  if (data.postcode) await page.getByLabel(/Postcode/i).fill(data.postcode);
  if (data.plaats) await page.getByLabel(/Plaats/i).fill(data.plaats);
  if (data.ondergrond) await page.getByLabel(/Ondergrond/i).fill(data.ondergrond);
  if (data.timing) await page.getByLabel(/Gewenste timing/i).fill(data.timing);
  if (data.opmerking) await page.getByLabel(/Opmerking/i).fill(data.opmerking);
  await page.getByRole("button", { name: /Opdracht indienen/i }).click();
  await page.waitForURL(/\/client/, { timeout: 10000 });
  await page.waitForLoadState("networkidle");
}
