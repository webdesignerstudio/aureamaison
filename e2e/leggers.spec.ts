import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors } from "./debug-helpers";
import { login } from "./test-helpers";

test.describe("Leggers", () => {
  test.setTimeout(60000);

  test("L1: Leggers list loads without errors", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.getByRole("link", { name: "Leggers" }).first().click();
    await page.waitForURL(/\/dashboard\/leggers/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("Leggers");
    await expect(page.locator("body")).not.toContainText("Er is een fout opgetreden");
    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });

  test("L2: Legger detail page loads if leggers exist", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.goto("/dashboard/leggers", { waitUntil: "networkidle" });

    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.locator("a").first().click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toContainText("500 Internal");
      await expect(page.locator("body")).not.toContainText("Application error");
    }

    assertNoCriticalErrors(errors);
  });
});
