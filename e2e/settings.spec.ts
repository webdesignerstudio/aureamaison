import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors } from "./debug-helpers";
import { login } from "./test-helpers";

test.describe("Settings", () => {
  test.setTimeout(60000);

  test("S1: Settings page loads and shows company data", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.getByRole("link", { name: "Instellingen" }).first().click();
    await page.waitForURL(/\/dashboard\/settings/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("Instellingen");
    await expect(page.locator("body")).toContainText("Bedrijfsgegevens en factuurinstellingen");
    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });

  test("S2: Settings form fields are visible", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.getByRole("link", { name: "Instellingen" }).first().click();
    await page.waitForURL(/\/dashboard\/settings/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Wait for form to load (spinner may show first)
    const inputs = page.locator('form input');
    await inputs.nth(0).waitFor({ state: "visible", timeout: 10000 });

    await expect(inputs.nth(0)).toBeVisible(); // Bedrijfsnaam
    await expect(inputs.nth(1)).toBeVisible(); // E-mail
    await expect(inputs.nth(2)).toBeVisible(); // Telefoon
    await expect(inputs.nth(3)).toBeVisible(); // Adres
    await expect(inputs.nth(4)).toBeVisible(); // Postcode
    await expect(inputs.nth(5)).toBeVisible(); // Plaats
    await expect(inputs.nth(6)).toBeVisible(); // KvK
    await expect(inputs.nth(7)).toBeVisible(); // BTW-nummer
    await expect(inputs.nth(8)).toBeVisible(); // IBAN
    await expect(inputs.nth(9)).toBeVisible(); // BTW percentage
    await expect(inputs.nth(10)).toBeVisible(); // Betaaltermijn
    await expect(inputs.nth(11)).toBeVisible(); // Offerte geldigheid

    assertNoCriticalErrors(errors);
  });

  test("S3: Settings can be saved", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.getByRole("link", { name: "Instellingen" }).first().click();
    await page.waitForURL(/\/dashboard\/settings/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    const telField = page.locator('form input').nth(2); // Telefoon
    await telField.waitFor({ state: "visible", timeout: 10000 });
    await telField.fill("06 12345678");

    await page.getByRole("button", { name: /instellingen opslaan/i }).click();

    // Verify no crash and page still shows the form
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("body")).not.toContainText("500 Internal");

    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });
});
