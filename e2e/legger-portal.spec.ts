import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors } from "./debug-helpers";
import { registerLegger } from "./test-helpers";

const TEST_EMAIL = "legger@test.nl";
const TEST_PASSWORD = "test123";

test("Legger Portal — Level 1+2: Registration and pending-login error", async ({ page }) => {
  test.setTimeout(120000);
  const errors = captureErrors(page);

  // L1: Register via UI (or skip if already exists/pending)
  await registerLegger(page, TEST_EMAIL, TEST_PASSWORD, "E2E Legger");

  // After registration, legger sees success screen (pending approval)
  // If user was already registered, we may be on login page instead
  const heading = String(await page.locator("h1").textContent().catch(() => ""));
  if (heading.includes("Aanvraag ingediend")) {
    await expect(page.locator("body")).toContainText("afwachting van goedkeuring");
  }

  // L2: Pending legger login shows correct error
  await page.goto("/legger/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(TEST_EMAIL);
  await page.locator('input[type="password"]').fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /inloggen/i }).click();

  // Should show pending approval message
  await expect(page.locator("body")).toContainText("afwachting van goedkeuring");

  assertNoCriticalErrors(errors);
  assertNoSupabaseErrors(errors);
});
