import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors } from "./debug-helpers";
import { CREDENTIALS } from "./test-helpers";

test.describe("Legacy Login E2E", () => {
  test.setTimeout(90000);

  test("Login flow with test account", async ({ page }) => {
    const errors = captureErrors(page);

    await page.goto("/login", { waitUntil: "networkidle" });
    await page.waitForSelector('button[type="submit"]', { timeout: 10000 });

    await page.getByPlaceholder("eigenaar@aurea.nl").fill(CREDENTIALS.email);
    await page.getByPlaceholder("••••••••").fill(CREDENTIALS.password);

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    await page.waitForSelector("h1", { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/dashboard/);
    assertNoCriticalErrors(errors);
  });

  test("Auth callback route works", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/auth/callback?code=invalid", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/login/);
    assertNoCriticalErrors(errors);
  });
});
