import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors } from "./debug-helpers";
import { login } from "./test-helpers";

test.describe("Klanten", () => {
  test.setTimeout(60000);

  test("K1: Klanten page loads without errors", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.getByRole("link", { name: "Klanten" }).first().click();
    await page.waitForURL(/\/dashboard\/klanten/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("Klanten");
    await expect(page.locator("body")).not.toContainText("Er is een fout opgetreden");
    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });

  test("K2: Klanten page shows client data derived from orders", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.getByRole("link", { name: "Klanten" }).first().click();
    await page.waitForURL(/\/dashboard\/klanten/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Wait for content to load (table or empty state)
    const table = page.locator("table thead");
    await expect(table.or(page.getByText("Geen klanten gevonden."))).toBeVisible();

    if (await table.isVisible().catch(() => false)) {
      await expect(table).toContainText("Naam");
      await expect(table).toContainText("Email");
      await expect(table).toContainText("Orders");
      await expect(table).toContainText("Totale omzet");
    } else {
      await expect(page.locator("body")).toContainText("Geen klanten gevonden.");
    }

    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });
});
