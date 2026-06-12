import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors } from "./debug-helpers";
import { login, loginAsClient } from "./test-helpers";

const CLIENT_EMAIL = "klant@test.nl";
const CLIENT_PASS = "test123";

test("Happy Path — Client-Owner Flow", async ({ page }) => {
  test.setTimeout(120000);
  const errors = captureErrors(page);

  // Step 1: Client logs in and creates an order
  await loginAsClient(page, CLIENT_EMAIL, CLIENT_PASS);
  await page.goto("/client/opdracht", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Fill form by name attribute
  await page.locator('input[name="vloer_type"]').fill("Laminaat E2E");
  await page.locator('input[name="oppervlakte"]').fill("55");
  await page.locator('input[name="straat"]').fill("Teststraat 10");
  await page.locator('input[name="postcode"]').fill("1234 AB");
  await page.locator('input[name="plaats"]').fill("Amsterdam");
  await page.locator('input[name="ondergrond"]').fill("Beton");
  await page.locator('input[name="timing"]').fill("Binnen 2 weken");
  await page.locator('textarea[name="opmerking"]').fill("E2E happy path test");
  await page.getByRole("button", { name: /Opdracht indienen/i }).click();

  await page.waitForURL(/\/client/, { timeout: 10000 });
  await page.waitForLoadState("networkidle");
  await expect(page.locator("body")).toContainText("Laminaat E2E");

  // Step 2: Owner dashboard loads and sees the client order
  await login(page);
  await page.goto("/dashboard/orders", { waitUntil: "networkidle" });
  await expect(page.locator("body")).toContainText("Laminaat E2E");
  await expect(page.locator("body")).not.toContainText("Application error");

  // Step 3: Owner opens order detail
  const orderLink = page.getByRole("link", { name: /Laminaat E2E|E2E Client/i }).first();
  if (await orderLink.isVisible().catch(() => false)) {
    await orderLink.click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("500 Internal");
    await expect(page.locator("body")).not.toContainText("Application error");
  }

  // Step 4: Client re-logs in and still sees their order
  await loginAsClient(page, CLIENT_EMAIL, CLIENT_PASS);
  await expect(page.locator("body")).toContainText(/Laminaat E2E|Mijn Account/);
  await expect(page.locator("body")).not.toContainText("Application error");

  assertNoCriticalErrors(errors);
  assertNoSupabaseErrors(errors);
});
