import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors } from "./debug-helpers";
import { login, openOrderForm, fillOrderForm, cleanupTestOrders } from "./test-helpers";

const TEST_PREFIX = "__E2E_TEST__";

test.describe("Orders — CRUD", () => {
  test.setTimeout(60000);

  test.afterAll(async () => {
    await cleanupTestOrders(TEST_PREFIX);
  });

  test("O1: Orders list loads without errors", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.getByRole("link", { name: "Orders" }).first().click();
    await page.waitForURL(/\/dashboard\/orders/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("Orders");
    await expect(page.locator("body")).not.toContainText("Er is een fout opgetreden");
    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });

  test("O2: Create a new order and see it in the list", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await openOrderForm(page);

    const testName = `${TEST_PREFIX} Order ${Date.now()}`;
    await fillOrderForm(page, {
      client_name: testName,
      client_email: "test-order@example.com",
      straat: "Teststraat 1",
      postcode: "1234 AB",
      plaats: "Teststad",
      vloer_type: "Hout",
      oppervlakte: "50",
      ondergrond: "Beton",
      budget: "5000",
      timing: "Binnen 2 weken",
      opmerking: "E2E test order",
    });

    await page.getByRole("button", { name: /order aanmaken/i }).click();
    await expect(page.locator("body")).toContainText("Order succesvol aangemaakt");
    await page.waitForLoadState("networkidle");

    // Verify it appears in the list
    await expect(page.locator("table tbody")).toContainText(testName);

    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });

  test("O3: Order detail page loads if orders exist", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.goto("/dashboard/orders", { waitUntil: "networkidle" });

    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.locator("a").first().click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toContainText("500 Internal");
      await expect(page.locator("body")).not.toContainText("Application error");
    }

    assertNoCriticalErrors(errors);
  });

  test("O4: Order form validates required fields", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await openOrderForm(page);

    // Try submitting empty form
    const submitBtn = page.getByRole("button", { name: /order aanmaken/i });
    await submitBtn.click();

    // Required fields should still be invalid (browser validation)
    const nameInput = page.locator('form input').first();
    await expect(nameInput).toHaveAttribute("required", "");

    assertNoCriticalErrors(errors);
  });
});
