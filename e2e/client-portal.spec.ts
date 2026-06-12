import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors } from "./debug-helpers";
import { loginAsClient } from "./test-helpers";

const TEST_EMAIL = "klant@test.nl";
const TEST_PASSWORD = "test123";

test("Client Portal — Level 1+2: Login, navigate and create order", async ({ page }) => {
  test.setTimeout(120000);
  const errors = captureErrors(page);

  // Login (account should already exist from a prior run)
  await loginAsClient(page, TEST_EMAIL, TEST_PASSWORD);

  // C1: Dashboard loads
  await expect(page.locator("h1")).toContainText(/Klant Portaal|Mijn Account/);
  await expect(page.locator("body")).not.toContainText("Application error");

  // C2: Navigate to profile
  await page.goto("/client/profiel", { waitUntil: "networkidle" });
  await expect(page.locator("body")).not.toContainText("Application error");

  // C2: Navigate to opdracht
  await page.goto("/client/opdracht", { waitUntil: "networkidle" });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await expect(page.locator("h1")).toContainText(/Nieuwe Opdracht|Opdracht/, { timeout: 10000 });

  // C3: Create order — fill form fields by placeholder since labels may vary
  await page.locator('input[name="vloer_type"], input[placeholder*="Vloer"]').fill("PVC E2E Test");
  await page.locator('input[name="oppervlakte"]').fill("45");
  await page.locator('input[name="straat"]').fill("Teststraat 10");
  await page.locator('input[name="postcode"]').fill("1234 AB");
  await page.locator('input[name="plaats"]').fill("Amsterdam");
  await page.locator('input[name="ondergrond"]').fill("Betonvloer");
  await page.locator('input[name="timing"]').fill("Binnen 2 weken");
  await page.locator('textarea[name="opmerking"]').fill("E2E test opmerking");

  await page.getByRole("button", { name: /Opdracht indienen/i }).click();

  // Redirect to /client
  await page.waitForURL(/\/client/, { timeout: 10000 });
  await page.waitForLoadState("networkidle");

  // Verify order appears in list
  await expect(page.locator("body")).toContainText("PVC E2E Test");

  assertNoCriticalErrors(errors);
  assertNoSupabaseErrors(errors);
});
