import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors } from "./debug-helpers";

const regClientEmail = "klant@test.nl";
const regLeggerEmail = "legger@test.nl";

test.describe.serial("UI Registratie Flows", () => {
  test.setTimeout(60000);

  test("R1: Client can register via UI", async ({ page }) => {
    const errors = captureErrors(page);

    await page.goto("/client/registratie", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("Registreren");

    // Fill registration form
    await page.locator('input[placeholder="Uw naam"]').fill("E2E Registratie Client");
    await page.locator('input[placeholder="uw@email.nl"]').first().fill(regClientEmail);
    await page.locator('input[type="password"]').fill("test123");

    await page.getByRole("button", { name: /Registreren/i }).click();

    // Should redirect to client login
    await page.waitForURL(/\/client\/login/, { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Klant Portaal");

    assertNoCriticalErrors(errors);
  });

  test("R2: Legger can register via UI (3-step form)", async ({ page }) => {
    const errors = captureErrors(page);

    await page.goto("/legger/registratie", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("Aanmelden als Legger");

    // Step 1: Basic info
    await page.locator('input[placeholder="Uw naam"]').fill("E2E Registratie Legger");
    await page.locator('input[type="email"]').fill(regLeggerEmail);
    await page.locator('input[type="password"]').fill("test123");
    await page.getByRole("button", { name: /Volgende/i }).click();

    // Step 2: Address & phone
    await page.locator('input[placeholder="Straat + huisnummer"]').fill("Teststraat 5");
    await page.locator('input[placeholder="Plaats"]').fill("Rotterdam");
    await page.locator('input[placeholder="06 12345678"]').fill("0612345678");
    await page.getByRole("button", { name: /Volgende/i }).click();

    // Step 3: Business details
    await page.locator('input[placeholder="12345678"]').fill("12345678");
    await page.locator('input[placeholder="NL123456789B01"]').fill("NL123456789B01");
    await page.locator('input[placeholder="NL00 BANK 0000 0000 00"]').fill("NL00TEST1234567890");
    await page.locator('input[placeholder="25.00"]').fill("28.50");

    await page.getByRole("button", { name: /Aanmelding indienen/i }).click();

    // Should show success screen
    await expect(page.locator("h1")).toContainText("Aanvraag ingediend");
    await expect(page.locator("body")).toContainText("afwachting van goedkeuring");

    assertNoCriticalErrors(errors);
  });
});
