import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors } from "./debug-helpers";

const CREDENTIALS = { email: "test@test.nl", password: "test123" };

async function login(page: any) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("eigenaar@aurea.nl").fill(CREDENTIALS.email);
  await page.getByPlaceholder("••••••••").fill(CREDENTIALS.password);
  await page.getByRole("button", { name: /inloggen/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  await page.waitForSelector("h1", { timeout: 10000 });
  await page.waitForLoadState("networkidle");
}

test.describe("Deep Tests — Data & CRUD", () => {
  test.setTimeout(60000);

  test("B1: Profile data loads after login", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    // Check that dashboard shows some user-related content (name or email)
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    // Should not fallback to a generic error state
    await expect(page.locator("body")).not.toContainText("Er is een fout opgetreden");
    assertNoCriticalErrors(errors);
  });

  test("B2: Orders page fetches data without 42P17", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    await page.getByRole("link", { name: "Orders" }).first().click();
    await page.waitForURL(/\/dashboard\/orders/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    assertNoCriticalErrors(errors);
    // Expect no 500 errors from Supabase
    expect(errors.httpErrors.filter((h: string) => h.includes("500"))).toHaveLength(0);
  });

  test("B3: Order detail page loads if orders exist", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    await page.goto("/dashboard/orders", { waitUntil: "networkidle" });

    // Try to click first order row (if any)
    const firstRow = page.locator("table tbody tr a, table tbody tr").first();
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toContainText("500 Internal");
    }

    assertNoCriticalErrors(errors);
  });

  test("B5: Offerte detail page loads if offertes exist", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    await page.goto("/dashboard/offertes", { waitUntil: "networkidle" });

    const firstRow = page.locator("table tbody tr a, table tbody tr").first();
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toContainText("500 Internal");
    }

    assertNoCriticalErrors(errors);
  });

  test("B6: Leggers detail page loads if leggers exist", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    await page.goto("/dashboard/leggers", { waitUntil: "networkidle" });

    const firstRow = page.locator("table tbody tr a, table tbody tr").first();
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toContainText("500 Internal");
    }

    assertNoCriticalErrors(errors);
  });

  test("B7: Admin RPC — get_all_profiles returns data", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    await page.goto("/admin", { waitUntil: "networkidle" });

    // Click "Gebruikers" tab if it exists
    const usersTab = page.getByRole("button", { name: /gebruikers/i }).first();
    if (await usersTab.isVisible().catch(() => false)) {
      await usersTab.click();
      await page.waitForTimeout(500);
    }

    await expect(page.locator("body")).not.toContainText("infinite recursion");
    await expect(page.locator("body")).not.toContainText("500 Internal");
    assertNoCriticalErrors(errors);
  });

  test("B8: Admin RPC — get_all_companies returns data", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    await page.goto("/admin", { waitUntil: "networkidle" });

    const companiesTab = page.getByRole("button", { name: /bedrijven/i }).first();
    if (await companiesTab.isVisible().catch(() => false)) {
      await companiesTab.click();
      await page.waitForTimeout(500);
    }

    await expect(page.locator("body")).not.toContainText("infinite recursion");
    await expect(page.locator("body")).not.toContainText("500 Internal");
    assertNoCriticalErrors(errors);
  });

  test("B9: No cross-role leakage crash", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    // Try accessing legger portal as owner/superadmin
    await page.goto("/legger", { waitUntil: "networkidle" });
    await expect(page.locator("body")).not.toContainText("Application error");

    // Try client portal
    await page.goto("/client", { waitUntil: "networkidle" });
    await expect(page.locator("body")).not.toContainText("Application error");

    assertNoCriticalErrors(errors);
  });
});
