import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors } from "./debug-helpers";
import { login } from "./test-helpers";

const TEST_PREFIX = "__E2E_TEST__";

test.describe("Offertes — CRUD", () => {
  test.setTimeout(60000);

  test("F1: Offertes list loads without errors", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.getByRole("link", { name: "Offertes" }).first().click();
    await page.waitForURL(/\/dashboard\/offertes/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("Offertes");
    await expect(page.locator("body")).not.toContainText("Er is een fout opgetreden");
    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });

  test("F2: Offerte detail page loads if offertes exist", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.goto("/dashboard/offertes", { waitUntil: "networkidle" });

    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.locator("a").first().click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toContainText("500 Internal");
      await expect(page.locator("body")).not.toContainText("Application error");
    }

    assertNoCriticalErrors(errors);
  });

  test("F3: Public offerte page works", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/offerte", { waitUntil: "networkidle" });

    await expect(page.locator("h1")).toContainText("Offerte aanvragen");
    await expect(page.getByPlaceholder("Uw naam")).toBeVisible();
    await expect(page.getByPlaceholder("uw@email.nl")).toBeVisible();

    assertNoCriticalErrors(errors);
  });
});
