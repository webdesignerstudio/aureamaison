import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors } from "./debug-helpers";
import { login } from "./test-helpers";

test.describe("Deep Tests — Data & CRUD", () => {
  test.setTimeout(60000);

  test("B1: Profile data loads after login", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    await expect(page.locator("body")).not.toContainText("Er is een fout opgetreden");
    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });

  test("B2: Orders page fetches data without errors", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    await page.getByRole("link", { name: "Orders" }).first().click();
    await page.waitForURL(/\/dashboard\/orders/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });

  test("B3: Order detail page loads if orders exist", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.goto("/dashboard/orders", { waitUntil: "networkidle" });

    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.locator("a").first().click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toContainText("500 Internal");
    }

    assertNoCriticalErrors(errors);
  });

  test("B5: Offerte detail page loads if offertes exist", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.goto("/dashboard/offertes", { waitUntil: "networkidle" });

    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.locator("a").first().click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toContainText("500 Internal");
    }

    assertNoCriticalErrors(errors);
  });

  test("B6: Leggers detail page loads if leggers exist", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.goto("/dashboard/leggers", { waitUntil: "networkidle" });

    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.locator("a").first().click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toContainText("500 Internal");
    }

    assertNoCriticalErrors(errors);
  });

  test("B7: Admin RPC — get_all_profiles returns data", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.goto("/admin", { waitUntil: "networkidle" });

    const usersTab = page.getByRole("button", { name: /gebruikers/i }).first();
    if (await usersTab.isVisible().catch(() => false)) {
      await usersTab.click();
      await page.waitForTimeout(500);
    }

    await expect(page.locator("body")).not.toContainText("infinite recursion");
    await expect(page.locator("body")).not.toContainText("500 Internal");
    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
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
    assertNoSupabaseErrors(errors);
  });

  test("B9: No cross-role leakage crash", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    await page.goto("/legger", { waitUntil: "networkidle" });
    await expect(page.locator("body")).not.toContainText("Application error");

    await page.goto("/client", { waitUntil: "networkidle" });
    await expect(page.locator("body")).not.toContainText("Application error");

    assertNoCriticalErrors(errors);
  });
});
