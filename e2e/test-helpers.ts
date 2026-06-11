import type { Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

export const CREDENTIALS = { email: "test@test.nl", password: "test123" };

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
